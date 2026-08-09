import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENTS_BUCKET } from "@/lib/supabase";
import { PRODUCTS } from "@/app/produkte/products-data";
import { computeQuarterSummary } from "./aggregate";
import { periodLabel, PeriodType } from "./quarter";
import { ReportDocument, ProductReportData } from "./pdf/ReportDocument";

type SubscriptionWithCustomer = Awaited<ReturnType<typeof loadSubscription>>;

async function loadSubscription(subscriptionId: string) {
  return prisma.managedServiceSubscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: { customer: true },
  });
}

async function buildProductData(subscription: SubscriptionWithCustomer, periodStart: Date, periodEnd: Date): Promise<ProductReportData> {
  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);
  const packageLabel = product?.managedServices?.packages.find(
    (p) => p.id === subscription.packageId.toLowerCase()
  )?.name;

  const entries = await computeQuarterSummary(subscription.id, periodStart, periodEnd);

  return {
    productName: product?.name ?? subscription.productSlug,
    vendor: product?.vendor ?? "",
    packageLabel,
    deviceSerialNumber: subscription.deviceSerialNumber ?? undefined,
    deviceModel: subscription.deviceModel ?? undefined,
    deviceSoftwareVersion: subscription.deviceSoftwareVersion ?? undefined,
    entries,
  };
}

// Gemeinsamer Kern für Einzel- und kombinierte Berichte: rendert das PDF,
// lädt es zu Supabase Storage hoch und legt Document + QuarterlyReport an.
// `primarySubscription` trägt die Kundendaten und ist bei kombinierten
// Berichten die erste der ausgewählten Subscriptions (FK-Ziel), die übrigen
// landen in `additionalSubscriptionIds`.
async function renderAndStoreReport(
  primarySubscription: SubscriptionWithCustomer,
  additionalSubscriptionIds: string[],
  products: ProductReportData[],
  periodStart: Date,
  periodEnd: Date,
  periodType: PeriodType
) {
  const locale: "de" | "en" = "de";
  const label = periodLabel(periodType, periodStart, locale);
  const customerCompany =
    primarySubscription.customer.company || primarySubscription.customer.name || primarySubscription.customer.email;

  // react-pdf's renderToBuffer types only accept a literal <Document> element,
  // not a wrapper component that returns one — cast around that typing gap.
  const pdfElement = createElement(ReportDocument, {
    locale,
    customerCompany,
    periodLabel: label,
    products,
  }) as Parameters<typeof renderToBuffer>[0];

  const pdfBuffer = await renderToBuffer(pdfElement);

  const supabase = createAdminClient();
  const productSlugPart = products.length > 1 ? "kombiniert" : primarySubscription.productSlug;
  const storagePath = `reports/${primarySubscription.customerId}/${productSlugPart}-${periodStart.toISOString().slice(0, 10)}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw new Error(`Report-Upload fehlgeschlagen: ${uploadError.message}`);
  }

  const productNames = products.map((p) => p.productName).join(" + ");

  const report = await prisma.quarterlyReport.create({
    data: {
      subscriptionId: primarySubscription.id,
      additionalSubscriptionIds,
      periodStart,
      periodEnd,
      periodType,
      summary: products as unknown as object,
      document: {
        create: {
          name: `Bericht ${label} — ${productNames}`,
          description: `Managed-Service-Bericht für ${customerCompany}`,
          storagePath,
          mimeType: "application/pdf",
          sizeBytes: pdfBuffer.length,
          customerId: primarySubscription.customerId,
        },
      },
    },
    include: { document: true },
  });

  return report;
}

// Erstellt einen Bericht als DRAFT für eine einzelne Subscription: aggregiert
// die im Zeitraum eingegangenen Collector-Metriken, rendert das PDF im
// Ferrion-Branding und legt Document + QuarterlyReport an. Wird sowohl vom
// Admin-Button (POST /api/admin/managed-reports/[id]/generate) als auch vom
// Quartals-Cron (POST /api/cron/generate-quarterly-reports) verwendet — der
// Cron lässt periodType weg und bekommt damit immer QUARTER.
export async function generateQuarterlyReport(
  subscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
  periodType: PeriodType = "QUARTER"
) {
  const subscription = await loadSubscription(subscriptionId);
  const product = await buildProductData(subscription, periodStart, periodEnd);
  return renderAndStoreReport(subscription, [], [product], periodStart, periodEnd, periodType);
}

// Kombinierter Bericht über mehrere Subscriptions desselben Kunden hinweg
// (z. B. OceanProtect + OceanStor im selben Zyklus): ein PDF mit gemeinsamem
// Kopf-/Kundenblock, aber getrennten Abschnitten je Produkt. Die erste
// Subscription ist Träger der FK-Beziehung (Document.customerId etc.), die
// übrigen werden in QuarterlyReport.additionalSubscriptionIds vermerkt.
export async function generateCombinedReport(
  subscriptionIds: string[],
  periodStart: Date,
  periodEnd: Date,
  periodType: PeriodType = "QUARTER"
) {
  if (subscriptionIds.length === 0) {
    throw new Error("Mindestens eine Subscription wird benötigt.");
  }

  const subscriptions = await Promise.all(subscriptionIds.map(loadSubscription));
  const customerIds = new Set(subscriptions.map((s) => s.customerId));
  if (customerIds.size > 1) {
    throw new Error("Kombinierte Berichte sind nur für Subscriptions desselben Kunden möglich.");
  }

  const [primarySubscription, ...rest] = subscriptions;
  const products = await Promise.all(subscriptions.map((s) => buildProductData(s, periodStart, periodEnd)));

  return renderAndStoreReport(
    primarySubscription,
    rest.map((s) => s.id),
    products,
    periodStart,
    periodEnd,
    periodType
  );
}
