export type MetricFormat = "percent" | "tb" | "gb" | "ratio" | "count";

// How readings within a quarter collapse into one report figure:
// "avg" for rates/ratios, "sum" for counters (incidents, alerts),
// "last" for point-in-time levels (capacity currently in use).
export type MetricAggregation = "avg" | "sum" | "last";

export type ReportSection = "availability" | "capacity" | "security" | "operations";

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
}
