import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getCollectorBaseline, saveCollectorBaseline } from "@/lib/settings";

export const dynamic = "force-dynamic";

const putSchema = z.object({
  minVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Format MAJOR.MINOR.PATCH, z. B. 1.2.0")
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
