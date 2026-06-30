import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getHeroLight, saveHeroLight } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await getHeroLight();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const saved = await saveHeroLight(body as Record<string, unknown>);
    return NextResponse.json(saved);
  } catch (err) {
    console.error("Failed to save hero settings:", err);
    // Most likely the SiteSetting table hasn't been migrated yet.
    return NextResponse.json(
      { error: "Settings table not available. Run `npm run db:push`." },
      { status: 503 }
    );
  }
}
