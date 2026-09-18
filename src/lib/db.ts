// ============================================================
// Dashboard DATA LAYER — the ONLY file that touches the databases.
// Supabase REST (PostgREST) with the logged-in user's JWT, so RLS
// policies decide what is visible (super_admin only for private
// tables). D1 (SEO_DB) for internal search keywords.
// ============================================================

export interface Business {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  avg_rating?: number | null;
  is_verified?: boolean;
  city?: { name: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state?: string | null;
}

export interface ClaimRequest {
  id: string;
  proof_text?: string | null;
  proof_url?: string | null;
  status?: string | null;
  created_at?: string;
  business?: { name?: string } | null;
}

export interface PrivateFeedback {
  id: string;
  rating?: number | null;
  message?: string | null;
  reviewer_name?: string | null;
  reviewer_email?: string | null;
  status?: string | null;
  created_at?: string;
  business?: { name?: string } | null;
}

export interface SiteFeedback {
  id: string;
  page_url?: string | null;
  type?: string | null;
  message?: string | null;
  contact_email?: string | null;
  status?: string | null;
  created_at?: string;
}

export interface DashboardStats {
  businesses: number;
  cities: number;
  categories: number;
  claims: number;
  privateFeedback: number;
  siteFeedback: number;
  reviews: number;
}

async function sb(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<Response | null> {
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  try {
    return await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    return null;
  }
}

async function count(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string,
  table: string
): Promise<number> {
  const r = await sb(env, token, `${table}?select=id&limit=1`, {
    headers: { Prefer: 'count=exact' },
  });
  if (!r || !r.ok) return -1;
  const total = r.headers.get('content-range')?.split('/')[1];
  return total ? Number(total) || 0 : -1;
}

export async function getStats(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string
): Promise<DashboardStats> {
  const [businesses, cities, categories, claims, privateFeedback, siteFeedback, reviews] =
    await Promise.all([
      count(env, token, 'businesses'),
      count(env, token, 'cities'),
      count(env, token, 'categories'),
      count(env, token, 'claim_requests'),
      count(env, token, 'private_feedback'),
      count(env, token, 'site_feedback'),
      count(env, token, 'reviews'),
    ]);
  return { businesses, cities, categories, claims, privateFeedback, siteFeedback, reviews };
}

export async function listBusinesses(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string,
  citySlug?: string
): Promise<Business[]> {
  const select =
    'id,name,slug,address,phone,avg_rating,is_verified,city:cities(name,slug),category:categories(name,slug)';
  let q = `businesses?select=${select}&order=name.asc&limit=200`;
  if (citySlug) {
    const cities = await sb(env, token, `cities?select=id&slug=eq.${encodeURIComponent(citySlug)}`);
    if (!cities || !cities.ok) return [];
    const rows = (await cities.json()) as Array<{ id: string }>;
    if (!rows[0]) return [];
    q += `&city_id=eq.${rows[0].id}`;
  }
  const r = await sb(env, token, q);
  if (!r || !r.ok) return [];
  return (await r.json()) as Business[];
}

export async function listCities(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string
): Promise<City[]> {
  const r = await sb(env, token, 'cities?select=id,name,slug,state&order=name.asc');
  if (!r || !r.ok) return [];
  return (await r.json()) as City[];
}

export async function listClaims(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string
): Promise<ClaimRequest[]> {
  const r = await sb(
    env,
    token,
    'claim_requests?select=id,proof_text,proof_url,status,created_at,business:businesses(name)&order=created_at.desc&limit=100'
  );
  if (!r || !r.ok) return [];
  return (await r.json()) as ClaimRequest[];
}

export async function listPrivateFeedback(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string
): Promise<PrivateFeedback[]> {
  const r = await sb(
    env,
    token,
    'private_feedback?select=id,rating,message,reviewer_name,reviewer_email,status,created_at,business:businesses(name)&order=created_at.desc&limit=100'
  );
  if (!r || !r.ok) return [];
  return (await r.json()) as PrivateFeedback[];
}

export async function listSiteFeedback(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  token: string
): Promise<SiteFeedback[]> {
  const r = await sb(
    env,
    token,
    'site_feedback?select=id,page_url,type,message,contact_email,status,created_at&order=created_at.desc&limit=100'
  );
  if (!r || !r.ok) return [];
  return (await r.json()) as SiteFeedback[];
}
