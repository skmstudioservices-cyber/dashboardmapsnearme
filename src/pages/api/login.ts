import type { APIRoute } from 'astro';
import { AT_COOKIE, RT_COOKIE, loginWithPassword } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url, locals }) => {
  const env = locals.runtime?.env;
  const form = await request.formData().catch(() => null);
  const email = String(form?.get('email') ?? '').trim();
  const password = String(form?.get('password') ?? '');

  if (!env?.SUPABASE_URL || !email || !password) {
    return redirect('/login?e=1', 302);
  }

  const session = await loginWithPassword(env, email, password);
  if (!session) {
    return redirect('/login?e=1', 302);
  }

  const secure = url.protocol === 'https:';
  cookies.set(AT_COOKIE, session.access_token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 60 * 60,
  });
  cookies.set(RT_COOKIE, session.refresh_token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect('/', 302);
};
