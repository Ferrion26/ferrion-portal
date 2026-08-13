import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Sammel-Löschen mehrerer Ingestions auf einmal (Checkbox-Mehrfachauswahl im
// Admin-Bereich). ManagedServiceMetric.ingestionId hat kein onDelete:
// Cascade (siehe schema.prisma) — anders als der Retention-Cron
// (cleanupOldData.ts, der Ingestions nur löscht wenn keine Kennzahl mehr
// übrig ist) soll ein Admin, der eine Ingestion bewusst löscht, auch deren
// Kennzahlen mitlöschen. subscriptionId wird bei beiden Deletes mitgefiltert,
// damit über die Query keine fremden Ingestions gelöscht werden können.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const ingestionIds: unknown = body?.ingestionIds;
  if (!Array.isArray(ingestionIds) || ingestionIds.length === 0 || !ingestionIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "ingestionIds fehlt oder ist leer" }, { status: 400 });
  }

  const deletedCount = await prisma.$transaction(async (tx) => {
    await tx.managedServiceMetric.deleteMany({
      where: { ingestionId: { in: ingestionIds }, subscriptionId: params.id },
    });
    const result = await tx.collectorIngestion.deleteMany({
      where: { id: { in: ingestionIds }, subscriptionId: params.id },
    });
    return result.count;
  });

  return NextResponse.json({ ok: true, deletedCount });
}
