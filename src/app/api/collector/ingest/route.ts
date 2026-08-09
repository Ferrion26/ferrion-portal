import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/managed-reports/apiKey";
import { ingestPayloadSchema } from "@/lib/managed-reports/ingestSchema";

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
  const deviceUpdate: Record<string, unknown> = {};
  if (meta?.deviceSerialNumber) deviceUpdate.deviceSerialNumber = meta.deviceSerialNumber;
  if (meta?.deviceModel) deviceUpdate.deviceModel = meta.deviceModel;
  if (meta?.deviceSoftwareVersion) deviceUpdate.deviceSoftwareVersion = meta.deviceSoftwareVersion;
  if (meta?.alarmSamples) deviceUpdate.recentAlarms = meta.alarmSamples;

  const [, ingestion] = await prisma.$transaction([
    prisma.collectorApiKey.update({
      where: { id: apiKey.id },
      data: { lastSeenAt: new Date() },
    }),
    prisma.collectorIngestion.create({
      data: {
        subscriptionId: apiKey.subscriptionId,
        apiKeyId: apiKey.id,
        payload: parsed.data,
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

  return NextResponse.json({ id: ingestion.id, metricsStored: metrics.length }, { status: 201 });
}
