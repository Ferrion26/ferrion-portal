import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Volle, aufsteigend sortierte Zeitreihe für einen einzelnen metricKey —
// Grundlage für Diagramm, Werte-Tabelle und Ursprungs-Anzeige im
// Daten-Browser (/admin/managed-reports/[id]/data).
export async function GET(_req: Request, { params }: { params: { id: string; key: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const metricKey = decodeURIComponent(params.key);
  const points = await prisma.managedServiceMetric.findMany({
    where: { subscriptionId: params.id, metricKey },
    orderBy: { recordedAt: "asc" },
    include: {
      ingestion: { select: { id: true, source: true, receivedAt: true, fileName: true } },
      edits: { orderBy: { editedAt: "asc" } },
    },
  });

  if (points.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    metricKey,
    points: points.map((p) => ({
      id: p.id,
      value: p.value,
      unit: p.unit,
      recordedAt: p.recordedAt,
      edited: p.edited,
      lastEditedAt: p.lastEditedAt,
      ingestion: {
        id: p.ingestion.id,
        source: p.ingestion.source,
        receivedAt: p.ingestion.receivedAt,
        fileName: p.ingestion.fileName,
      },
      edits: p.edits.map((e) => ({
        previousValue: e.previousValue,
        newValue: e.newValue,
        reason: e.reason,
        editedByEmail: e.editedByEmail,
        editedAt: e.editedAt,
      })),
    })),
  });
}
