import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/app/produkte/products-data";
import { periodLabel } from "@/lib/managed-reports/quarter";
import { Badge } from "@/components/ui/Badge";
import ReportDownloadButton from "@/components/managed-reports/ReportDownloadButton";
import ApiKeyManager from "./ApiKeyManager";
import ManualUploadForm from "./ManualUploadForm";
import GenerateReportButton from "./GenerateReportButton";
import PublishButton from "./PublishButton";
import DeleteReportButton from "./DeleteReportButton";

export const metadata = { title: "Subscription — Managed Reports — Admin" };

export default async function ManagedReportDetailPage({ params }: { params: { id: string } }) {
  const subscription = await prisma.managedServiceSubscription.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      apiKeys: { orderBy: { createdAt: "desc" } },
      reports: { orderBy: { generatedAt: "desc" }, include: { document: true } },
      _count: { select: { metrics: true } },
    },
  });
  if (!subscription) notFound();

  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);

  // Andere aktive Subscriptions desselben Kunden — können zu einem
  // kombinierten Bericht (getrennte Abschnitte pro Produkt) hinzugefügt werden.
  const siblingSubscriptions = await prisma.managedServiceSubscription.findMany({
    where: { customerId: subscription.customerId, id: { not: subscription.id }, active: true },
  });
  const siblings = siblingSubscriptions.map((s) => {
    const p = PRODUCTS.find((pr) => pr.slug === s.productSlug);
    return { id: s.id, label: `${p?.vendor ?? ""} ${p?.name ?? s.productSlug}`.trim() };
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">
          {product?.vendor ?? ""} {product?.name ?? subscription.productSlug} · {subscription.packageId}
        </p>
        <h1 className="text-2xl font-bold text-white mb-1">
          {subscription.customer.company ?? subscription.customer.name ?? subscription.customer.email}
        </h1>
        <p className="text-sm text-gray-500">
          {subscription._count.metrics} Kennzahlen empfangen · Subscription seit {formatDate(subscription.startDate)}
        </p>
        {(subscription.deviceModel || subscription.deviceSoftwareVersion || subscription.deviceSerialNumber) && (
          <p className="text-sm text-gray-500 mt-1">
            {subscription.deviceModel && <>Modell: {subscription.deviceModel} · </>}
            {subscription.deviceSoftwareVersion && <>Version: {subscription.deviceSoftwareVersion} · </>}
            {subscription.deviceSerialNumber && <>SN: {subscription.deviceSerialNumber}</>}
          </p>
        )}
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-4">Collector-API-Keys</h2>
        <ApiKeyManager
          subscriptionId={subscription.id}
          apiKeys={subscription.apiKeys.map((k) => ({
            id: k.id,
            label: k.label,
            lastSeenAt: k.lastSeenAt?.toISOString() ?? null,
            revokedAt: k.revokedAt?.toISOString() ?? null,
            createdAt: k.createdAt.toISOString(),
          }))}
        />
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-4">Manueller Upload (air-gapped Standorte)</h2>
        <ManualUploadForm subscriptionId={subscription.id} />
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Berichte</h2>
          <GenerateReportButton
            subscriptionId={subscription.id}
            defaultPeriodType={subscription.defaultPeriodType}
            siblings={siblings}
          />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="py-2 font-medium">Zeitraum</th>
              <th className="py-2 font-medium">Erstellt</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {subscription.reports.map((report) => (
              <tr key={report.id} className="border-b border-white/5">
                <td className="py-2 text-gray-300">
                  {periodLabel(report.periodType, report.periodStart)}
                  {report.additionalSubscriptionIds.length > 0 && (
                    <span className="ml-2 text-[10px] text-[#c9a84c] tracking-widest uppercase">
                      kombiniert ({report.additionalSubscriptionIds.length + 1} Produkte)
                    </span>
                  )}
                </td>
                <td className="py-2 text-gray-400">{formatDate(report.generatedAt)}</td>
                <td className="py-2">
                  <Badge variant={report.status === "PUBLISHED" ? "green" : "yellow"}>
                    {report.status === "PUBLISHED" ? "Veröffentlicht" : "Entwurf"}
                  </Badge>
                </td>
                <td className="py-2 text-right space-x-4">
                  {report.document && (
                    <ReportDownloadButton documentId={report.document.id} fileName={report.document.name} />
                  )}
                  {report.status === "DRAFT" && (
                    <PublishButton subscriptionId={subscription.id} reportId={report.id} />
                  )}
                  <DeleteReportButton subscriptionId={subscription.id} reportId={report.id} published={report.status === "PUBLISHED"} />
                </td>
              </tr>
            ))}
            {subscription.reports.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  Noch kein Bericht erstellt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
