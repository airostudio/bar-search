// Session handling for bar-owner accounts. Bar owners authenticate against
// Supabase Auth (see lib/supabaseClient.js), but authorization for every
// subsequent request is our own signed, expiring cookie carrying their
// Supabase user id + email — the same signed-cookie approach as
// lib/adminAuth.js, generalized to carry a payload instead of just an
// expiry. We never hand the browser a Supabase access token or the anon
// key; all Supabase access happens server-side with the service_role key.
import crypto from "node:crypto";

export const OWNER_COOKIE_NAME = "findahbar_owner";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function isOwnerAuthConfigured() {
  return Boolean(
    process.env.SESSION_SECRET && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createOwnerSessionCookieValue({ id, email }) {
  const payload = Buffer.from(JSON.stringify({ id, email, exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyOwnerSession(cookieValue) {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  let expectedSig;
  try {
    expectedSig = sign(payload);
  } catch {
    return null;
  }
  if (!timingSafeEqualStr(sig, expectedSig)) return null;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data.exp || data.exp < Date.now()) return null;
  return { id: data.id, email: data.email };
}

export function ownerFromRequest(request) {
  return verifyOwnerSession(request.cookies.get(OWNER_COOKIE_NAME)?.value);
}
