import { prisma } from "@/lib/prisma";

export interface MetricKeySummary {
  metricKey: string;
  unit: string | null;
  latestValue: number;
  latestRecordedAt: Date;
  pointCount: number;
  edited: boolean;
}

// Eine Zeile pro erfassten metricKey — letzter Wert, Punktanzahl,
// "bearbeitet"-Status — für die linke Navigationsliste im Daten-Browser
// (/admin/managed-reports/[id]/data). Wird sowohl von der Seite selbst
// (Server-Component, direkter Prisma-Zugriff) als auch von der
// GET .../metrics-API-Route genutzt, damit die Logik nur einmal existiert.
//
// groupBy liefert Anzahl + letzten Zeitstempel je Key effizient über die
// Datenbank; der eigentliche letzte Wert (inkl. unit/edited) braucht pro Key
// noch eine zweite, gezielte Anfrage — bei üblicherweise einigen Dutzend
// unterschiedlichen Keys pro Subscription ist das unproblematisch und bleibt
// beim in diesem Codebase sonst üblichen Stil (kleine, gezielte Queries statt
// komplexer SQL-Konstruktionen).
export async function getMetricKeySummary(subscriptionId: string): Promise<MetricKeySummary[]> {
  const grouped = await prisma.managedServiceMetric.groupBy({
    by: ["metricKey"],
    where: { subscriptionId },
    _count: { _all: true },
    _max: { recordedAt: true },
  });

  const summaries = await Promise.all(
    grouped.map(async (g) => {
      const latest = await prisma.managedServiceMetric.findFirst({
        where: { subscriptionId, metricKey: g.metricKey, recordedAt: g._max.recordedAt! },
        orderBy: { id: "desc" },
      });
      if (!latest) return null;
      return {
        metricKey: g.metricKey,
        unit: latest.unit,
        latestValue: latest.value,
        latestRecordedAt: latest.recordedAt,
        pointCount: g._count._all,
        edited: latest.edited,
      };
    })
  );

  return summaries.filter((s): s is MetricKeySummary => s !== null);
}
