import { NextResponse } from "next/server";
import { supabaseAuthRequest } from "../../../../lib/supabaseClient";
import { createOwnerSessionCookieValue, isOwnerAuthConfigured, OWNER_COOKIE_NAME } from "../../../../lib/ownerAuth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request) {
  if (!isOwnerAuthConfigured()) {
    return NextResponse.json(
      { error: "Bar owner accounts aren't configured on this deployment yet." },
      { status: 503 }
    );
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "A valid email and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  try {
    // Admin-created + pre-confirmed, so the owner can log in immediately —
    // no "check your email" step.
    await supabaseAuthRequest("admin/users", { email, password, email_confirm: true });
    const login = await supabaseAuthRequest("token?grant_type=password", { email, password });

    const res = NextResponse.json({ ok: true, email: login.user.email });
    res.cookies.set(OWNER_COOKIE_NAME, createOwnerSessionCookieValue({ id: login.user.id, email: login.user.email }), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    const message = /already.*registered|already exists/i.test(err.message)
      ? "An account with that email already exists — log in instead."
      : err.message || "Sign-up failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
