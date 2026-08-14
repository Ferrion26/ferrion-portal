import { MetricDefinition, ALERT_COUNT_METHODOLOGY } from "./types";

// Kennzahlen, die der Collector-Adapter für NetApp AFF/ONTAP meldet (siehe
// collector/adapters/netapp.js). key muss exakt mit dem {key}
// übereinstimmen, das der Collector an POST /api/collector/ingest sendet.
//
// Quelle: NetApps öffentliche ONTAP-REST-API-Referenz (docs.netapp.com/
// us-en/ontap-restapi/), da anders als bei Huawei keine kundenspezifische
// PDF-Doku vorlag — Felder wurden über die Python-Client-Spiegelseiten
// (library.netapp.com/ecmdocs/…/resources/{cluster,node,aggregate,disk,
// shelf,ems_event}.html) verifiziert, die dieselbe REST-Schema-Struktur
// dokumentieren. Wo die Live-Antwort eines echten Geräts noch aussteht
// (anders als bei Huawei, wo jeder Endpunkt bereits gegen ein reales Gerät
// verifiziert wurde), ist das an der jeweiligen Stelle vermerkt.
//
// Bewusst schlanker als OceanStor: Lizenz-/Zertifikats-/MFA-/Call-Home-
// Checks (ONTAP-Äquivalente: AutoSupport, /api/security/certificates,
// /api/cluster/licensing/licenses) sind hier als v2 vorgesehen, sobald der
// Kern-Healthcheck an einem echten AFF-A400 verifiziert ist.
export const NETAPP_METRICS: MetricDefinition[] = [
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
      de: "Summe aus space.block_storage.size über alle Aggregate des Clusters (Quelle: ONTAP REST API GET /api/storage/aggregates).",
      en: "Sum of space.block_storage.size across all cluster aggregates (source: ONTAP REST API GET /api/storage/aggregates).",
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
      de: "Summe aus space.block_storage.used über alle Aggregate des Clusters.",
      en: "Sum of space.block_storage.used across all cluster aggregates.",
    },
  },
  {
    key: "storage_pool_fill_level",
    label: { de: "Füllgrad Aggregate", en: "Aggregate Fill Level" },
    shortLabel: { de: "Füllgrad", en: "Fill Level" },
    format: "percent",
    aggregation: "last",
    section: "capacity",
    headline: true,
    derived: true,
    methodology: {
      de: "Genutzte ÷ Gesamtkapazität über alle Aggregate — das ONTAP-Äquivalent zum Storage-Pool-Füllgrad bei Huawei-Systemen (Aggregate sind die Storage-Pools von ONTAP).",
      en: "Used ÷ total capacity across all aggregates — the ONTAP equivalent of the storage-pool fill level on Huawei systems (aggregates are ONTAP's storage pools).",
    },
  },
  {
    key: "data_reduction_ratio",
    label: { de: "Data Reduction – Reduction Ratio", en: "Data Reduction – Reduction Ratio" },
    unit: "×",
    format: "ratio",
    aggregation: "avg",
    section: "capacity",
    derived: true,
    methodology: {
      de: "Mittelwert aus space.efficiency.ratio über alle Aggregate (Dedup + Kompression + Komprimierung, wie im ONTAP System Manager unter \"Storage efficiency\" gezeigt).",
      en: "Average of space.efficiency.ratio across all aggregates (dedup + compaction + compression, as shown in ONTAP System Manager under \"Storage efficiency\").",
    },
  },
  {
    // Nur vorhanden, wenn mindestens ein Aggregat per FabricPool an einen
    // Cloud-Speicher (S3, Azure Blob, StorageGRID, …) angebunden ist — siehe
    // capacityBreakdown für die Aufschlüsselung je Aggregat/Cloud-Ziel.
    key: "cloud_tier_used_tb",
    label: { de: "Cloud-Tier – genutzt", en: "Cloud Tier – Used" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    derived: true,
    methodology: {
      de: "Summe aus dem \"used\"-Feld aller an Aggregate angebundenen Cloud-Speicher-Ziele (FabricPool, Quelle: GET /api/storage/aggregates/{uuid}/cloud-stores).",
      en: "Sum of the \"used\" field across all cloud storage targets attached to aggregates (FabricPool, source: GET /api/storage/aggregates/{uuid}/cloud-stores).",
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
      de: "Anteil der Cluster-Nodes mit state = \"up\" beim jeweiligen Collector-Lauf (Quelle: GET /api/cluster/nodes), über den Zeitraum gemittelt.",
      en: "Share of cluster nodes with state = \"up\" at the time of each collector run (source: GET /api/cluster/nodes), averaged over the period.",
    },
  },
  {
    key: "nodes_down",
    label: { de: "Nodes nicht betriebsbereit", en: "Nodes Not Operational" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Cluster-Nodes, deren state ungleich \"up\" ist.",
      en: "Number of cluster nodes whose state is not \"up\".",
    },
  },
  {
    key: "ha_disabled",
    label: { de: "Storage-Failover deaktiviert", en: "Storage Failover Disabled" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Nodes, bei denen High-Availability-Storage-Failover (ha.enabled) deaktiviert ist — ohne HA übernimmt beim Ausfall eines Controllers kein Partner-Node, daher als kritisch statt nur Hinweis eingestuft.",
      en: "Number of nodes where high-availability storage failover (ha.enabled) is disabled — without HA, no partner node takes over if a controller fails, so this is treated as critical rather than just a note.",
    },
  },
  {
    key: "disks_faulty",
    label: { de: "Fehlerhafte Festplatten", en: "Faulty Disks" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Disks mit state = \"broken\" (Quelle: GET /api/storage/disks).",
      en: "Number of disks with state = \"broken\" (source: GET /api/storage/disks).",
    },
  },
  {
    key: "storage_pools_unhealthy",
    label: { de: "Aggregate mit Fehlstatus", en: "Unhealthy Aggregates" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Aggregate mit state ungleich \"online\" (Quelle: GET /api/storage/aggregates).",
      en: "Number of aggregates with state other than \"online\" (source: GET /api/storage/aggregates).",
    },
  },
  {
    key: "volumes_faulty",
    label: { de: "Volumes mit Fehlstatus", en: "Unhealthy Volumes" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Volumes mit state ungleich \"online\" (Quelle: ONTAP REST API GET /api/storage/volumes).",
      en: "Number of volumes with state other than \"online\" (source: ONTAP REST API GET /api/storage/volumes).",
    },
  },
  {
    key: "luns_faulty",
    label: { de: "LUNs mit Fehlstatus", en: "Unhealthy LUNs" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der LUNs mit status.state ungleich \"online\" (Quelle: ONTAP REST API GET /api/storage/luns) — als kritisch eingestuft, da ein LUN-Fehlstatus ein Verfügbarkeitsrisiko für die zugreifenden Hosts ist.",
      en: "Number of LUNs with status.state other than \"online\" (source: ONTAP REST API GET /api/storage/luns) — treated as critical, since an unhealthy LUN is an availability risk for the hosts accessing it.",
    },
  },
  {
    key: "luns_unmapped",
    label: { de: "Nicht gemappte LUNs", en: "Unmapped LUNs" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der LUNs ohne Eintrag in GET /api/protocols/san/lun-maps — kann auch eine bewusst in Vorbereitung befindliche Provisionierung sein, daher nur als Hinweis statt kritisch eingestuft.",
      en: "Number of LUNs with no entry in GET /api/protocols/san/lun-maps — can also be an intentional provisioning-in-progress state, so treated as informational rather than critical.",
    },
  },
  {
    key: "shelves_unhealthy",
    label: { de: "Disk-Shelves mit Fehlstatus", en: "Unhealthy Disk Shelves" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Disk-Shelves mit state ungleich \"ok\" (Quelle: GET /api/storage/shelves).",
      en: "Number of disk shelves with state other than \"ok\" (source: GET /api/storage/shelves).",
    },
  },
  {
    key: "power_modules_faulty",
    label: { de: "Fehlerhafte Netzteile", en: "Faulty Power Modules" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Netzteil-FRUs (frus[].type = \"psu\") an Disk-Shelves, deren Status ungleich normal ist.",
      en: "Number of power-supply FRUs (frus[].type = \"psu\") on disk shelves whose status is not normal.",
    },
  },
  {
    key: "alerts_critical",
    label: { de: "Kritische Alarme", en: "Critical Alerts" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: {
      de: `EMS-Ereignisse (GET /api/support/ems/events) mit Severity "emergency" oder "alert" im Berichtszeitraum. ${ALERT_COUNT_METHODOLOGY.de}`,
      en: `EMS events (GET /api/support/ems/events) with severity "emergency" or "alert" during the reporting period. ${ALERT_COUNT_METHODOLOGY.en}`,
    },
  },
  {
    key: "alerts_major",
    label: { de: "Schwerwiegende Alarme", en: "Major Alerts" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: {
      de: `EMS-Ereignisse mit Severity "error" im Berichtszeitraum. ${ALERT_COUNT_METHODOLOGY.de}`,
      en: `EMS events with severity "error" during the reporting period. ${ALERT_COUNT_METHODOLOGY.en}`,
    },
  },
  {
    key: "alerts_warning",
    label: { de: "Warnungen", en: "Warnings" },
    format: "count",
    aggregation: "sum",
    section: "security",
    trendGood: "down",
    methodology: {
      de: `EMS-Ereignisse mit Severity "notice" im Berichtszeitraum. ${ALERT_COUNT_METHODOLOGY.de}`,
      en: `EMS events with severity "notice" during the reporting period. ${ALERT_COUNT_METHODOLOGY.en}`,
    },
  },
];
