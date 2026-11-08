import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "sgela-web", time: new Date().toISOString() });
}
