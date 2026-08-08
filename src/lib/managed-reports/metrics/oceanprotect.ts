import { MetricDefinition } from "./types";

// Kennzahlen, die der Collector-Adapter für Huawei OceanProtect meldet
// (siehe collector/adapters/oceanprotect.ts). key muss exakt mit dem
// {key} übereinstimmen, das der Collector an POST /api/collector/ingest sendet.
export const OCEANPROTECT_METRICS: MetricDefinition[] = [
  {
    key: "backup_success_rate",
    label: { de: "Backup-Erfolgsquote", en: "Backup Success Rate" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
  },
  {
    key: "rpo_compliance_rate",
    label: { de: "RPO-Einhaltung", en: "RPO Compliance" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
  },
  {
    key: "protected_capacity_tb",
    label: { de: "Geschützte Kapazität", en: "Protected Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
  },
  {
    key: "dedup_ratio",
    label: { de: "Deduplizierungsrate", en: "Deduplication Ratio" },
    unit: "×",
    format: "ratio",
    aggregation: "avg",
    section: "capacity",
  },
  {
    key: "air_gap_isolation_events",
    label: { de: "Air-Gap-Isolationen ausgelöst", en: "Air-Gap Isolations Triggered" },
    format: "count",
    aggregation: "sum",
    section: "security",
  },
  {
    key: "alerts_critical",
    label: { de: "Kritische Alarme", en: "Critical Alerts" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
  },
  {
    key: "alerts_warning",
    label: { de: "Warnungen", en: "Warnings" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
  },
  {
    key: "incidents_count",
    label: { de: "Vorfälle bearbeitet", en: "Incidents Handled" },
    format: "count",
    aggregation: "sum",
    section: "operations",
    trendGood: "down",
  },
];
