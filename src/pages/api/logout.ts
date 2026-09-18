import type { APIRoute } from 'astro';
import { AT_COOKIE, RT_COOKIE } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(AT_COOKIE, { path: '/' });
  cookies.delete(RT_COOKIE, { path: '/' });
  return redirect('/login', 302);
};
