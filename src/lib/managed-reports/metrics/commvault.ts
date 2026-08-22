import { MetricDefinition, ALERT_COUNT_METHODOLOGY } from "./types";

// Kennzahlen, die der Collector-Adapter für Commvault meldet (siehe
// collector/adapters/commvault.js). key muss exakt mit dem {key}
// übereinstimmen, das der Collector an POST /api/collector/ingest sendet.
//
// Quelle: Commvaults öffentliche REST-API-Doku — wie bei NetApp/
// FusionCompute online recherchiert statt an einem realen CommCell
// verifiziert. Login/Job-/Client-Liste, Storage-Pool-Kapazität+Status,
// Index-Server-/Storage-Policy-Liste sind aus abrufbaren Doku-Seiten MIT
// Beispiel-Antwort bestätigt; sla_compliance_rate/license_expiring_soon
// stammen aus Endpunkten, deren Antwortschema nur über Suchergebnis-
// Snippets belegt ist; media_agents_down/tape_libraries_unhealthy sind am
// unsichersten (MediaAgent ausschließlich über einen Community-Forenpost
// belegt) — siehe die ausführlichen Kommentare im Adapter.
export const COMMVAULT_METRICS: MetricDefinition[] = [
  {
    key: "backup_success_rate",
    label: { de: "Backup-Erfolgsquote", en: "Backup Success Rate" },
    shortLabel: { de: "Backup-Erfolg", en: "Backup Success" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
    headline: true,
    derived: true,
    methodology: {
      de: "Anteil der im Zeitfenster (letzte 7 Tage) abgeschlossenen Jobs mit status = \"Completed\" an allen abgeschlossenen Jobs (Quelle: GET /Job?jobCategory=Finished). Jobs mit Warnungen (\"Completed w/ one or more errors\") zählen hier nicht als Erfolg, aber auch nicht in backup_jobs_failed.",
      en: "Share of finished jobs (last 7 days) with status = \"Completed\" out of all finished jobs (source: GET /Job?jobCategory=Finished). Jobs completed with warnings count neither as success here nor toward backup_jobs_failed.",
    },
  },
  {
    key: "backup_jobs_failed",
    label: { de: "Fehlgeschlagene Backup-Jobs", en: "Failed Backup Jobs" },
    format: "count",
    aggregation: "last",
    section: "availability",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Jobs der letzten 7 Tage mit Status \"Failed\", \"Killed\" oder \"Failed to Start\".",
      en: "Number of jobs in the last 7 days with status \"Failed\", \"Killed\", or \"Failed to Start\".",
    },
  },
  {
    key: "clients_not_ready",
    label: { de: "Nicht bereite Clients", en: "Clients Not Ready" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Clients mit networkReadiness ungleich \"ONLINE\" (Quelle: GET /V4/Servers?showOnlyInfrastructureMachines=0, ein einziger Aufruf für ALLE Clients). Clients mit networkReadiness \"NOT_APPLICABLE\" (kein eigenes Netzwerk-Konzept) zählen nicht mit.",
      en: "Number of clients with networkReadiness other than \"ONLINE\" (source: GET /V4/Servers?showOnlyInfrastructureMachines=0, a single call covering ALL clients). Clients with networkReadiness \"NOT_APPLICABLE\" (no network concept of their own) do not count.",
    },
  },
  {
    key: "sla_compliance_rate",
    label: { de: "SLA-Einhaltung", en: "SLA Compliance" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
    derived: true,
    methodology: {
      de: "Anteil der Clients, die laut Commvaults CommCell-SLA-Report ihr konfiguriertes Backup-SLA einhalten (Quelle: GET /api/cv/DashboardOperations/get-commcellsladetails). Antwortschema nicht gegen ein reales CommCell verifiziert — siehe Adapter-Kommentar.",
      en: "Share of clients meeting their configured backup SLA per Commvault's CommCell SLA report (source: GET /api/cv/DashboardOperations/get-commcellsladetails). Response schema not verified against a real CommCell — see adapter comment.",
    },
  },
  {
    key: "storage_total_tb",
    label: { de: "Storage-Pool-Gesamtkapazität", en: "Storage Pool Total Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    headline: true,
    derived: true,
    methodology: {
      de: "Summe totalCapacity über alle Storage Pools (Quelle: GET /StoragePool, aus abrufbarer Doku-Seite mit Beispiel-Antwort bestätigt, Byte).",
      en: "Sum of totalCapacity across all storage pools (source: GET /StoragePool, confirmed from a fetchable doc page with example response, bytes).",
    },
  },
  {
    key: "storage_used_tb",
    label: { de: "Storage-Pool genutzte Kapazität", en: "Storage Pool Used Capacity" },
    shortLabel: { de: "Kapazität", en: "Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    derived: true,
    methodology: {
      de: "Gesamtkapazität abzüglich totalFreeSpace, summiert über alle Storage Pools.",
      en: "Total capacity minus totalFreeSpace, summed across all storage pools.",
    },
  },
  {
    key: "storage_pools_unhealthy",
    label: { de: "Storage Pools mit Fehlstatus", en: "Unhealthy Storage Pools" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Storage Pools mit statusCode ungleich 0 bzw. status ungleich \"Online\" (Quelle: GET /StoragePool, Beispiel-Antwort bestätigt).",
      en: "Number of storage pools with statusCode other than 0 or status other than \"Online\" (source: GET /StoragePool, confirmed via example response).",
    },
  },
  {
    key: "index_servers_count",
    label: { de: "Index Server", en: "Index Servers" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    methodology: {
      de: "Anzahl der registrierten Index Server (Quelle: GET /IndexServers). Rein informativ — die REST-API liefert laut Doku keinen Status- oder Kapazitätswert für Index Server, nur im Command Center selbst sichtbar.",
      en: "Number of registered Index Servers (source: GET /IndexServers). Informational only — per the docs, the REST API exposes no status or capacity value for Index Servers, visible only in Command Center itself.",
    },
  },
  {
    key: "tape_libraries_unhealthy",
    label: { de: "Tape-Bibliotheken mit Fehlstatus", en: "Unhealthy Tape Libraries" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Tape-Bibliotheken mit erkennbarem Fehlstatus (Quelle: GET /V4/Storage/Tape). Endpunkt-Existenz über Commvaults SDK-Quellcode/einen Community-Forenpost belegt, Antwortschema nirgends abrufbar — mit Abstand die unsicherste Kennzahl dieses Produkts, siehe Adapter-Kommentar.",
      en: "Number of tape libraries with a recognizable fault status (source: GET /V4/Storage/Tape). Endpoint existence confirmed via Commvault's SDK source/a community forum post, response schema not found anywhere fetchable — by far the least certain metric for this product, see adapter comment.",
    },
  },
  {
    key: "storage_policies_count",
    label: { de: "Storage Policies", en: "Storage Policies" },
    format: "count",
    aggregation: "last",
    section: "capacity",
    methodology: {
      de: "Anzahl der konfigurierten Storage Policies (Quelle: GET /StoragePolicy, Beispiel-Antwort bestätigt). Rein informatives Inventar — eine Storage Policy ist ein Konfigurationsobjekt ohne eigenes Status-/Health-Feld.",
      en: "Number of configured storage policies (source: GET /StoragePolicy, confirmed via example response). Purely informational inventory — a storage policy is a configuration object with no status/health field of its own.",
    },
  },
  {
    key: "media_agents_down",
    label: { de: "MediaAgents offline", en: "MediaAgents Offline" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der MediaAgents mit offlineReason ungleich 0 (Quelle: GET /V2/MediaAgents). Dieser Endpunkt ist ausschließlich über einen Commvault-Community-Forenpost belegt, nicht über die offizielle Doku — mit Abstand die unsicherste Kennzahl dieses Produkts.",
      en: "Number of MediaAgents with offlineReason other than 0 (source: GET /V2/MediaAgents). This endpoint is documented only via a Commvault community forum post, not the official docs — by far the least certain metric for this product.",
    },
  },
  {
    key: "alerts_critical",
    label: { de: "Kritische Ereignisse", en: "Critical Events" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: ALERT_COUNT_METHODOLOGY,
  },
  {
    key: "alerts_major",
    label: { de: "Schwerwiegende Ereignisse", en: "Major Events" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: ALERT_COUNT_METHODOLOGY,
  },
  {
    key: "alerts_minor",
    label: { de: "Geringfügige Ereignisse", en: "Minor Events" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: ALERT_COUNT_METHODOLOGY,
  },
  {
    key: "license_expiring_soon",
    label: { de: "Lizenz läuft bald ab", en: "License Expiring Soon" },
    format: "count",
    aggregation: "last",
    section: "security",
    trendGood: "down",
    methodology: {
      de: "1, wenn die Commvault-Lizenz laut GET /api/cv/OpenAPI3/get-license-info innerhalb von 30 Tagen abläuft, sonst 0. Endpunkt-Pfad/Feldformat nicht gegen ein reales CommCell verifiziert.",
      en: "1 if the Commvault license (per GET /api/cv/OpenAPI3/get-license-info) expires within 30 days, else 0. Endpoint path/field format not verified against a real CommCell.",
    },
  },
];
