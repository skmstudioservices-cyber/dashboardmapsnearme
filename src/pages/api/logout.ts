import type { APIRoute } from 'astro';
import { AT_COOKIE, RT_COOKIE } from '../../lib/auth';

export const prerender = false;

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(AT_COOKIE, { path: '/' });
  cookies.delete(RT_COOKIE, { path: '/' });
  return redirect(`${BASE}/login`, 302);
};
