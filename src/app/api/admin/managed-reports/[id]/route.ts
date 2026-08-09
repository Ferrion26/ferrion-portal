import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  // Freitext, den ein Admin manuell pflegt, um eine Beziehung zu einem
  // anderen System zu dokumentieren (z. B. "Snapshots werden von
  // OceanProtect X8000 repliziert"), der im Bericht als Hinweiszeile erscheint.
  replicationNote: z.string().max(500).nullable().optional(),
  // Wie viele Tage Rohdaten (Kennzahlen, Ingestions, behobene Findings) für
  // diese Subscription aufbewahrt werden, bevor der Cleanup-Cron sie löscht.
  // null = unbegrenzt.
  metricsRetentionDays: z.number().int().min(1).max(3650).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Nur tatsächlich mitgeschickte Felder aktualisieren — beide Formulare
  // (Hinweis, Aufbewahrungsfrist) rufen denselben Endpunkt getrennt auf.
  const data: Record<string, unknown> = {};
  if ("replicationNote" in body) data.replicationNote = parsed.data.replicationNote;
  if ("metricsRetentionDays" in body) data.metricsRetentionDays = parsed.data.metricsRetentionDays;

  const subscription = await prisma.managedServiceSubscription.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(subscription);
}
