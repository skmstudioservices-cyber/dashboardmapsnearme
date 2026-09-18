// Supabase Auth helpers — server-side only.
// Cookie names: skb_at (access token, ~1h), skb_rt (refresh token).

export const AT_COOKIE = 'skb_at';
export const RT_COOKIE = 'skb_rt';

export interface SessionUser {
  id: string;
  email?: string;
}

interface AuthEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

function base(env: AuthEnv): string {
  return (env.SUPABASE_URL || '').replace(/\/$/, '');
}

function headers(env: AuthEnv, token?: string): Record<string, string> {
  const h: Record<string, string> = {
    apikey: env.SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function loginWithPassword(
  env: AuthEnv,
  email: string,
  password: string
): Promise<{ access_token: string; refresh_token: string; user: SessionUser } | null> {
  try {
    const r = await fetch(`${base(env)}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: headers(env),
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (!data?.access_token) return null;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: { id: data.user?.id, email: data.user?.email },
    };
  } catch {
    return null;
  }
}

export async function refreshSession(
  env: AuthEnv,
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string; user: SessionUser } | null> {
  try {
    const r = await fetch(`${base(env)}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: headers(env),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (!data?.access_token) return null;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? refreshToken,
      user: { id: data.user?.id, email: data.user?.email },
    };
  } catch {
    return null;
  }
}

export async function verifyAccessToken(
  env: AuthEnv,
  accessToken: string
): Promise<SessionUser | null> {
  try {
    const r = await fetch(`${base(env)}/auth/v1/user`, {
      headers: headers(env, accessToken),
    });
    if (!r.ok) return null;
    const user = await r.json();
    return { id: user?.id, email: user?.email };
  } catch {
    return null;
  }
}
