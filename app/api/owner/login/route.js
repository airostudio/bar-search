import { NextResponse } from "next/server";
import { supabaseAuthRequest } from "../../../../lib/supabaseClient";
import { createOwnerSessionCookieValue, isOwnerAuthConfigured, OWNER_COOKIE_NAME } from "../../../../lib/ownerAuth";
import { withErrorHandling } from "../../../../lib/apiError";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const POST = withErrorHandling(async (request) => {
  if (!isOwnerAuthConfigured()) {
    return NextResponse.json(
      { error: "Bar owner accounts aren't configured on this deployment yet." },
      { status: 503 }
    );
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
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
  } catch {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
});

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(OWNER_COOKIE_NAME);
  return res;
}
