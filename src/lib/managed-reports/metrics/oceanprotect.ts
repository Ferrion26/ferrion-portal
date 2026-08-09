import { MetricDefinition } from "./types";

// Kennzahlen, die der Collector-Adapter für Huawei OceanProtect meldet
// (siehe collector/adapters/oceanprotect.ts). key muss exakt mit dem
// {key} übereinstimmen, das der Collector an POST /api/collector/ingest sendet.
export const OCEANPROTECT_METRICS: MetricDefinition[] = [
  {
    key: "backup_success_rate",
    label: { de: "Backup-Erfolgsquote", en: "Backup Success Rate" },
    shortLabel: { de: "Backup-Erfolg", en: "Backup Success" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
    headline: true,
    methodology: {
      de: "Anteil erfolgreich abgeschlossener Backup-Jobs an allen Backup-Jobs im Berichtszeitraum, je Ressource ausgewertet (Quelle: OceanProtect DataBackup Job-Statistik).",
      en: "Share of backup jobs completed successfully out of all backup jobs in the reporting period, evaluated per resource (source: OceanProtect DataBackup job statistics).",
    },
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
    // Quelle: /v1/report-data/jobs (derselbe Aufruf wie backup_success_rate).
    // "last" statt "sum", da die zugrunde liegende Kennzahl bereits ein
    // rollierendes 3-Monats-Fenster ist — Aufsummieren über mehrere
    // Tagesmessungen würde denselben Zeitraum mehrfach zählen.
    key: "backup_failed_jobs_count",
    label: { de: "Fehlgeschlagene Backup-Jobs", en: "Failed Backup Jobs" },
    format: "count",
    aggregation: "last",
    section: "availability",
    trendGood: "down",
  },
  {
    key: "protected_capacity_tb",
    label: { de: "Geschützte Kapazität", en: "Protected Capacity" },
    shortLabel: { de: "Kapazität", en: "Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    headline: true,
  },
  {
    key: "storage_pool_fill_level",
    label: { de: "Füllgrad Storage Pool", en: "Storage Pool Fill Level" },
    shortLabel: { de: "Pool-Füllgrad", en: "Pool Fill Level" },
    format: "percent",
    aggregation: "last",
    section: "capacity",
    headline: true,
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
    key: "system_availability",
    label: { de: "Systemverfügbarkeit", en: "System Availability" },
    shortLabel: { de: "System", en: "System" },
    format: "percent",
    aggregation: "avg",
    section: "hardware",
    trendGood: "up",
    headline: true,
  },
  {
    key: "controller_cpu_usage_avg",
    label: { de: "Controller-CPU-Auslastung", en: "Controller CPU Usage" },
    format: "percent",
    aggregation: "avg",
    section: "hardware",
  },
  {
    key: "controller_memory_usage_avg",
    label: { de: "Controller-Speicherauslastung", en: "Controller Memory Usage" },
    format: "percent",
    aggregation: "avg",
    section: "hardware",
  },
  {
    key: "controllers_faulty",
    label: { de: "Fehlerhafte Controller", en: "Faulty Controllers" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    key: "disks_faulty",
    label: { de: "Fehlerhafte Festplatten", en: "Faulty Disks" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    key: "fans_faulty",
    label: { de: "Fehlerhafte Lüfter", en: "Faulty Fans" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    key: "power_modules_faulty",
    label: { de: "Fehlerhafte Netzteile", en: "Faulty Power Modules" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    key: "eth_ports_down",
    label: { de: "Netzwerk-Ports offline", en: "Network Ports Down" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    // Nur vorhanden, wenn überhaupt Remote-Replication-Pairs konfiguriert
    // sind — sonst wird die Kennzahl vom Collector gar nicht erst gemeldet.
    key: "replication_pairs_unhealthy",
    label: { de: "Replikationspaare mit Fehlstatus", en: "Unhealthy Replication Pairs" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    key: "air_gap_isolation_events",
    label: { de: "Air-Gap-Isolationen ausgelöst", en: "Air-Gap Isolations Triggered" },
    format: "count",
    aggregation: "sum",
    section: "security",
  },
  {
    // Quelle: /v1/anti-ransomware/recovery-drill/plans/statistics.
    // "last" statt "sum" — unklar aus der Doku, ob totalDrillExecutionCount
    // kumulativ seit Einrichtung ist oder ein Zeitfenster abbildet; "last"
    // vermeidet in beiden Fällen ein fehlerhaftes Aufsummieren.
    key: "recovery_drills_executed",
    label: { de: "Recovery-Drills durchgeführt", en: "Recovery Drills Executed" },
    format: "count",
    aggregation: "last",
    section: "security",
  },
  {
    key: "recovery_drill_success_rate",
    label: { de: "Recovery-Drill-Erfolgsquote", en: "Recovery Drill Success Rate" },
    format: "percent",
    aggregation: "avg",
    section: "security",
    trendGood: "up",
  },
  {
    // Quelle: /v1/copies/detect-statistics (Anti-Ransomware-Erkennung auf
    // Kopien) — infizierte Kopien.
    key: "ransomware_infected_copies",
    label: { de: "Infizierte Kopien erkannt", en: "Infected Copies Detected" },
    format: "count",
    aggregation: "last",
    section: "security",
    trendGood: "down",
  },
  {
    key: "ransomware_abnormal_copies",
    label: { de: "Auffällige Kopien erkannt", en: "Abnormal Copies Detected" },
    format: "count",
    aggregation: "last",
    section: "security",
    trendGood: "down",
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
