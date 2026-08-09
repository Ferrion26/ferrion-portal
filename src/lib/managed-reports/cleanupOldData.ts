import { prisma } from "@/lib/prisma";

export interface CleanupResult {
  subscriptionId: string;
  retentionDays: number;
  metricsDeleted: number;
  ingestionsDeleted: number;
  findingsDeleted: number;
}

// Löscht Rohdaten, die älter als die pro Subscription konfigurierte
// Aufbewahrungsfrist sind: Zeitreihen-Kennzahlen, die zugehörigen
// Ingestion-Datensätze (nur wenn keine Kennzahl mehr darauf verweist) und
// bereits behobene Alarme/Fehler. Aktive/ungelöste Findings werden nie
// automatisch gelöscht, egal wie alt — die stehen ja noch offen.
// Subscriptions ohne gesetzte Frist (metricsRetentionDays = null) sind von
// der Löschung ausgenommen (Standard: unbegrenzte Aufbewahrung).
export async function cleanupOldData(): Promise<CleanupResult[]> {
  const subscriptions = await prisma.managedServiceSubscription.findMany({
    where: { metricsRetentionDays: { not: null } },
    select: { id: true, metricsRetentionDays: true },
  });

  const results: CleanupResult[] = [];

  for (const sub of subscriptions) {
    const retentionDays = sub.metricsRetentionDays!;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const { count: metricsDeleted } = await prisma.managedServiceMetric.deleteMany({
      where: { subscriptionId: sub.id, recordedAt: { lt: cutoff } },
    });

    // Nur Ingestions löschen, auf die keine Kennzahl mehr verweist (Foreign
    // Key auf ManagedServiceMetric.ingestionId) — sonst würde die Löschung
    // an der Datenbank-Constraint scheitern.
    const { count: ingestionsDeleted } = await prisma.collectorIngestion.deleteMany({
      where: { subscriptionId: sub.id, receivedAt: { lt: cutoff }, metrics: { none: {} } },
    });

    const { count: findingsDeleted } = await prisma.deviceFinding.deleteMany({
      where: { subscriptionId: sub.id, resolvedAt: { lt: cutoff } },
    });

    results.push({ subscriptionId: sub.id, retentionDays, metricsDeleted, ingestionsDeleted, findingsDeleted });
  }

  return results;
}
