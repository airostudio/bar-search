import { NextResponse } from "next/server";
import { store } from "../../../../lib/store";
import { isAdminRequest } from "../../../../lib/adminAuth";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pending = await store.listPending();
  pending.sort((a, b) => b.submittedAt - a.submittedAt);
  return NextResponse.json({ pending, persistent: store.isPersistent });
}
