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
    derived: true,
    source: "databackup",
    methodology: {
      de: "Berechnet als erfolgreiche Backup-Jobs ÷ alle Backup-Jobs im Berichtszeitraum, je Ressource ausgewertet (Quelle: OceanProtect DataBackup Job-Statistik). Kein vom Gerät direkt gemeldeter Einzelwert, sondern aus den Job-Rohdaten aggregiert.",
      en: "Calculated as successful backup jobs ÷ all backup jobs in the reporting period, evaluated per resource (source: OceanProtect DataBackup job statistics). Not a single value reported directly by the device — aggregated from raw job data.",
    },
  },
  {
    key: "rpo_compliance_rate",
    label: { de: "RPO-Einhaltung", en: "RPO Compliance" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
    headline: true,
    derived: true,
    source: "databackup",
    methodology: {
      de: "Anteil geschützter Ressourcen, deren letzte Sicherung innerhalb des vereinbarten Recovery Point Objective liegt (Quelle: OceanProtect DataBackup SLA-Compliance-Statistik).",
      en: "Share of protected resources whose most recent backup falls within the agreed Recovery Point Objective (source: OceanProtect DataBackup SLA compliance statistics).",
    },
  },
  {
    key: "sla_compliant_count",
    label: { de: "SLA-konforme Ressourcen", en: "SLA-Compliant Resources" },
    format: "count",
    aggregation: "last",
    section: "availability",
    source: "databackup",
  },
  {
    key: "sla_noncompliant_count",
    label: { de: "SLA-abweichende Ressourcen", en: "SLA-Non-Compliant Resources" },
    format: "count",
    aggregation: "last",
    section: "availability",
    trendGood: "down",
    source: "databackup",
  },
  {
    key: "resource_protection_rate",
    label: { de: "Ressourcen-Schutzquote", en: "Resource Protection Rate" },
    format: "percent",
    aggregation: "avg",
    section: "availability",
    trendGood: "up",
    derived: true,
    source: "databackup",
    methodology: {
      de: "Anteil der bei DataBackup bekannten Ressourcen (Dateisysteme, Datenbanken, VMs, …), für die aktuell eine Schutzrichtlinie aktiv ist (Quelle: OceanProtect DataBackup Ressourcenschutz-Übersicht).",
      en: "Share of resources known to DataBackup (file systems, databases, VMs, …) that currently have an active protection policy (source: OceanProtect DataBackup resource protection summary).",
    },
  },
  {
    key: "resources_protected_count",
    label: { de: "Geschützte Ressourcen", en: "Protected Resources" },
    format: "count",
    aggregation: "last",
    section: "availability",
    source: "databackup",
  },
  {
    key: "resources_unprotected_count",
    label: { de: "Ungeschützte Ressourcen", en: "Unprotected Resources" },
    format: "count",
    aggregation: "last",
    section: "availability",
    trendGood: "down",
    source: "databackup",
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
    source: "databackup",
  },
  {
    key: "total_capacity_tb",
    label: { de: "Gesamtkapazität", en: "Total Capacity" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    headline: true,
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
    // Gesamte Datenreduktion (Dedup + Kompression) — entspricht dem
    // "Reduction Ratio" im DeviceManager (Kachel "Data Reduction").
    key: "data_reduction_ratio",
    label: { de: "Data Reduction – Reduction Ratio", en: "Data Reduction – Reduction Ratio" },
    unit: "×",
    format: "ratio",
    aggregation: "avg",
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
    // Errechnet aus protected_capacity_tb × data_reduction_ratio — die
    // logische Kapazität, die ohne Reduktion belegt wäre ("Pre-Savings" im
    // DeviceManager).
    key: "capacity_before_reduction_tb",
    label: { de: "Data Reduction – Pre-Savings", en: "Data Reduction – Pre-Savings" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    derived: true,
    methodology: {
      de: "Berechnet als genutzte Kapazität × Gesamtreduktionsrate — kein eigener Rohwert des Geräts, sondern die logische Kapazität, die ohne Deduplizierung/Kompression belegt wäre (\"Pre-Savings\").",
      en: "Calculated as used capacity × overall reduction ratio — not a raw device value, but the logical capacity that would be used without deduplication/compression (\"pre-savings\").",
    },
  },
  {
    // DataBackup-eigene Reduktionsrate (Cluster-Ebene, /v1/clusters/capacity)
    // — deutlich höher als data_reduction_ratio oben, weil sie auf sich
    // stark ähnelnden Backup-Kopien (viele Snapshots derselben Ressource)
    // rechnet statt auf Primärdaten im Storage Pool. Getrennt benannt, damit
    // beide Werte nicht verwechselt werden.
    key: "databackup_reduction_ratio",
    label: { de: "DataBackup – Reduction Ratio", en: "DataBackup – Reduction Ratio" },
    unit: "×",
    format: "ratio",
    aggregation: "avg",
    section: "capacity",
    source: "databackup",
  },
  {
    key: "databackup_logical_usage_tb",
    label: { de: "DataBackup – Logische Nutzung", en: "DataBackup – Logical Usage" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    source: "databackup",
  },
  {
    key: "databackup_physical_usage_tb",
    label: { de: "DataBackup – Physische Nutzung", en: "DataBackup – Physical Usage" },
    unit: "TB",
    format: "tb",
    aggregation: "last",
    section: "capacity",
    source: "databackup",
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
      de: "100 %, wenn Systemzustand und Betriebszustand des Geräts (HEALTHSTATUS/RUNNINGSTATUS) beim jeweiligen Collector-Lauf \"Normal\" waren, sonst 0 % — über den Zeitraum gemittelt.",
      en: "100% when the device's health and running status (HEALTHSTATUS/RUNNINGSTATUS) were \"Normal\" at the time of each collector run, otherwise 0% — averaged over the period.",
    },
  },
  {
    // Schwellwerte entsprechen Huaweis eigener Inspector-Regel für
    // Controller-CPU/Cache-Watermark: <=60% normal, <=80% "Optimierung
    // empfohlen", darüber kritisch.
    key: "controller_cpu_usage_avg",
    label: { de: "Controller-CPU-Auslastung (Ø aller Controller)", en: "Controller CPU Usage (avg. across all controllers)" },
    shortLabel: { de: "Controller-CPU (Ø)", en: "Controller CPU (avg.)" },
    format: "percent",
    aggregation: "avg",
    section: "hardware",
    trendGood: "down",
    derived: true,
    methodology: {
      de: "Durchschnitt der CPU-Auslastung über alle Storage-Controller des Systems (bei Dual-/Multi-Controller-Systemen ein Cluster-weiter Mittelwert, keine Aussage über einzelne Controller).",
      en: "Average CPU usage across all storage controllers in the system (on dual-/multi-controller systems a cluster-wide mean, not a statement about any individual controller).",
    },
  },
  {
    key: "controller_memory_usage_avg",
    label: { de: "Controller-Speicherauslastung (Ø aller Controller)", en: "Controller Memory Usage (avg. across all controllers)" },
    shortLabel: { de: "Controller-RAM (Ø)", en: "Controller RAM (avg.)" },
    format: "percent",
    aggregation: "avg",
    section: "hardware",
    derived: true,
    methodology: {
      de: "Durchschnittliche Auslastung des Arbeitsspeichers (Cache/Metadaten-Puffer) über alle Storage-Controller des Systems. Ein hoher Wert ist bei Storage-Controllern normal (Caching-Architektur) und für sich genommen kein Fehlerzeichen.",
      en: "Average memory usage (cache/metadata buffer) across all storage controllers in the system. A high value is normal for storage controllers (caching architecture) and not by itself a fault indicator.",
    },
  },
  {
    // Gehäuse (Controller-Enclosures + Disk-Enclosures) — Teil des
    // Hardware-Inventars ("Hardware > Inventory" im DeviceManager).
    key: "enclosures_faulty",
    label: { de: "Fehlerhafte Gehäuse", en: "Faulty Enclosures" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
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
    // Aus dem Inspector-Healthcheck ("Consistency Check of the System
    // Software Version") — unterschiedliche Firmware-Stände zwischen
    // Controllern deuten auf ein unvollständiges Update hin.
    key: "controllers_firmware_inconsistent",
    label: { de: "Firmware zwischen Controllern uneinheitlich", en: "Firmware Inconsistent Across Controllers" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "1, wenn die Controller des Systems unterschiedliche Firmware-Versionen melden (Quelle: DeviceManager Controller-Firmware-Version), sonst 0.",
      en: "1 if the system's controllers report different firmware versions (source: DeviceManager controller firmware version), otherwise 0.",
    },
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
    // Nur vorhanden, wenn das Gerät überhaupt Filesysteme führt (bei
    // OceanProtect als Backup-Ziel meist ja, z. B. für NAS-Freigaben).
    key: "filesystems_faulty",
    label: { de: "Fehlerhafte Dateisysteme", en: "Faulty File Systems" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    // Alle Storage Pools (nicht nur der für Kapazitätskennzahlen
    // konfigurierte) — ein zweiter, nicht überwachter Pool könnte sonst
    // unbemerkt in einen Fehlerzustand geraten.
    key: "storage_pools_unhealthy",
    label: { de: "Storage Pools mit Fehlstatus", en: "Unhealthy Storage Pools" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    key: "bbu_faulty",
    label: { de: "Fehlerhafte Batterien (BBU)", en: "Faulty Battery Backup Units" },
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
    // Aus dem Huawei-Inspector-Healthcheck übernommener Check ("Optical
    // module status") — meldet z. B. eine Diskrepanz zwischen Modul- und
    // Port-Übertragungsrate.
    key: "optical_modules_faulty",
    label: { de: "Fehlerhafte Transceiver/Optikmodule", en: "Faulty Transceivers/Optical Modules" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
  },
  {
    // Ebenfalls aus dem Inspector-Healthcheck abgeleitet ("Checking DME IQ
    // Access"): ohne Email- oder Syslog-Weiterleitung bemerkt niemand einen
    // Alarm, außer jemand schaut aktiv im DeviceManager nach.
    key: "email_notifications_disabled",
    label: { de: "E-Mail-Benachrichtigung nicht eingerichtet", en: "Email Notifications Not Configured" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    methodology: {
      de: "1, wenn im Gerät keine E-Mail-Weiterleitung für Alarme aktiviert ist (Quelle: DeviceManager E-Mail-Konfiguration), sonst 0.",
      en: "1 if the device has no email forwarding enabled for alarms (source: DeviceManager email configuration), otherwise 0.",
    },
  },
  {
    key: "syslog_notifications_disabled",
    label: { de: "Syslog-Benachrichtigung nicht eingerichtet", en: "Syslog Notifications Not Configured" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    methodology: {
      de: "1, wenn im Gerät keine Syslog-Weiterleitung für Alarme aktiviert ist (Quelle: DeviceManager Syslog-Konfiguration), sonst 0.",
      en: "1 if the device has no syslog forwarding enabled for alarms (source: DeviceManager syslog configuration), otherwise 0.",
    },
  },
  {
    // Aus dem Inspector-Healthcheck ("Whether a temporary license exists").
    key: "license_expiring_soon",
    label: { de: "Lizenz läuft bald ab", en: "License Expiring Soon" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    methodology: {
      de: "1, wenn eine aktive Lizenzfunktion innerhalb von 30 Tagen abläuft oder bereits abgelaufen ist (Quelle: DeviceManager Lizenzstatus), sonst 0.",
      en: "1 if an active license feature expires within 30 days or has already expired (source: DeviceManager license status), otherwise 0.",
    },
  },
  {
    // Aus dem Inspector-Healthcheck ("Checking Certificate Expiration Time").
    key: "certificate_expiring_soon",
    label: { de: "Zertifikat läuft bald ab", en: "Certificate Expiring Soon" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    methodology: {
      de: "1, wenn ein gültiges Zertifikat des Geräts innerhalb von 30 Tagen abläuft (Quelle: DeviceManager Zertifikatsstatus), sonst 0.",
      en: "1 if a valid device certificate expires within 30 days (source: DeviceManager certificate status), otherwise 0.",
    },
  },
  {
    // DME IQ ist Huaweis Remote-O&M-/Call-Home-Kanal — ohne ihn bemerkt
    // weder Huawei noch Ferrion proaktiv einen Gerätefehler oder eine
    // anstehende Firmware-Warnung; bewusst als Kritisch statt nur Hinweis
    // eingestuft (severeIfNonZero), da das ein blinder Fleck im gesamten
    // Support-Prozess ist, nicht nur ein einzelnes "sollte man einrichten".
    key: "dme_iq_disabled",
    label: { de: "DME IQ (Remote-Support-Kanal) nicht verbunden", en: "DME IQ (Remote Support Channel) Not Connected" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "1, wenn die Verbindung zu Huaweis DME-IQ-Remote-Support-Dienst deaktiviert ist (Quelle: DeviceManager Remote-O&M-Richtlinie), sonst 0.",
      en: "1 if the connection to Huawei's DME IQ remote support service is disabled (source: DeviceManager remote O&M policy), otherwise 0.",
    },
  },
  {
    // Aus den Settings unter "User and Security" — ob eine Mehrfaktor-
    // Authentifizierung (hier: E-Mail-basiertes Einmalpasswort) für Logins
    // eingerichtet ist. Empfehlung statt Kritisch, da fehlende MFA ein
    // Risiko, aber kein akuter Fehlerzustand ist.
    key: "mfa_disabled",
    label: { de: "Multi-Faktor-Authentifizierung nicht eingerichtet", en: "Multi-Factor Authentication Not Configured" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    methodology: {
      de: "1, wenn keine E-Mail-basierte Mehrfaktor-Authentifizierung für Logins eingerichtet ist (Quelle: DeviceManager Benutzerauthentifizierung), sonst 0. Empfehlung, kein akuter Fehlerzustand.",
      en: "1 if no email-based multi-factor authentication is configured for logins (source: DeviceManager user authentication), otherwise 0. A recommendation, not an active fault.",
    },
  },
  {
    // Backup-Software (DataBackup) läuft als Container-Dienst auf dem
    // Storage-Controller — dies sind die ihm zugeteilten Ressourcen, nicht
    // dessen tatsächliche Auslastung (dafür liefert die REST-API keinen
    // Wert). Kein Softwareversions-Feld verfügbar (siehe deviceSoftwareVersion
    // für die Appliance-Firmware, das ist eine andere Versionsnummer).
    key: "container_cpu_cores",
    label: { de: "Container-Dienst: zugeteilte CPU-Kerne", en: "Container Service: Allocated CPU Cores" },
    format: "count",
    aggregation: "last",
    section: "operations",
  },
  {
    key: "container_memory_gb",
    label: { de: "Container-Dienst: zugeteilter Arbeitsspeicher", en: "Container Service: Allocated Memory" },
    unit: "GB",
    format: "gb",
    aggregation: "last",
    section: "operations",
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
    // Nur vorhanden, wenn überhaupt Remote-Devices konfiguriert sind — eigener
    // Verbindungsstatus zum Replikationsziel, unabhängig vom Status der
    // Replikationspaare selbst (die Geräteverbindung kann ausfallen, ohne
    // dass sich das sofort in den Paaren zeigt).
    key: "remote_devices_unhealthy",
    label: { de: "Remote-Devices mit Fehlstatus", en: "Unhealthy Remote Devices" },
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
    source: "databackup",
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
    source: "databackup",
  },
  {
    key: "recovery_drill_success_rate",
    label: { de: "Recovery-Drill-Erfolgsquote", en: "Recovery Drill Success Rate" },
    format: "percent",
    aggregation: "avg",
    section: "security",
    trendGood: "up",
    derived: true,
    source: "databackup",
    methodology: {
      de: "Berechnet als erfolgreiche Recovery-Drills ÷ alle durchgeführten Recovery-Drills im Berichtszeitraum (Quelle: OceanProtect DataBackup Recovery-Drill-Statistik).",
      en: "Calculated as successful recovery drills ÷ all recovery drills executed in the reporting period (source: OceanProtect DataBackup recovery drill statistics).",
    },
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
    source: "databackup",
  },
  {
    key: "ransomware_abnormal_copies",
    label: { de: "Auffällige Kopien erkannt", en: "Abnormal Copies Detected" },
    format: "count",
    aggregation: "last",
    section: "security",
    trendGood: "down",
    source: "databackup",
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
    key: "alerts_major",
    label: { de: "Schwerwiegende Alarme", en: "Major Alerts" },
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
