import { defineMiddleware } from 'astro:middleware';
import { AT_COOKIE, RT_COOKIE, refreshSession, verifyAccessToken } from './lib/auth';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
const PUBLIC_PATHS = ['/login', '/api/login', '/api/logout', '/favicon.svg', '/robots.txt'];

export const onRequest = defineMiddleware(async (context, next) => {
  let path = context.url.pathname;
  if (BASE && (path === BASE || path.startsWith(BASE + '/'))) {
    path = path.slice(BASE.length) || '/';
  }
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/')) || path.startsWith('/_')) {
    return next();
  }

  const env = context.locals.runtime?.env;
  if (!env?.SUPABASE_URL) return context.redirect(`${BASE}/login`);

  const at = context.cookies.get(AT_COOKIE)?.value;
  if (at) {
    const user = await verifyAccessToken(env, at);
    if (user) {
      context.locals.user = user;
      return next();
    }
  }

  const rt = context.cookies.get(RT_COOKIE)?.value;
  if (rt) {
    const refreshed = await refreshSession(env, rt);
    if (refreshed) {
      const secure = context.url.protocol === 'https:';
      context.cookies.set(AT_COOKIE, refreshed.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: 60 * 60,
      });
      context.cookies.set(RT_COOKIE, refreshed.refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: 60 * 60 * 24 * 7,
      });
      context.locals.user = refreshed.user;
      return next();
    }
  }

  return context.redirect(`${BASE}/login`);
});
