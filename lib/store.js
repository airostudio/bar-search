// Persistent storage for community-submitted venues.
//
// Priority order:
//   1. Supabase (Postgres) — SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. Recommended:
//      a real, durable database you can inspect/query directly in the Supabase
//      dashboard. See supabase/schema.sql for the table definition.
//   2. Upstash Redis — KV_REST_API_URL + KV_REST_API_TOKEN (or the
//      UPSTASH_REDIS_REST_* equivalents). Still supported for existing setups.
//   3. In-memory — fine for local dev, but resets on every server
//      restart/redeploy. Set one of the above before relying on this in
//      production. See README.md.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const PENDING_KEY = "findahbar:venues:pending";
const APPROVED_KEY = "findahbar:venues:approved";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

// In-memory fallback state (per server instance only).
const memory = { pending: new Map(), approved: new Map(), rateLimit: new Map() };

// ---------------------------------------------------------------------------
// Supabase (Postgres via PostgREST) — used server-side only. The service_role
// key bypasses Row Level Security, so this must never be imported from a
// "use client" component; it's only ever reached from API route handlers.
// ---------------------------------------------------------------------------

const VENUES_TABLE = "venues";

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
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

function rowToVenue(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    countryCode: row.country_code,
    city: row.city,
    address: row.address || undefined,
    description: row.description || undefined,
    lat: row.lat,
    lng: row.lng,
    submittedAt: row.submitted_at ? new Date(row.submitted_at).getTime() : undefined,
    source: row.source || "community",
  };
}

async function supabaseListByStatus(status) {
  const rows = (await supabaseRequest(`${VENUES_TABLE}?status=eq.${status}&order=submitted_at.desc`)) || [];
  return rows.map(rowToVenue);
}

async function supabaseInsert(venue) {
  const row = {
    id: venue.id,
    name: venue.name,
    category: venue.category,
    country_code: venue.countryCode,
    city: venue.city,
    address: venue.address ?? null,
    description: venue.description ?? null,
    lat: venue.lat,
    lng: venue.lng,
    status: "pending",
    source: venue.source || "community",
    submitted_at: new Date(venue.submittedAt || Date.now()).toISOString(),
  };
  await supabaseRequest(VENUES_TABLE, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
}

async function supabaseUpdateStatus(id, status) {
  const rows = await supabaseRequest(`${VENUES_TABLE}?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status }),
  });
  return Boolean(rows && rows.length > 0);
}

async function supabaseDelete(id) {
  await supabaseRequest(`${VENUES_TABLE}?id=eq.${id}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

// ---------------------------------------------------------------------------
// Upstash Redis / in-memory fallback
// ---------------------------------------------------------------------------

async function redis(command) {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Redis command failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

function memoryMap(key) {
  return key === PENDING_KEY ? memory.pending : memory.approved;
}

async function hgetall(key) {
  if (!hasRedis) return [...memoryMap(key).values()].map((v) => JSON.parse(v));
  const flat = (await redis(["HGETALL", key])) || [];
  const out = [];
  for (let i = 0; i < flat.length; i += 2) out.push(JSON.parse(flat[i + 1]));
  return out;
}

async function hset(key, id, jsonValue) {
  if (!hasRedis) {
    memoryMap(key).set(id, jsonValue);
    return;
  }
  await redis(["HSET", key, id, jsonValue]);
}

async function hdel(key, id) {
  if (!hasRedis) {
    memoryMap(key).delete(id);
    return;
  }
  await redis(["HDEL", key, id]);
}

export const store = {
  isPersistent: hasSupabase || hasRedis,
  backend: hasSupabase ? "supabase" : hasRedis ? "redis" : "memory",

  listPending() {
    if (hasSupabase) return supabaseListByStatus("pending");
    return hgetall(PENDING_KEY);
  },

  listApproved() {
    if (hasSupabase) return supabaseListByStatus("approved");
    return hgetall(APPROVED_KEY);
  },

  async submit(venue) {
    if (hasSupabase) return supabaseInsert(venue);
    await hset(PENDING_KEY, venue.id, JSON.stringify(venue));
  },

  async approve(id) {
    if (hasSupabase) return supabaseUpdateStatus(id, "approved");
    if (!hasRedis) {
      const raw = memory.pending.get(id);
      if (!raw) return false;
      memory.pending.delete(id);
      memory.approved.set(id, raw);
      return true;
    }
    const raw = await redis(["HGET", PENDING_KEY, id]);
    if (!raw) return false;
    await redis(["HSET", APPROVED_KEY, id, raw]);
    await redis(["HDEL", PENDING_KEY, id]);
    return true;
  },

  async reject(id) {
    if (hasSupabase) {
      await supabaseDelete(id);
      return true;
    }
    await hdel(PENDING_KEY, id);
    return true;
  },

  // Simple per-IP submission cap. Redis-backed in production (persists
  // across serverless invocations); in-memory elsewhere as a soft fallback.
  // Independent of the venue storage backend above.
  async rateLimitOk(ip) {
    if (!ip) return true;
    if (hasRedis) {
      const key = `findahbar:ratelimit:${ip}`;
      const count = await redis(["INCR", key]);
      if (count === 1) await redis(["EXPIRE", key, String(RATE_LIMIT_WINDOW_SECONDS)]);
      return count <= RATE_LIMIT_MAX;
    }
    const now = Date.now();
    const entry = memory.rateLimit.get(ip);
    if (!entry || entry.resetAt < now) {
      memory.rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 });
      return true;
    }
    entry.count += 1;
    return entry.count <= RATE_LIMIT_MAX;
  },
};
