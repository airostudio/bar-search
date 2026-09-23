import { NextResponse } from "next/server";
import { store } from "../../../../lib/store";
import { isAdminRequest } from "../../../../lib/adminAuth";
import { withErrorHandling } from "../../../../lib/apiError";

export const GET = withErrorHandling(async (request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pending = await store.listPending();
  pending.sort((a, b) => b.submittedAt - a.submittedAt);
  return NextResponse.json({ pending, persistent: store.isPersistent, backend: store.backend });
});
