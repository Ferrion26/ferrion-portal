import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENTS_BUCKET } from "@/lib/supabase";
import { PRODUCTS } from "@/app/produkte/products-data";
import { computeQuarterSummary } from "./aggregate";
import { periodLabel, PeriodType } from "./quarter";
import { ReportDocument } from "./pdf/ReportDocument";

// Erstellt einen Bericht als DRAFT: aggregiert die im Zeitraum eingegangenen
// Collector-Metriken, rendert das PDF im Ferrion-Branding und legt Document +
// QuarterlyReport an. Wird sowohl vom Admin-Button
// (POST /api/admin/managed-reports/[id]/generate) als auch vom Quartals-Cron
// (POST /api/cron/generate-quarterly-reports) verwendet — der Cron lässt
// periodType weg und bekommt damit immer QUARTER (sein einziger Anwendungsfall).
export async function generateQuarterlyReport(
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
  periodType: PeriodType = "QUARTER"
) {
  const subscription = await prisma.managedServiceSubscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: { customer: true },
  });

  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);
  const productName = product?.name ?? subscription.productSlug;
  const vendor = product?.vendor ?? "";
  const packageLabel = product?.managedServices?.packages.find(
    (p) => p.id === subscription.packageId.toLowerCase()
  )?.name;

  const entries = await computeQuarterSummary(subscriptionId, periodStart, periodEnd);
  const locale: "de" | "en" = "de";
  const label = periodLabel(periodType, periodStart, locale);

  // react-pdf's renderToBuffer types only accept a literal <Document> element,
  // not a wrapper component that returns one — cast around that typing gap.
  const pdfElement = createElement(ReportDocument, {
    locale,
    customerCompany: subscription.customer.company || subscription.customer.name || subscription.customer.email,
    productName,
    vendor,
    packageLabel,
    deviceSerialNumber: subscription.deviceSerialNumber ?? undefined,
    periodLabel: label,
    entries,
  }) as Parameters<typeof renderToBuffer>[0];

  const pdfBuffer = await renderToBuffer(pdfElement);

  const supabase = createAdminClient();
  const storagePath = `reports/${subscription.customerId}/${subscription.productSlug}-${periodStart.toISOString().slice(0, 10)}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw new Error(`Report-Upload fehlgeschlagen: ${uploadError.message}`);
  }

  const report = await prisma.quarterlyReport.create({
    data: {
      subscriptionId,
      periodStart,
      periodEnd,
      periodType,
      summary: entries as unknown as object,
      document: {
        create: {
          name: `Bericht ${label} — ${productName}`,
          description: `Managed-Service-Bericht für ${subscription.customer.company ?? subscription.customer.name}`,
          storagePath,
          mimeType: "application/pdf",
          sizeBytes: pdfBuffer.length,
          customerId: subscription.customerId,
        },
      },
    },
    include: { document: true },
  });

  return report;
}
