// Persistent storage for community-submitted venues.
//
// Uses Upstash Redis (via a Vercel KV / Upstash integration, or raw Upstash)
// when KV_REST_API_URL + KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_*
// equivalents) are configured. Falls back to an in-memory store otherwise —
// fine for local dev, but resets on every server restart/redeploy, so set
// the env vars before relying on this in production. See README.md.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const PENDING_KEY = "baratlas:venues:pending";
const APPROVED_KEY = "baratlas:venues:approved";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

// In-memory fallback state (per server instance only).
const memory = { pending: new Map(), approved: new Map(), rateLimit: new Map() };

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
  isPersistent: hasRedis,

  listPending: () => hgetall(PENDING_KEY),
  listApproved: () => hgetall(APPROVED_KEY),

  async submit(venue) {
    await hset(PENDING_KEY, venue.id, JSON.stringify(venue));
  },

  async approve(id) {
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
    await hdel(PENDING_KEY, id);
    return true;
  },

  // Simple per-IP submission cap. Redis-backed in production (persists
  // across serverless invocations); in-memory elsewhere as a soft fallback.
  async rateLimitOk(ip) {
    if (!ip) return true;
    if (hasRedis) {
      const key = `baratlas:ratelimit:${ip}`;
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
