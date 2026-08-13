import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/managed-reports/apiKey";
import { ingestPayloadSchema } from "@/lib/managed-reports/ingestSchema";
import { reconcileFindings, alarmSamplesToFindings, componentFaultsToFindings } from "@/lib/managed-reports/reconcileFindings";
import { buildDeviceUpdate } from "@/lib/managed-reports/applyIngest";
import { runExtractors } from "@/lib/managed-reports/extractors";

export async function POST(req: NextRequest) {
  const apiKeyHeader = req.headers.get("x-api-key");
  if (!apiKeyHeader) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const keyHash = hashApiKey(apiKeyHeader);
  const apiKey = await prisma.collectorApiKey.findUnique({
    where: { keyHash },
    include: { subscription: { select: { productSlug: true } } },
  });

  if (!apiKey || apiKey.revokedAt) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ingestPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { collectedAt, metrics, meta } = parsed.data;
  const recordedAt = new Date(collectedAt);
  const deviceUpdate = buildDeviceUpdate(parsed.data);

  // Zusätzlich zu den vom Collector fertig berechneten Kennzahlen: neue
  // Kennzahlen, die das Portal selbst aus meta.rawEndpoints ableitet — ohne
  // dass dafür ein neuer Collector ausgerollt werden muss, siehe
  // src/lib/managed-reports/extractors. Rein additiv, kein Eingriff in die
  // vom Collector gesendeten Werte.
  const extracted = runExtractors(apiKey.subscription.productSlug, meta?.rawEndpoints ?? {});
  const allMetrics = [...metrics, ...extracted];

  const [, ingestion] = await prisma.$transaction([
    prisma.collectorApiKey.update({
      where: { id: apiKey.id },
      data: { lastSeenAt: new Date() },
    }),
    prisma.collectorIngestion.create({
      data: {
        subscriptionId: apiKey.subscriptionId,
        apiKeyId: apiKey.id,
        payload: parsed.data as unknown as object,
        metrics: {
          create: allMetrics.map((m) => ({
            subscriptionId: apiKey.subscriptionId,
            metricKey: m.key,
            value: m.value,
            unit: m.unit,
            recordedAt,
          })),
        },
      },
    }),
    ...(Object.keys(deviceUpdate).length > 0
      ? [
          prisma.managedServiceSubscription.update({
            where: { id: apiKey.subscriptionId },
            data: deviceUpdate,
          }),
        ]
      : []),
  ]);

  // Historie separat abgleichen statt im selben Schreibvorgang zu
  // überschreiben — nicht kritisch für die Transaktionsatomarität der
  // eigentlichen Metrik-Speicherung oben.
  if (meta?.alarmSamples) {
    await reconcileFindings(apiKey.subscriptionId, "ALARM", alarmSamplesToFindings(meta.alarmSamples));
  }
  if (meta?.componentFaults) {
    await reconcileFindings(apiKey.subscriptionId, "COMPONENT_FAULT", componentFaultsToFindings(meta.componentFaults));
  }

  return NextResponse.json({ id: ingestion.id, metricsStored: allMetrics.length }, { status: 201 });
}
