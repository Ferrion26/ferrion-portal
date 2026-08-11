import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/app/produkte/products-data";
import { getMetricDefinitions } from "@/lib/managed-reports/metrics";
import { formatValue } from "@/lib/managed-reports/reportFormat";
import { getMetricKeySummary, MetricKeySummary } from "@/lib/managed-reports/metricBrowser";
import { Badge } from "@/components/ui/Badge";
import MetricDetailPanel from "./MetricDetailPanel";

export const metadata = { title: "Daten-Browser — Managed Reports — Admin" };

const SECTION_LABELS: Record<string, string> = {
  availability: "Verfügbarkeit",
  hardware: "Hardware",
  capacity: "Kapazität",
  security: "Sicherheit",
  operations: "Betrieb",
  other: "Sonstige",
};
const SECTION_ORDER = ["availability", "hardware", "capacity", "security", "operations", "other"];

export default async function DataBrowserPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { key?: string };
}) {
  const subscription = await prisma.managedServiceSubscription.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });
  if (!subscription) notFound();

  const [summary] = await Promise.all([getMetricKeySummary(params.id)]);
  const definitions = getMetricDefinitions(subscription.productSlug);
  const defByKey = new Map(definitions.map((d) => [d.key, d]));
  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);

  const grouped = new Map<string, MetricKeySummary[]>();
  for (const section of SECTION_ORDER) grouped.set(section, []);
  for (const m of summary) {
    const section = defByKey.get(m.metricKey)?.section ?? "other";
    grouped.get(section)!.push(m);
  }

  const selectedKey = searchParams.key && summary.some((m) => m.metricKey === searchParams.key) ? searchParams.key : summary[0]?.metricKey;
  const selectedDefinition = selectedKey ? defByKey.get(selectedKey) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/managed-reports/${subscription.id}`} className="text-xs text-gray-500 hover:text-[#c9a84c]">
          ← {subscription.customer.company ?? subscription.customer.name ?? subscription.customer.email}
        </Link>
        <p className="text-xs text-gray-500 tracking-widest uppercase mb-2 mt-2">
          {product?.vendor ?? ""} {product?.name ?? subscription.productSlug} · {subscription.packageId}
        </p>
        <h1 className="text-2xl font-bold text-white mb-1">Daten-Browser</h1>
        <p className="text-sm text-gray-500">
          Alle erfassten Messwerte im Detail — mit Ursprung, Historie und Diagramm. Werte lassen sich entsperren und mit Begründung korrigieren.
        </p>
      </div>

      {summary.length === 0 ? (
        <div className="bg-[#111827] border border-white/10 p-6 text-center text-gray-500">Noch keine Daten eingegangen.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <div className="bg-[#111827] border border-white/10 p-4 space-y-5">
            {SECTION_ORDER.map((section) => {
              const items = grouped.get(section)!;
              if (items.length === 0) return null;
              return (
                <div key={section}>
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase mb-2">{SECTION_LABELS[section]}</p>
                  <div className="space-y-1">
                    {items.map((m) => {
                      const def = defByKey.get(m.metricKey);
                      const active = m.metricKey === selectedKey;
                      return (
                        <Link
                          key={m.metricKey}
                          href={`/admin/managed-reports/${subscription.id}/data?key=${encodeURIComponent(m.metricKey)}`}
                          className={`block px-2 py-1.5 text-sm border ${
                            active ? "bg-[#c9a84c]/10 border-[#c9a84c] text-white" : "border-transparent text-gray-400 hover:text-white hover:border-white/10"
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate">{def?.label.de ?? m.metricKey}</span>
                            {m.edited && <Badge variant="yellow">✎</Badge>}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatValue({ format: def?.format ?? "count", value: m.latestValue, unit: def?.unit ?? m.unit ?? undefined }, "de")} · {m.pointCount}{" "}
                            {m.pointCount === 1 ? "Wert" : "Werte"}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#111827] border border-white/10 p-6">
            {selectedKey ? (
              <MetricDetailPanel
                subscriptionId={subscription.id}
                metricKey={selectedKey}
                definition={selectedDefinition}
                sectionLabel={SECTION_LABELS[selectedDefinition?.section ?? "other"]}
              />
            ) : (
              <p className="text-gray-500 text-sm">Keine Kennzahl ausgewählt.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
