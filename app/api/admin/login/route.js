import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionCookieValue,
  isAdminConfigured,
  ADMIN_COOKIE_NAME,
} from "../../../../lib/adminAuth";

export async function POST(request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured on this deployment. Set ADMIN_PASSWORD." },
      { status: 503 }
    );
  }

  const { password } = await request.json().catch(() => ({}));
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
