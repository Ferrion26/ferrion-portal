import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/managed-reports/apiKey";
import { z } from "zod";

// Generic, product-agnostic ingestion payload — a collector running at a
// customer site (any product, not just OceanProtect) pushes metric readings
// here. Product-specific meaning (labels, units, chart grouping) lives in
// src/lib/managed-reports/metrics/*, not in this schema.
const ingestSchema = z.object({
  collectedAt: z.string().datetime(),
  metrics: z
    .array(
      z.object({
        key: z.string().min(1).max(100),
        value: z.number(),
        unit: z.string().max(20).optional(),
      })
    )
    .min(1)
    .max(200),
});

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
  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { collectedAt, metrics } = parsed.data;
  const recordedAt = new Date(collectedAt);

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
  ]);

  return NextResponse.json({ id: ingestion.id, metricsStored: metrics.length }, { status: 201 });
}
