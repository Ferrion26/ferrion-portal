import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getCollectorBaseline, saveCollectorBaseline } from "@/lib/settings";
import { KNOWN_COLLECTOR_VERSIONS } from "@/lib/managed-reports/collectorVersions";

export const dynamic = "force-dynamic";

// Nur eine tatsächlich existierende Collector-Version (siehe
// collector/versions.json) darf als Baseline gesetzt werden — verhindert
// Tippfehler, die die Warnung für veraltete Collector unbemerkt außer Kraft
// setzen würden.
const KNOWN_VERSION_STRINGS = KNOWN_COLLECTOR_VERSIONS.map((v) => v.version);
const putSchema = z.object({
  minVersion: z
    .string()
    .refine((v) => KNOWN_VERSION_STRINGS.includes(v), "Unbekannte Collector-Version.")
    .nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ minVersion: await getCollectorBaseline() });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  await saveCollectorBaseline(parsed.data.minVersion);
  return NextResponse.json({ minVersion: parsed.data.minVersion });
}
