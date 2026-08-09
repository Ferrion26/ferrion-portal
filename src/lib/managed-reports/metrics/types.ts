export type MetricFormat = "percent" | "tb" | "gb" | "ratio" | "count";

// How readings within a quarter collapse into one report figure:
// "avg" for rates/ratios, "sum" for counters (incidents, alerts),
// "last" for point-in-time levels (capacity currently in use).
export type MetricAggregation = "avg" | "sum" | "last";

export type ReportSection = "availability" | "hardware" | "capacity" | "security" | "operations";

export interface MetricDefinition {
  key: string;
  label: { de: string; en: string };
  unit?: string;
  format: MetricFormat;
  aggregation: MetricAggregation;
  section: ReportSection;
  // Which direction of change is favorable, for trend color-coding in the
  // report. Omit for metrics without a clear "better" direction (e.g. a
  // capacity level).
  trendGood?: "up" | "down";
  // Shown in the "Wichtigste Kennzahlen" headline row at the top of the
  // report (max ~4 recommended — it's a single row). Curated per product.
  headline?: boolean;
  // Compact label for the headline row's tighter cards — falls back to
  // `label` when omitted.
  shortLabel?: { de: string; en: string };
  // Short explanation of how the figure is derived, shown as a footnote
  // under the metric — only worth adding where the calculation isn't
  // self-evident from the label (e.g. "Backup-Erfolgsquote").
  methodology?: { de: string; en: string };
  // Custom good/warning cutoffs for percent-format status derivation, only
  // relevant when trendGood is set. For trendGood "up" (higher is better):
  // value >= good → good, >= warning → warning, else critical. For "down"
  // (lower is better, e.g. CPU usage): value <= good → good, <= warning →
  // warning, else critical. Omit to use the default band for that direction.
  statusThresholds?: { good: number; warning: number };
  // True for figures we calculate ourselves from several raw device
  // readings (an average across controllers, a rate derived from job
  // counts) rather than a single value the device reports directly — shown
  // with a "berechnet" marker so it's not mistaken for a raw sensor value.
  derived?: boolean;
}
