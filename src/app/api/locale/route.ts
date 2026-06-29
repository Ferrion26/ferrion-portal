export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  const valid = locale === "en" ? "en" : "de";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("locale", valid, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
