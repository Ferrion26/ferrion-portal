import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  newValue: z.number(),
  // Pflichtfeld — das "Entsperren"-Gate im Daten-Browser lässt sich nur mit
  // einer Begründung speichern, damit jede Korrektur nachvollziehbar bleibt.
  reason: z.string().min(1).max(500),
});

// Korrigiert einen einzelnen erfassten Messwert ("entsperren" → editieren im
// Daten-Browser). Schreibt value direkt (aggregate.ts liest value
// unverändert, künftige Berichte übernehmen den korrigierten Wert
// automatisch), protokolliert die Änderung aber in
// ManagedServiceMetricEdit — bereits erzeugte Bericht-Snapshots
// (QuarterlyReport.summary) bleiben davon unberührt.
export async function PATCH(req: Request, { params }: { params: { id: string; metricId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const metric = await prisma.managedServiceMetric.findUnique({ where: { id: params.metricId } });
  if (!metric || metric.subscriptionId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [, updated] = await prisma.$transaction([
    prisma.managedServiceMetricEdit.create({
      data: {
        metricId: metric.id,
        previousValue: metric.value,
        newValue: parsed.data.newValue,
        reason: parsed.data.reason,
        editedByEmail: session.user.email!,
      },
    }),
    prisma.managedServiceMetric.update({
      where: { id: metric.id },
      data: { value: parsed.data.newValue, edited: true, lastEditedAt: new Date() },
    }),
  ]);

  return NextResponse.json(updated);
}
