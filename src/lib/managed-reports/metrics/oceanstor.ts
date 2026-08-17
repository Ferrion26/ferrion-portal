import { MetricDefinition, ALERT_COUNT_METHODOLOGY } from "./types";

// Kennzahlen, die der Collector-Adapter für Huawei OceanStor meldet (siehe
// collector/adapters/oceanstor.js). key muss exakt mit dem {key}
// übereinstimmen, das der Collector an POST /api/collector/ingest sendet.
// OceanStor ist reiner Primärspeicher (keine Backup-Software-Ebene wie bei
// OceanProtect) — die Checks entsprechen daher weitgehend der Storage-/
// Hardware-Seite der OceanProtect-Metriken, ohne Backup-/SLA-/Air-Gap-Werte.
export const OCEANSTOR_METRICS: MetricDefinition[] = [
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
    key: "used_capacity_tb",
    label: { de: "Genutzte Kapazität", en: "Used Capacity" },
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
    key: "snapshot_count",
    label: { de: "Dateisystem-Snapshots", en: "File System Snapshots" },
    format: "count",
    aggregation: "last",
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
    derived: true,
    methodology: {
      de: "100 %, wenn Systemzustand und Betriebszustand des Geräts (HEALTHSTATUS/RUNNINGSTATUS) beim jeweiligen Collector-Lauf \"Normal\" waren, sonst 0 % — über den Zeitraum gemittelt.",
      en: "100% when the device's health and running status (HEALTHSTATUS/RUNNINGSTATUS) were \"Normal\" at the time of each collector run, otherwise 0% — averaged over the period.",
    },
  },
  {
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
    key: "luns_faulty",
    label: { de: "LUNs mit Fehlstatus", en: "Unhealthy LUNs" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der LUNs mit HEALTHSTATUS ungleich 1 (Normal) (Quelle: DeviceManager-REST GET /lun) — als kritisch eingestuft, da ein LUN-Fehlstatus ein Verfügbarkeitsrisiko für die zugreifenden Hosts ist.",
      en: "Number of LUNs with HEALTHSTATUS other than 1 (Normal) (source: DeviceManager REST GET /lun) — treated as critical, since an unhealthy LUN is an availability risk for the hosts accessing it.",
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
      de: "Anzahl der LUNs ohne auflösbare Host-/Initiator-Zuordnung über eine Mapping View (Quelle: DeviceManager-REST GET /mappingview, /lungroup, /hostgroup) — kann auch eine bewusst in Vorbereitung befindliche Provisionierung sein, daher nur als Hinweis statt kritisch eingestuft.",
      en: "Number of LUNs with no resolvable host/initiator assignment via a mapping view (source: DeviceManager REST GET /mappingview, /lungroup, /hostgroup) — can also be an intentional provisioning-in-progress state, so treated as informational rather than critical.",
    },
  },
  {
    key: "hosts_with_down_links",
    label: { de: "Hosts mit ausgefallenem Pfad", en: "Hosts With a Down Path" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Hosts mit mindestens einem Link mit RUNNINGSTATUS \"down\"/\"offline\"/\"disabled\" (Quelle: DeviceManager-REST GET /host_link) — ein reduzierter Multipath-Redundanzgrad ist ein Verfügbarkeitsrisiko.",
      en: "Number of hosts with at least one link reporting RUNNINGSTATUS \"down\"/\"offline\"/\"disabled\" (source: DeviceManager REST GET /host_link) — reduced multipath redundancy is an availability risk.",
    },
  },
  {
    key: "fc_ports_down",
    label: { de: "Offline FC-Ports", en: "Offline FC Ports" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der FC-Ports mit RUNNINGSTATUS \"down\" (Quelle: DeviceManager-REST GET /fc_port).",
      en: "Number of FC ports with RUNNINGSTATUS \"down\" (source: DeviceManager REST GET /fc_port).",
    },
  },
  {
    key: "fc_ports_degraded_speed",
    label: { de: "FC-Ports mit reduzierter Geschwindigkeit", en: "FC Ports Running Below Max Speed" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der laufenden FC-Ports, deren ausgehandelte Geschwindigkeit (RUNSPEED) unter der maximal unterstützten (MAXSUPPORTSPEED) liegt (Quelle: DeviceManager-REST GET /fc_port) — deutet auf ein Kabel-/SFP-/Gegenstellenproblem hin.",
      en: "Number of running FC ports whose negotiated speed (RUNSPEED) is below the maximum supported speed (MAXSUPPORTSPEED) (source: DeviceManager REST GET /fc_port) — suggests a cable/SFP/peer issue.",
    },
  },
  {
    key: "replication_pairs_lagging",
    label: { de: "Replikationspaare mit Verzögerung", en: "Lagging Replication Pairs" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    methodology: {
      de: "Anzahl der asynchronen Replikationspaare mit TIMEDIFFERENCE > 1 Stunde (Quelle: DeviceManager-REST GET /REPLICATIONPAIR) — fest hinterlegter Schwellwert, da kein geräteseitig konfigurierter Lag-Schwellwert dokumentiert ist.",
      en: "Number of asynchronous replication pairs with TIMEDIFFERENCE > 1 hour (source: DeviceManager REST GET /REPLICATIONPAIR) — fixed threshold, since no device-configured lag threshold is documented.",
    },
  },
  {
    key: "storage_pool_oversubscription_pct",
    label: { de: "Thin-Provisioning-Überbuchung", en: "Thin-Provisioning Oversubscription" },
    unit: "%",
    format: "percent",
    aggregation: "last",
    section: "capacity",
    derived: true,
    methodology: {
      de: "Zugesagte (logische) Kapazität aller Thin-LUNs/-Dateisysteme (SUBSCRIBEDCAPACITY) im Verhältnis zur physisch vorhandenen Pool-Kapazität (USERTOTALCAPACITY) (Quelle: DeviceManager-REST GET /storagepool) — rein informativ, Überbuchung ist gewollte Kapazitätsplanung, keine Störung für sich.",
      en: "Committed (logical) capacity of all thin LUNs/file systems (SUBSCRIBEDCAPACITY) relative to the physically available pool capacity (USERTOTALCAPACITY) (source: DeviceManager REST GET /storagepool) — purely informational, oversubscription is intentional capacity planning, not a fault by itself.",
    },
  },
  {
    key: "storage_pool_over_provisioning_limit",
    label: { de: "Überbuchung über Gerätelimit", en: "Oversubscription Above Device Limit" },
    format: "count",
    aggregation: "last",
    section: "capacity",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "1, wenn die Überbuchung den geräteseitig konfigurierten Schwellwert (PROVISIONINGLIMIT) überschreitet — nur ausgewertet, wenn PROVISIONINGLIMITSWITCH aktiv ist (Quelle: DeviceManager-REST GET /storagepool).",
      en: "1 if the oversubscription exceeds the device-configured threshold (PROVISIONINGLIMIT) — only evaluated when PROVISIONINGLIMITSWITCH is active (source: DeviceManager REST GET /storagepool).",
    },
  },
  {
    key: "filesystems_snapshot_reserve_exhausted",
    label: { de: "Dateisysteme mit voller Snapshot-Reserve", en: "File Systems With Exhausted Snapshot Reserve" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
    severeIfNonZero: true,
    methodology: {
      de: "Anzahl der Dateisysteme, bei denen SNAPSHOTUSECAPACITY die reservierte SNAPSHOTRESERVECAPACITY erreicht oder überschreitet (Quelle: DeviceManager-REST GET /filesystem) — neue Snapshots können dann fehlschlagen oder ältere werden automatisch verworfen.",
      en: "Number of file systems where SNAPSHOTUSECAPACITY reaches or exceeds the reserved SNAPSHOTRESERVECAPACITY (source: DeviceManager REST GET /filesystem) — new snapshots may then fail or older ones get discarded automatically.",
    },
  },
  {
    key: "ntp_out_of_sync",
    label: { de: "NTP-Zeitsynchronisation gestört", en: "NTP Time Sync Out of Sync" },
    format: "count",
    aggregation: "last",
    section: "operations",
    trendGood: "down",
    methodology: {
      de: "1, wenn der NTP-Status des Geräts ungleich \"Normal\" ist (Quelle: DeviceManager-REST GET /ntp_client_config/get_ntp_status), sonst 0. Eine gestörte Zeitsynchronisation kann Log-Korrelation und Authentifizierung beeinträchtigen.",
      en: "1 if the device's NTP status is not \"Normal\" (source: DeviceManager REST GET /ntp_client_config/get_ntp_status), otherwise 0. Broken time sync can impair log correlation and authentication.",
    },
  },
  {
    key: "disks_unencrypted",
    label: { de: "Unverschlüsselte Festplatten", en: "Unencrypted Disks" },
    format: "count",
    aggregation: "last",
    section: "security",
    methodology: {
      de: "Anzahl der Disks mit ENCRYPTDISKTYPE = 0 (keine Self-Encrypting Disk) (Quelle: DeviceManager-REST GET /disk) — rein informativ für Compliance-Zwecke, viele Umgebungen nutzen bewusst keine SEDs.",
      en: "Number of disks with ENCRYPTDISKTYPE = 0 (not a self-encrypting disk) (source: DeviceManager REST GET /disk) — purely informational for compliance purposes, many environments intentionally don't use SEDs.",
    },
  },
  {
    key: "sed_keys_expiring_soon",
    label: { de: "SED-Schlüssel läuft bald ab", en: "SED Key Expiring Soon" },
    format: "count",
    aggregation: "last",
    section: "security",
    trendGood: "down",
    methodology: {
      de: "Anzahl der Self-Encrypting Disks, deren KEYEXPIRATIONTIME innerhalb von 30 Tagen liegt oder bereits abgelaufen ist (Quelle: DeviceManager-REST GET /disk).",
      en: "Number of self-encrypting disks whose KEYEXPIRATIONTIME is within 30 days or has already passed (source: DeviceManager REST GET /disk).",
    },
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
    // Replikationspaare selbst.
    key: "remote_devices_unhealthy",
    label: { de: "Remote-Devices mit Fehlstatus", en: "Unhealthy Remote Devices" },
    format: "count",
    aggregation: "last",
    section: "hardware",
    trendGood: "down",
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
