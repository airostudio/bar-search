// Shared Supabase (Postgres + Auth) access — server-side only. The
// service_role key bypasses Row Level Security and Auth email confirmation,
// so this must never be imported from a "use client" component; it's only
// ever reached from API route handlers. See supabase/schema.sql.

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

// PostgREST (the `venues`, `venue_claims`, `venue_specials`, `venue_overrides` tables).
// cache: "no-store" is essential — without it, Next.js's fetch data cache
// can serve a stale response (e.g. a GET issued before a row existed) to
// later requests for the same URL, which reads like data loss.
export async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase request failed: ${res.status} ${detail.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// GoTrue (Supabase Auth) — bar-owner accounts. We call this server-side with
// the service_role key so signup can go through the Admin API
// (POST admin/users with email_confirm: true), skipping the "check your
// email" step entirely — the owner can log in immediately after signing up.
export async function supabaseAuthRequest(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error_description || data.msg || data.error || `Auth request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}
