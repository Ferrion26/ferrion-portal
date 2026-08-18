// Erstellt eine Systemdokumentation (Aufbau/Netzwerk/Backup/Clients) als
// editierbares Word-Dokument je Subscription — eine reine Momentaufnahme des
// aktuellen Systemzustands, kein Zeitraum-/Aggregationskonzept wie beim
// PDF-Quartalsbericht (siehe generateReportPdf.ts). Bewusst getrennt von
// dessen Datenmodell (eigenes SystemDocumentation-Prisma-Modell) und von
// dessen Metriken (metrics/*.ts) — diese Daten fließen nicht in den
// Healthcheck-Bericht ein.
import { Packer } from "docx";
import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENTS_BUCKET } from "@/lib/supabase";
import { PRODUCTS } from "@/app/produkte/products-data";
import {
  buildSystemDocumentationDocx,
  SystemDocumentationData,
  ComponentCheckEntry,
  CapacityBreakdownEntry,
  VolumeOverviewEntry,
  LunOverviewEntry,
  NetworkPortEntry,
  ResourceBreakdownEntry,
  TopJobFailuresEntry,
  ClientEntry,
} from "./docx/SystemDocumentationBuilder";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Welche Backup-Kennzahlen (falls vorhanden) im Abschnitt "Backup" als
// Stammdaten-Tabelle erscheinen — dieselben Metrik-Keys/Labels wie in
// src/lib/managed-reports/metrics/oceanprotect.ts, hier lokal dupliziert,
// da nur eine Handvoll Keys für die Systemdokumentation relevant sind (kein
// Grund, die volle MetricDefinition-Registry zu importieren).
const BACKUP_METRIC_LABELS: Record<string, { label: string; format: "percent" | "count" }> = {
  backup_success_rate: { label: "Backup-Erfolgsquote", format: "percent" },
  rpo_compliance_rate: { label: "RPO-Einhaltung", format: "percent" },
  resource_protection_rate: { label: "Ressourcen-Schutzquote", format: "percent" },
  sla_compliant_count: { label: "SLA-konforme Ressourcen", format: "count" },
  sla_noncompliant_count: { label: "SLA-abweichende Ressourcen", format: "count" },
  backup_failed_jobs_count: { label: "Fehlgeschlagene Backup-Jobs (letzte Woche)", format: "count" },
};

function formatMetricValue(value: number, format: "percent" | "count"): string {
  if (format === "percent") return `${value.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
  return value.toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

export async function generateSystemDocumentation(subscriptionId: string) {
  const subscription = await prisma.managedServiceSubscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: { customer: true },
  });
  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);

  // Aktuellster Wert je Metrik-Key (Prisma-natives "neuester Wert je
  // Gruppe"-Muster) — nur für die wenigen Backup-Kennzahlen relevant, keine
  // volle Zeitraum-Aggregation wie beim PDF-Bericht nötig.
  const latestMetrics = await prisma.managedServiceMetric.findMany({
    where: { subscriptionId, metricKey: { in: Object.keys(BACKUP_METRIC_LABELS) } },
    distinct: ["metricKey"],
    orderBy: { recordedAt: "desc" },
  });
  const backupMetrics = latestMetrics
    .filter((m) => BACKUP_METRIC_LABELS[m.metricKey])
    .map((m) => ({
      label: BACKUP_METRIC_LABELS[m.metricKey].label,
      value: formatMetricValue(m.value, BACKUP_METRIC_LABELS[m.metricKey].format),
    }));

  const data: SystemDocumentationData = {
    customerCompany: subscription.customer.company || subscription.customer.name || subscription.customer.email,
    productName: product?.name ?? subscription.productSlug,
    vendor: product?.vendor ?? "",
    packageLabel: product?.managedServices?.packages.find((p) => p.id === subscription.packageId.toLowerCase())?.name,
    deviceName: subscription.deviceName ?? undefined,
    deviceModel: subscription.deviceModel ?? undefined,
    deviceSerialNumber: subscription.deviceSerialNumber ?? undefined,
    deviceSoftwareVersion: subscription.deviceSoftwareVersion ?? undefined,
    location: subscription.location ?? undefined,
    lifecycleStatus: subscription.lifecycleStatus ?? undefined,
    lifecycleEndDate: subscription.lifecycleEndDate ?? undefined,
    contactName: subscription.contactName ?? undefined,
    contactRole: subscription.contactRole ?? undefined,
    contactEmail: subscription.contactEmail ?? undefined,
    contactPhone: subscription.contactPhone ?? undefined,
    componentChecks: (subscription.componentChecks as unknown as ComponentCheckEntry[]) ?? undefined,
    capacityBreakdown: (subscription.capacityBreakdown as unknown as CapacityBreakdownEntry[]) ?? undefined,
    volumes: (subscription.volumes as unknown as VolumeOverviewEntry[]) ?? undefined,
    luns: (subscription.luns as unknown as LunOverviewEntry[]) ?? undefined,
    networkPorts: (subscription.networkPorts as unknown as NetworkPortEntry[]) ?? undefined,
    resourceBreakdown: (subscription.resourceBreakdown as unknown as ResourceBreakdownEntry[]) ?? undefined,
    topJobFailures: (subscription.topJobFailures as unknown as TopJobFailuresEntry) ?? undefined,
    backupMetrics: backupMetrics.length > 0 ? backupMetrics : undefined,
    clients: (subscription.clients as unknown as ClientEntry[]) ?? undefined,
    generatedAt: new Date(),
  };

  const doc = buildSystemDocumentationDocx(data);
  const buffer = await Packer.toBuffer(doc);

  const storagePath = `system-docs/${subscription.customerId}/${subscription.productSlug}-systemdokumentation-${new Date()
    .toISOString()
    .slice(0, 10)}.docx`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, buffer, { contentType: DOCX_MIME, upsert: true });
  if (uploadError) {
    throw new Error(`Systemdokumentation-Upload fehlgeschlagen: ${uploadError.message}`);
  }

  return prisma.systemDocumentation.create({
    data: {
      subscriptionId,
      document: {
        create: {
          name: `Systemdokumentation — ${data.deviceName ?? data.productName} (${new Date().toISOString().slice(0, 10)})`,
          description: `Systemdokumentation für ${data.customerCompany}`,
          storagePath,
          mimeType: DOCX_MIME,
          sizeBytes: buffer.length,
          customerId: subscription.customerId,
        },
      },
    },
    include: { document: true },
  });
}
