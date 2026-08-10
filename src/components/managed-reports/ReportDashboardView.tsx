import Link from "next/link";
import { QuarterSummaryEntry } from "@/lib/managed-reports/aggregate";
import {
  deriveStatus,
  buildExecutiveSummary,
  buildRecommendations,
  buildBannerHighlights,
  MetricStatus,
} from "@/lib/managed-reports/reportNarrative";
import { formatValue } from "@/lib/managed-reports/reportFormat";
import { formatDate } from "@/lib/utils";
import type { ProductReportData } from "@/lib/managed-reports/pdf/ReportDocument";
import ReportDownloadButton from "./ReportDownloadButton";
import { CapacityTrendChart } from "./CapacityTrendChart";

// Interaktive Web-Ansicht eines Berichts — Ergänzung zum PDF-Download, nicht
// dessen Ersatz. Nutzt dieselben reinen Auswertungsfunktionen wie das PDF
// (reportNarrative.ts, reportFormat.ts) auf denselben Daten (QuarterlyReport.
// summary), damit Web- und PDF-Ansicht inhaltlich nie auseinanderlaufen —
// nur die Darstellung unterscheidet sich.

const STATUS_STYLES: Record<MetricStatus, { dot: string; bg: string; text: string; label: { de: string; en: string } }> = {
  good: { dot: "bg-green-400", bg: "bg-green-500/15", text: "text-green-400", label: { de: "OK", en: "OK" } },
  warning: { dot: "bg-amber-400", bg: "bg-amber-500/15", text: "text-amber-400", label: { de: "Hinweis", en: "Notice" } },
  critical: { dot: "bg-red-400", bg: "bg-red-500/15", text: "text-red-400", label: { de: "Kritisch", en: "Critical" } },
  neutral: { dot: "bg-gray-500", bg: "bg-gray-500/15", text: "text-gray-400", label: { de: "—", en: "—" } },
};

function StatCard({ entry, locale }: { entry: QuarterSummaryEntry; locale: "de" | "en" }) {
  const status = deriveStatus(entry);
  const s = STATUS_STYLES[status];
  return (
    <div className="bg-[#111827] border border-white/10 p-5">
      <p className="text-xs text-gray-500 truncate">{entry.shortLabel?.[locale] ?? entry.label[locale]}</p>
      <p className="text-2xl font-bold text-white mt-1">{formatValue(entry, locale)}</p>
      {status !== "neutral" && (
        <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>{s.label[locale]}</span>
      )}
    </div>
  );
}

function PillRow({ text, status }: { text: string; status: MetricStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className="truncate">{text}</span>
    </div>
  );
}

function Donut({ percent, label = "Pool" }: { percent: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#c9a84c"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="46" textAnchor="middle" className="fill-white" style={{ fontSize: 20, fontWeight: 700 }}>
        {clamped.toLocaleString("de-DE", { maximumFractionDigits: 1 })}%
      </text>
      <text x="50" y="62" textAnchor="middle" className="fill-gray-500" style={{ fontSize: 9 }}>
        {label}
      </text>
    </svg>
  );
}

export interface ReportDashboardViewProps {
  locale: "de" | "en";
  customerCompany: string;
  periodLabel: string;
  generatedAt: Date;
  products: ProductReportData[];
  activeIndex: number;
  basePath: string;
  documentId?: string;
  documentFileName?: string;
}

export function ReportDashboardView({
  locale,
  customerCompany,
  periodLabel,
  generatedAt,
  products,
  activeIndex,
  basePath,
  documentId,
  documentFileName,
}: ReportDashboardViewProps) {
  const product = products[activeIndex] ?? products[0];
  const entries = product.entries;

  const summary = buildExecutiveSummary(entries, locale);
  const recommendations = buildRecommendations(entries, locale);
  const bannerHighlights = buildBannerHighlights(entries, locale);

  const headlineEntries = entries.filter((e) => e.headline);
  const hardwareFaultEntries = entries.filter((e) => e.section === "hardware" && e.format === "count");
  const usageBarEntries = entries.filter((e) => e.section === "hardware" && e.format === "percent" && e.key !== "system_availability");
  const capacityEntries = entries.filter((e) => e.section === "capacity");
  const fillLevelEntry = capacityEntries.find((e) => e.key === "storage_pool_fill_level");
  const capacityStatCards = capacityEntries.filter((e) => e.key !== "storage_pool_fill_level");

  const protectionRateEntry = entries.find((e) => e.key === "resource_protection_rate");
  const protectedCountEntry = entries.find((e) => e.key === "resources_protected_count");
  const unprotectedCountEntry = entries.find((e) => e.key === "resources_unprotected_count");

  const headlineStatus = STATUS_STYLES[summary.issueCount === 0 ? "good" : entries.some((e) => deriveStatus(e) === "critical") ? "critical" : "warning"];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-gray-500 tracking-widest uppercase">
            {product.vendor} {product.productName} · Managed Service Report
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">{customerCompany}</h1>
        </div>
        <div className="flex items-center gap-3">
          {documentId && documentFileName && <ReportDownloadButton documentId={documentId} fileName={documentFileName} />}
          <span className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            {locale === "de" ? "Erstellt am" : "Generated on"} {formatDate(generatedAt)}
          </span>
        </div>
      </div>

      {products.length > 1 && (
        <div className="flex gap-2 border-b border-white/10">
          {products.map((p, i) => (
            <Link
              key={p.productName + i}
              href={`${basePath}?product=${i}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                i === activeIndex ? "border-[#c9a84c] text-[#c9a84c]" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {p.vendor} {p.productName}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <div className="space-y-4">
          <div className="bg-[#111827] border border-white/10 p-5 space-y-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Kunde" : "Customer"}</p>
              <p className="text-sm text-white font-medium">{customerCompany}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Produkt" : "Product"}</p>
              <p className="text-sm text-white font-medium">
                {product.vendor} {product.productName}
              </p>
            </div>
            {product.deviceName && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Gerätename" : "Device Name"}</p>
                <p className="text-sm text-white font-medium">{product.deviceName}</p>
              </div>
            )}
            {product.deviceModel && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Modell" : "Model"}</p>
                <p className="text-sm text-white font-medium">{product.deviceModel}</p>
              </div>
            )}
            {product.location && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Standort" : "Location"}</p>
                <p className="text-sm text-white font-medium">{product.location}</p>
              </div>
            )}
            {product.packageLabel && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Servicestufe" : "Service Tier"}</p>
                <p className="text-sm text-white font-medium">{product.packageLabel}</p>
              </div>
            )}
            {product.deviceSoftwareVersion && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Version" : "Version"}</p>
                <p className="text-sm text-white font-medium">{product.deviceSoftwareVersion}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{locale === "de" ? "Zeitraum" : "Period"}</p>
              <p className="text-sm text-white font-medium">{periodLabel}</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/10 p-5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{locale === "de" ? "Gesamtstatus" : "Overall Status"}</p>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${headlineStatus.bg} ${headlineStatus.text}`}>
              {summary.headline}
            </span>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">{summary.text}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/10 p-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-white">{summary.headline}</h2>
              <p className="text-sm text-gray-400 mt-1">{summary.text}</p>
            </div>
            {bannerHighlights.length > 0 && (
              <div className="flex flex-col gap-2 min-w-[220px]">
                {bannerHighlights.map((h) => (
                  <PillRow key={h.entry.key} text={`${h.entry.shortLabel?.[locale] ?? h.entry.label[locale]}: ${formatValue(h.entry, locale)}`} status={h.status} />
                ))}
              </div>
            )}
          </div>

          {headlineEntries.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {headlineEntries.map((e) => (
                <StatCard key={e.key} entry={e} locale={locale} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-white/10 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">{locale === "de" ? "Nächste Schritte" : "Next Steps"}</h3>
              <ol className="space-y-3">
                {recommendations.map((rec, i) => {
                  const s = STATUS_STYLES[rec.status];
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`w-5 h-5 shrink-0 rounded-full ${s.bg} ${s.text} text-[11px] font-bold flex items-center justify-center`}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-300">{rec.text}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {usageBarEntries.length > 0 && (
              <div className="space-y-4">
                {usageBarEntries.map((e) => (
                  <div key={e.key} className="bg-[#111827] border border-white/10 p-5">
                    <p className="text-xs text-gray-500">{e.label[locale]}</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatValue(e, locale)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hardwareFaultEntries.length > 0 && (
              <div className="bg-[#111827] border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">{locale === "de" ? "Infrastrukturstatus" : "Infrastructure Status"}</h3>
                <ul className="space-y-2.5">
                  {hardwareFaultEntries.map((e) => {
                    const status = deriveStatus(e);
                    const s = STATUS_STYLES[status];
                    return (
                      <li key={e.key} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2.5 text-sm text-gray-300">
                          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                          {e.label[locale]}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{formatValue(e, locale)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>{s.label[locale]}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {capacityEntries.length > 0 && (
              <div className="bg-[#111827] border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">{locale === "de" ? "Kapazität" : "Capacity"}</h3>
                <div className="flex items-center gap-6 flex-wrap">
                  {fillLevelEntry && <Donut percent={fillLevelEntry.value} />}
                  <div className="grid grid-cols-2 gap-3 flex-1 min-w-[180px]">
                    {capacityStatCards.map((e) => (
                      <div key={e.key} className="bg-white/5 px-3 py-2.5">
                        <p className="text-[10px] text-gray-500 truncate">{e.shortLabel?.[locale] ?? e.label[locale]}</p>
                        <p className="text-sm font-semibold text-white">{formatValue(e, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {protectionRateEntry && (
              <div className="bg-[#111827] border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">{locale === "de" ? "Ressourcenschutz" : "Resource Protection"}</h3>
                <div className="flex items-center gap-6 flex-wrap">
                  <Donut percent={protectionRateEntry.value} label={locale === "de" ? "Schutz" : "Protection"} />
                  <div className="flex gap-6">
                    {protectedCountEntry && (
                      <div>
                        <p className="text-2xl font-bold text-white">{formatValue(protectedCountEntry, locale)}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                          {locale === "de" ? "Geschützt" : "Protected"}
                        </p>
                      </div>
                    )}
                    {unprotectedCountEntry && (
                      <div>
                        <p className="text-2xl font-bold text-white">{formatValue(unprotectedCountEntry, locale)}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-600" />
                          {locale === "de" ? "Ungeschützt" : "Unprotected"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {product.capacityTrend && product.capacityTrend.length > 1 && (
              <div className="bg-[#111827] border border-white/10 p-6">
                <CapacityTrendChart points={product.capacityTrend} locale={locale} />
              </div>
            )}
          </div>

          <div className="bg-black/30 border border-white/10 p-6">
            <h3 className="text-white font-semibold mb-2">{locale === "de" ? "Management Summary" : "Management Summary"}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{summary.text}</p>
            <div className="flex gap-2 mt-4">
              {(["good", "warning", "critical"] as MetricStatus[]).map((status) => {
                const s = STATUS_STYLES[status];
                return (
                  <span key={status} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                    {s.label[locale]}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
