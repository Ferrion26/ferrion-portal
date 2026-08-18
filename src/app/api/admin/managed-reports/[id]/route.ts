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
  // Physischer Standort des Geräts (z. B. "Rechenzentrum Nonntal"), von
  // einem Admin manuell gepflegt.
  location: z.string().max(200).nullable().optional(),
  // Wie viele Tage Rohdaten (Kennzahlen, Ingestions, behobene Findings) für
  // diese Subscription aufbewahrt werden, bevor der Cleanup-Cron sie löscht.
  // null = unbegrenzt.
  metricsRetentionDays: z.number().int().min(1).max(3650).nullable().optional(),
  // Lebenszyklus-Status + optionales End-of-Life-Datum, von einem Admin
  // manuell gepflegt — nicht collector-erhoben (siehe LifecycleStatus in
  // prisma/schema.prisma).
  lifecycleStatus: z.enum(["ACTIVE", "PHASING_OUT", "END_OF_LIFE"]).nullable().optional(),
  lifecycleEndDate: z.coerce.date().nullable().optional(),
  // Ansprechpartner für dieses System, von einem Admin manuell gepflegt.
  contactName: z.string().max(200).nullable().optional(),
  contactRole: z.string().max(200).nullable().optional(),
  contactEmail: z.string().max(200).nullable().optional(),
  contactPhone: z.string().max(100).nullable().optional(),
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
  if ("location" in body) data.location = parsed.data.location;
  if ("metricsRetentionDays" in body) data.metricsRetentionDays = parsed.data.metricsRetentionDays;
  if ("lifecycleStatus" in body) data.lifecycleStatus = parsed.data.lifecycleStatus;
  if ("lifecycleEndDate" in body) data.lifecycleEndDate = parsed.data.lifecycleEndDate;
  if ("contactName" in body) data.contactName = parsed.data.contactName;
  if ("contactRole" in body) data.contactRole = parsed.data.contactRole;
  if ("contactEmail" in body) data.contactEmail = parsed.data.contactEmail;
  if ("contactPhone" in body) data.contactPhone = parsed.data.contactPhone;

  const subscription = await prisma.managedServiceSubscription.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(subscription);
}
