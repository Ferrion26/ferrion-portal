import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ingestPayloadSchema } from "@/lib/managed-reports/ingestSchema";

export const dynamic = "force-dynamic";

// Manuelle Alternative zu POST /api/collector/ingest für Standorte ohne
// Netzwerkweg zur Ingestion-API (z. B. air-gapped/isolierte Umgebungen):
// der Collector läuft dort im --export-dir-Modus und schreibt Dateien im
// selben Format, die hier per Admin-Login hochgeladen werden — ein API-Key
// ist dafür nicht nötig, die Admin-Session übernimmt die Authentifizierung.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscription = await prisma.managedServiceSubscription.findUnique({ where: { id: params.id } });
  if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Keine Dateien übermittelt." }, { status: 400 });
  }

  const results: { fileName: string; ok: boolean; metricsStored?: number; error?: string }[] = [];

  for (const file of files) {
    try {
      const text = await file.text();
      const parsed = ingestPayloadSchema.safeParse(JSON.parse(text));
      if (!parsed.success) {
        results.push({ fileName: file.name, ok: false, error: "Ungültiges Format (erwartet: {collectedAt, metrics[]})" });
        continue;
      }

      const { collectedAt, metrics, meta } = parsed.data;
      const recordedAt = new Date(collectedAt);

      await prisma.collectorIngestion.create({
        data: {
          subscriptionId: params.id,
          source: "MANUAL_UPLOAD",
          payload: parsed.data,
          metrics: {
            create: metrics.map((m) => ({
              subscriptionId: params.id,
              metricKey: m.key,
              value: m.value,
              unit: m.unit,
              recordedAt,
            })),
          },
        },
      });

      if (meta?.deviceSerialNumber) {
        await prisma.managedServiceSubscription.update({
          where: { id: params.id },
          data: { deviceSerialNumber: meta.deviceSerialNumber },
        });
      }

      results.push({ fileName: file.name, ok: true, metricsStored: metrics.length });
    } catch (err) {
      results.push({ fileName: file.name, ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler" });
    }
  }

  return NextResponse.json({ results });
}
