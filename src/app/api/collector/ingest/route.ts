import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/managed-reports/apiKey";
import { ingestPayloadSchema } from "@/lib/managed-reports/ingestSchema";
import { reconcileFindings, alarmSamplesToFindings, componentFaultsToFindings } from "@/lib/managed-reports/reconcileFindings";
import { buildDeviceUpdate } from "@/lib/managed-reports/applyIngest";

export async function POST(req: NextRequest) {
  const apiKeyHeader = req.headers.get("x-api-key");
  if (!apiKeyHeader) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const keyHash = hashApiKey(apiKeyHeader);
  const apiKey = await prisma.collectorApiKey.findUnique({
    where: { keyHash },
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
          create: metrics.map((m) => ({
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

  return NextResponse.json({ id: ingestion.id, metricsStored: metrics.length }, { status: 201 });
}
