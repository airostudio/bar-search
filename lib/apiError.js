// Wraps a Next.js Route Handler so an unexpected thrown error (e.g. a
// missing Supabase table, a network hiccup) becomes a real JSON error
// response instead of an empty 500 body that crashes client-side JSON
// parsing. Every route that touches lib/store.js or lib/ownerStore.js
// should use this.
import { NextResponse } from "next/server";

export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("API route error:", err);
      return NextResponse.json({ error: "Something went wrong on the server. Please try again." }, { status: 500 });
    }
  };
}
