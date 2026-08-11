import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Rohes Ingest-Payload (inkl. meta.rawEndpoints, falls vorhanden) für die
// "Rohdaten anzeigen"-Ansicht im Daten-Browser — zeigt den Ursprung eines
// Werts jenseits von Quelle/Zeitpunkt.
export async function GET(_req: Request, { params }: { params: { id: string; ingestionId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ingestion = await prisma.collectorIngestion.findUnique({ where: { id: params.ingestionId } });
  if (!ingestion || ingestion.subscriptionId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: ingestion.id,
    source: ingestion.source,
    receivedAt: ingestion.receivedAt,
    fileName: ingestion.fileName,
    payload: ingestion.payload,
  });
}
