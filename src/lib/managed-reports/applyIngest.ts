import { prisma } from "@/lib/prisma";
import { IngestPayload } from "./ingestSchema";
import { reconcileFindings, alarmSamplesToFindings, componentFaultsToFindings } from "./reconcileFindings";
import { runExtractors } from "./extractors";

// Felder aus meta/collectorVersion, die direkt auf die Subscription
// geschrieben werden (Momentaufnahme, kein Zeitreihen-Wert) — geteilt
// zwischen /api/collector/ingest und jeder manuellen Upload-Route, damit
// beide Wege denselben Satz an Gerätefeldern aktualisieren.
export function buildDeviceUpdate(payload: Pick<IngestPayload, "collectorVersion" | "meta">): Record<string, unknown> {
  const { collectorVersion, meta } = payload;
  const deviceUpdate: Record<string, unknown> = {};
  if (collectorVersion) deviceUpdate.collectorVersion = collectorVersion;
  if (meta?.deviceSerialNumber) deviceUpdate.deviceSerialNumber = meta.deviceSerialNumber;
  if (meta?.deviceModel) deviceUpdate.deviceModel = meta.deviceModel;
  if (meta?.deviceName) deviceUpdate.deviceName = meta.deviceName;
  if (meta?.deviceSoftwareVersion) deviceUpdate.deviceSoftwareVersion = meta.deviceSoftwareVersion;
  if (meta?.dataBackupVersion) deviceUpdate.dataBackupVersion = meta.dataBackupVersion;
  if (meta?.resourceBreakdown) deviceUpdate.resourceBreakdown = meta.resourceBreakdown;
  if (meta?.topJobFailures) deviceUpdate.topJobFailures = meta.topJobFailures;
  if (meta?.componentChecks) deviceUpdate.componentChecks = meta.componentChecks;
  if (meta?.capacityBreakdown) deviceUpdate.capacityBreakdown = meta.capacityBreakdown;
  if (meta?.volumes) deviceUpdate.volumes = meta.volumes;
  return deviceUpdate;
}

// Gemeinsamer Kern für jede manuelle Datei-Upload-Route (früher separat in
// der Einzel-Subscription-Route und — bei Einführung des Batch-Uploads auf
// Kundenebene — sonst ein drittes Mal dupliziert). Deckungsgleich mit
// /api/collector/ingest, aber ohne dessen API-Key-Transaktionslogik
// (lastSeenAt-Update, apiKeyId-FK), die dort spezifisch ist.
export async function applyManualIngest(subscriptionId: string, payload: IngestPayload, fileName: string, productSlug: string) {
  const recordedAt = new Date(payload.collectedAt);

  // Wie /api/collector/ingest: zusätzlich zu den im Export bereits
  // enthaltenen Kennzahlen die vom Portal aus meta.rawEndpoints
  // ableitbaren ergänzen — gerade air-gapped Standorte (dieser Upload-Weg)
  // profitieren besonders davon, da hier ein Collector-Rollout am
  // aufwendigsten ist.
  const extracted = runExtractors(productSlug, payload.meta?.rawEndpoints ?? {});
  const allMetrics = [...payload.metrics, ...extracted];

  await prisma.collectorIngestion.create({
    data: {
      subscriptionId,
      source: "MANUAL_UPLOAD",
      fileName,
      payload: payload as unknown as object,
      metrics: {
        create: allMetrics.map((m) => ({
          subscriptionId,
          metricKey: m.key,
          value: m.value,
          unit: m.unit,
          recordedAt,
        })),
      },
    },
  });

  const deviceUpdate = buildDeviceUpdate(payload);
  if (Object.keys(deviceUpdate).length > 0) {
    await prisma.managedServiceSubscription.update({ where: { id: subscriptionId }, data: deviceUpdate });
  }
  if (payload.meta?.alarmSamples) {
    await reconcileFindings(subscriptionId, "ALARM", alarmSamplesToFindings(payload.meta.alarmSamples));
  }
  if (payload.meta?.componentFaults) {
    await reconcileFindings(subscriptionId, "COMPONENT_FAULT", componentFaultsToFindings(payload.meta.componentFaults));
  }

  return { metricsStored: allMetrics.length };
}
