import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  // Kommentar setzen → Punkt wird bestätigt ("Kontrolliert geschlossen").
  // null → Bestätigung zurückziehen (Korrektur eines Versehens).
  comment: z.string().min(1).max(1000).nullable(),
});

// Bestätigt einen Alarm/Component-Fault ("Kontrolliert geschlossen") mit
// Pflicht-Kommentar, oder zieht eine Bestätigung zurück (comment: null).
// Bleibt über künftige Collector-Läufe hinweg bestehen, solange derselbe
// Punkt durchgehend gemeldet wird (siehe reconcileFindings.ts) — wirkt sich
// erst auf künftig neu erstellte Berichte aus, nicht auf bereits
// generierte QuarterlyReport-Snapshots.
export async function PATCH(req: Request, { params }: { params: { id: string; findingId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const finding = await prisma.deviceFinding.findUnique({ where: { id: params.findingId } });
  if (!finding || finding.subscriptionId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.deviceFinding.update({
    where: { id: finding.id },
    data:
      parsed.data.comment === null
        ? { acknowledgedAt: null, acknowledgedByEmail: null, acknowledgedComment: null }
        : { acknowledgedAt: new Date(), acknowledgedByEmail: session.user.email!, acknowledgedComment: parsed.data.comment },
  });

  return NextResponse.json(updated);
}
