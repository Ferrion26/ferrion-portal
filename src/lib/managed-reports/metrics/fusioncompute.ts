import { MetricDefinition, ALERT_COUNT_METHODOLOGY } from "./types";

// Kennzahlen, die der Collector-Adapter für Huawei FusionCompute meldet
// (siehe collector/adapters/fusioncompute.js). key muss exakt mit dem
// {key} übereinstimmen, das der Collector an POST /api/collector/ingest
// sendet.
//
// Quelle: FusionCompute 8.10.0 VRM-REST-Doku (docs/Rest/ im Repo) — wie
// beim NetApp-Adapter online/aus mitgelieferter Doku recherchiert statt an
// einem realen Gerät verifiziert. Kein cluster-bezogener Healthcheck, da
// die Doku für Cluster-Objekte kein Statusfeld dokumentiert (siehe
// Kommentar im Adapter).
export const FUSIONCOMPUTE_METRICS: MetricDefinition[] = [
  {
    key: "total_capacity_tb",
    label: { de: "Gesamtkapazität", en: "Total Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    headline: true,
    derived: true,
    methodology: {
      de: "Summe aus actualCapacityGB über alle Datastores der Site (Quelle: VRM-REST-API GET /service/sites/{site_id}/datastores).",
      en: "Sum of actualCapacityGB across all datastores in the site (source: VRM REST API GET /service/sites/{site_id}/datastores).",
    },
  },
  {
    key: "used_capacity_tb",
    label: { de: "Genutzte Kapazität", en: "Used Capacity" },
    shortLabel: { de: "Kapazität", en: "Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    headline: true,
    derived: true,
    methodology: {
      de: "Summe aus usedSizeGB über alle Datastores der Site.",
      en: "Sum of usedSizeGB across all datastores in the site.",
    },
  },
  {
    key: "storage_pool_fill_level",
    label: { de: "Füllgrad Datastores", en: "Datastore Fill Level" },
    shortLabel: { de: "Füllgrad", en: "Fill Level" },
    format: "percent",
    aggregation: "last",
    section: "capacity",
    derived: true,
    methodology: {
      de: "Genutzte ÷ Gesamtkapazität über alle Datastores der Site.",
      en: "Used ÷ total capacity across all datastores in the site.",
    },
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
    derived: true,
    methodology: {
      de: "Anteil der Hosts mit status = \"normal\" beim jeweiligen Collector-Lauf (Quelle: GET /service/sites/{site_id}/hosts), über den Zeitraum gemittelt.",
      en: "Share of hosts with status = \"normal\" at the time of each collector run (source: GET /service/sites/{site_id}/hosts), averaged over the period.",
    },
  },
  {
    key: "hosts_faulty",
    label: { de: "Fehlerhafte Hosts", en: "Faulty Hosts" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Hosts mit status = \"fault\" oder \"unknow\" (Übergangszustände wie rebooting/poweroff/booting zählen nicht als Fehler).",
      en: "Number of hosts with status = \"fault\" or \"unknow\" (transitional states like rebooting/poweroff/booting do not count as faults).",
    },
  },
  {
    key: "hosts_maintenance",
    label: { de: "Hosts im Wartungsmodus", en: "Hosts in Maintenance Mode" },
    format: "count",
    aggregation: "last",
    section: "operations",
    // Kein trendGood: Wartungsmodus kann bewusst und gewollt aktiviert sein
    // (z. B. während geplanter Arbeiten) — anders als "hosts_faulty" keine
    // automatische Gut/Schlecht-Einstufung.
    methodology: {
      de: "Anzahl der Hosts mit isMaintaining = true.",
      en: "Number of hosts with isMaintaining = true.",
    },
  },
  {
    key: "datastores_unhealthy",
    label: { de: "Datastores mit Fehlstatus", en: "Unhealthy Datastores" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Datastores mit status ungleich \"NORMAL\" (Quelle: GET /service/sites/{site_id}/datastores).",
      en: "Number of datastores with status other than \"NORMAL\" (source: GET /service/sites/{site_id}/datastores).",
    },
  },
  {
    key: "vms_faulty",
    label: { de: "VMs mit Fehlstatus", en: "Faulty VMs" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der VMs mit status = \"unknown\" — andere Zustände wie stopped/hibernated/pause sind gewollt und zählen nicht als Fehler.",
      en: "Number of VMs with status = \"unknown\" — other states like stopped/hibernated/pause are intentional and do not count as faults.",
    },
  },
  {
    key: "alerts_critical",
    label: { de: "Kritische Alarme", en: "Critical Alerts" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: ALERT_COUNT_METHODOLOGY,
  },
  {
    key: "alerts_major",
    label: { de: "Schwerwiegende Alarme", en: "Major Alerts" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: ALERT_COUNT_METHODOLOGY,
  },
  {
    key: "alerts_warning",
    label: { de: "Warnungen", en: "Warnings" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: ALERT_COUNT_METHODOLOGY,
  },
];
