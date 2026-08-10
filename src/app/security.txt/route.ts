import { NextResponse } from "next/server";

// Legacy-Fallback für Scanner, die /security.txt statt des kanonischen
// /.well-known/security.txt abfragen (siehe RFC 9116 §3).
export function GET(req: Request) {
  return NextResponse.redirect(new URL("/.well-known/security.txt", req.url), 308);
}
