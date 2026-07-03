import { NextResponse } from "next/server";
import { store } from "../../../../lib/store";
import { isAdminRequest } from "../../../../lib/adminAuth";

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { action } = await request.json().catch(() => ({}));
  const { id } = params;

  if (action === "approve") {
    const ok = await store.approve(id);
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (action === "reject") {
    await store.reject(id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
