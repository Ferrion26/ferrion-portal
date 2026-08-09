import { QuarterSummaryEntry } from "./aggregate";
import { formatValue } from "./reportFormat";

export type MetricStatus = "good" | "warning" | "critical" | "neutral";

// Metrics whose key names one of these are treated as severe the moment
// they're non-zero (a single infected copy or critical alarm is worth a red
// flag on its own) — everything else that's "should be zero" only escalates
// to a warning, never critical, since a handful of e.g. offline ports is
// worth a look but not an incident.
const SEVERE_KEY_HINTS = ["critical", "infected"];

// Derives an at-a-glance status from a metric's format/trendGood/value —
// deliberately conservative: metrics without a defined "better direction"
// (CPU/memory usage, capacity levels, dedup ratio) never get a good/bad
// judgment, since there's no universal target for them.
export function deriveStatus(entry: Pick<QuarterSummaryEntry, "key" | "format" | "trendGood" | "value">): MetricStatus {
  const { key, format, trendGood, value } = entry;
  if (!trendGood) return "neutral";

  if (format === "percent" && trendGood === "up") {
    if (value >= 99) return "good";
    if (value >= 95) return "warning";
    return "critical";
  }

  if (format === "count" && trendGood === "down") {
    if (value === 0) return "good";
    return SEVERE_KEY_HINTS.some((hint) => key.includes(hint)) ? "critical" : "warning";
  }

  return "neutral";
}

const COPY = {
  de: {
    stable: "Stabiler Betrieb",
    degraded: "Eingeschränkter Betrieb",
    withAvailability: (v: string) => `mit ${v} Systemverfügbarkeit`,
    noIssues: "ohne besondere Auffälligkeiten in diesem Zeitraum.",
    issuesOne: "— 1 Punkt benötigt Aufmerksamkeit.",
    issuesMany: (n: number) => `— ${n} Punkte benötigen Aufmerksamkeit.`,
    recommendationPrefix: (label: string, value: string) => `${label} prüfen (${value}).`,
    noRecommendations: "Keine Handlungsempfehlungen für diesen Zeitraum — alle überwachten Werte im Zielbereich.",
    moreItems: (n: number) => `+ ${n} weitere${n === 1 ? "r" : ""} Punkt${n === 1 ? "" : "e"} im Detailbericht unten.`,
  },
  en: {
    stable: "Stable Operation",
    degraded: "Degraded Operation",
    withAvailability: (v: string) => `with ${v} system availability`,
    noIssues: "with no notable issues in this period.",
    issuesOne: "— 1 item needs attention.",
    issuesMany: (n: number) => `— ${n} items need attention.`,
    recommendationPrefix: (label: string, value: string) => `Review ${label} (${value}).`,
    noRecommendations: "No recommendations for this period — all monitored values within target range.",
    moreItems: (n: number) => `+ ${n} more item${n === 1 ? "" : "s"} in the detail report below.`,
  },
};

const STATUS_SEVERITY: Record<MetricStatus, number> = { critical: 0, warning: 1, neutral: 2, good: 3 };

export interface ExecutiveSummary {
  headline: string;
  text: string;
  issueCount: number;
}

// A short, deterministic (never AI-generated-prose) status sentence for the
// report's top banner — composed from a handful of headline facts, not a
// free-form summary, so it stays predictable and auditable.
export function buildExecutiveSummary(entries: QuarterSummaryEntry[], locale: "de" | "en"): ExecutiveSummary {
  const t = COPY[locale];
  const statuses = entries.map(deriveStatus);
  const criticalCount = statuses.filter((s) => s === "critical").length;
  const issueCount = statuses.filter((s) => s === "critical" || s === "warning").length;

  const headline = criticalCount > 0 ? t.degraded : t.stable;
  const availability = entries.find((e) => e.key === "system_availability");

  const parts = [headline];
  if (availability) parts.push(t.withAvailability(formatValue(availability, locale)));
  if (issueCount === 0) parts.push(t.noIssues);
  else if (issueCount === 1) parts.push(t.issuesOne);
  else parts.push(t.issuesMany(issueCount));

  return { headline, text: parts.join(" "), issueCount };
}

const MAX_RECOMMENDATIONS = 5;

// One line per metric currently in "warning"/"critical" status, most severe
// first, capped so a noisy quarter doesn't produce a wall of bullets — the
// full picture is always in the detail sections below. Generic by design
// (works for any product's metric set) rather than hand-authored prose per
// metric.
export function buildRecommendations(entries: QuarterSummaryEntry[], locale: "de" | "en"): string[] {
  const t = COPY[locale];
  const flagged = entries
    .filter((e) => {
      const s = deriveStatus(e);
      return s === "warning" || s === "critical";
    })
    .sort((a, b) => STATUS_SEVERITY[deriveStatus(a)] - STATUS_SEVERITY[deriveStatus(b)]);

  if (flagged.length === 0) return [t.noRecommendations];

  const shown = flagged.slice(0, MAX_RECOMMENDATIONS).map((e) => t.recommendationPrefix(e.label[locale], formatValue(e, locale)));
  const remaining = flagged.length - MAX_RECOMMENDATIONS;
  if (remaining > 0) shown.push(t.moreItems(remaining));
  return shown;
}

const MAX_BANNER_HIGHLIGHTS = 3;

// A curated mix for the summary banner's pill column: the most severe
// issues first (so a problem is never buried), padded out with headline
// metrics if there's room — not a plain repeat of the headline row below.
export function buildBannerHighlights(entries: QuarterSummaryEntry[], locale: "de" | "en") {
  const issues = entries
    .filter((e) => {
      const s = deriveStatus(e);
      return s === "warning" || s === "critical";
    })
    .sort((a, b) => STATUS_SEVERITY[deriveStatus(a)] - STATUS_SEVERITY[deriveStatus(b)]);

  const picked: QuarterSummaryEntry[] = [...issues];
  for (const e of entries) {
    if (picked.length >= MAX_BANNER_HIGHLIGHTS) break;
    if (e.headline && !picked.includes(e)) picked.push(e);
  }

  return picked.slice(0, MAX_BANNER_HIGHLIGHTS).map((e) => ({
    entry: e,
    status: deriveStatus(e),
    text: `${e.shortLabel?.[locale] ?? e.label[locale]} ${formatValue(e, locale)}`,
  }));
}
