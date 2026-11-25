import { NextResponse } from "next/server";

/** Browser clients use the authenticated API proxy; raw backend tokens are never returned. */
export function GET() {
  return NextResponse.json({ error: "Use the authenticated API proxy." }, { status: 410, headers: { "Cache-Control": "no-store, private" } });
}
