import { prisma } from "@/lib/prisma";
import { getMetricDefinitions, MetricDefinition } from "./metrics";

export interface QuarterSummaryEntry {
  key: string;
  label: MetricDefinition["label"];
  unit?: string;
  format: MetricDefinition["format"];
  section: MetricDefinition["section"];
  trendGood?: MetricDefinition["trendGood"];
  value: number;
  previousValue?: number;
}

function aggregateValues(values: number[], aggregation: MetricDefinition["aggregation"]) {
  if (values.length === 0) return null;
  switch (aggregation) {
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "last":
      return values[values.length - 1];
  }
}

async function aggregatePeriod(subscriptionId: string, start: Date, end: Date, definitions: MetricDefinition[]) {
  const readings = await prisma.managedServiceMetric.findMany({
    where: { subscriptionId, recordedAt: { gte: start, lt: end } },
    orderBy: { recordedAt: "asc" },
    select: { metricKey: true, value: true },
  });

  const byKey = new Map<string, number[]>();
  for (const r of readings) {
    if (!byKey.has(r.metricKey)) byKey.set(r.metricKey, []);
    byKey.get(r.metricKey)!.push(r.value);
  }

  const result = new Map<string, number>();
  for (const def of definitions) {
    const values = byKey.get(def.key) ?? [];
    const agg = aggregateValues(values, def.aggregation);
    if (agg !== null) result.set(def.key, agg);
  }
  return result;
}

// Berechnet die Kennzahlen eines Quartals für eine Subscription, inkl.
// einfachem Vorquartalsvergleich (previousValue). Das Ergebnis wird 1:1 in
// QuarterlyReport.summary gespeichert, damit der Bericht auch dann
// reproduzierbar bleibt, wenn danach neue Rohdaten hereinkommen.
export async function computeQuarterSummary(
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<QuarterSummaryEntry[]> {
  const subscription = await prisma.managedServiceSubscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    select: { productSlug: true },
  });
  const definitions = getMetricDefinitions(subscription.productSlug);

  const periodLengthMs = periodEnd.getTime() - periodStart.getTime();
  const previousStart = new Date(periodStart.getTime() - periodLengthMs);
  const previousEnd = periodStart;

  const [current, previous] = await Promise.all([
    aggregatePeriod(subscriptionId, periodStart, periodEnd, definitions),
    aggregatePeriod(subscriptionId, previousStart, previousEnd, definitions),
  ]);

  return definitions
    .filter((def) => current.has(def.key))
    .map((def) => ({
      key: def.key,
      label: def.label,
      unit: def.unit,
      format: def.format,
      section: def.section,
      trendGood: def.trendGood,
      value: current.get(def.key)!,
      previousValue: previous.get(def.key),
    }));
}
