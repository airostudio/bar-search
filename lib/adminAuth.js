// Minimal admin session handling for the /admin moderation queue.
// A signed, expiring cookie — no session store, no extra dependency.
import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "baratlas_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(payload) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  return timingSafeEqualStr(password, expected);
}

export function createSessionCookieValue() {
  const payload = String(Date.now() + SESSION_TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(cookieValue) {
  if (!cookieValue) return false;
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  let expectedSig;
  try {
    expectedSig = sign(payload);
  } catch {
    return false;
  }
  if (!timingSafeEqualStr(sig, expectedSig)) return false;
  return Number(payload) > Date.now();
}

export function isAdminRequest(request) {
  return isValidSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
