# dashboardmapsnearme

Admin dashboard for mapsnearme — internal tool, login required.

- **Stack**: Astro 4 (SSR) on Cloudflare Workers + Supabase Auth (RLS: super_admin) + D1 seo-keywords-db (internal search analytics)
- **Login**: Supabase email/password → httpOnly cookies (access 1h + refresh 7d), middleware guard on every page
- **Pages**: Overview (live counts), Businesses (city filter), Claim requests, Feedback (private + site), Search keywords (top + zero-result gaps)
- **Data layer rule**: `src/lib/db.ts` is the ONLY file that touches Supabase; D1 reads use the `SEO_DB` binding
- **Deploy**: push to main → GitHub Actions → `wrangler deploy` (needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets)
- **URL**: dashboardmapsnearme.india-in.workers.dev

noindex — never submit to search engines.
