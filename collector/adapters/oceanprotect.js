// Adapter für Huawei OceanProtect X8000: liest Kennzahlen aus zwei
// getrennten REST-APIs der Appliance aus und bringt sie in das generische
// { key, value, unit? }-Format, das POST /api/collector/ingest erwartet.
//
// Quelle: die vom Kunden bereitgestellte Huawei-REST-Doku
// ("OceanProtect Backup Storage V200R001C30 REST Interface Reference" und
// "OceanProtect DataBackup V200R001C10 REST Interface Reference", siehe
// docs/Rest/ im Repo).
//
// Zwei getrennte Dienste auf derselben Appliance, mit unterschiedlicher
// Authentifizierung:
//   1. Backup Storage / DeviceManager (Storage-Ebene: Kapazität, Dedup,
//      Alarme) — Login per POST .../sessions, danach Header iBaseToken +
//      Cookie auf allen Folgeaufrufen.
//   2. DataBackup (Container-App auf der X8000: Backup-Jobs, SLA/RPO,
//      Air-Gap-Isolation) — Login per POST /v1/auth/token, danach Header
//      X-Auth-Token auf allen Folgeaufrufen.
//
// metricKeys müssen exakt zu den Definitionen in
// src/lib/managed-reports/metrics/oceanprotect.ts passen.
const { requestJson, joinUrl } = require("../httpClient");

async function loginStorage(config) {
  const { deviceManagerUrl, deviceManagerUsername, deviceManagerPassword } = config.oceanprotect;
  const { body, headers } = await requestJson(config, joinUrl(deviceManagerUrl, "/deviceManager/rest/xxxxx/sessions"), {
    method: "POST",
    body: JSON.stringify({ username: deviceManagerUsername, password: deviceManagerPassword, scope: "0" }),
  });
  const cookie = headers.get("set-cookie");
  if (!cookie) throw new Error("Storage-Login: kein Set-Cookie-Header in der Antwort.");
  return { deviceId: body.data.deviceid, iBaseToken: body.data.iBaseToken, cookie };
}

async function logoutStorage(config, session) {
  const { deviceManagerUrl } = config.oceanprotect;
  await requestJson(config, joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}/sessions`), {
    method: "DELETE",
    headers: { iBaseToken: session.iBaseToken, Cookie: session.cookie },
  }).catch((err) => config.logger?.warn(`Storage-Logout fehlgeschlagen (ignoriert): ${err.message}`));
}

async function loginDataBackup(config) {
  const { dataBackupUrl, dataBackupUsername, dataBackupPassword } = config.oceanprotect;
  const { body } = await requestJson(config, joinUrl(dataBackupUrl, "/v1/auth/token"), {
    method: "POST",
    body: JSON.stringify({ userName: dataBackupUsername, password: dataBackupPassword }),
  });
  return body.token;
}

// Parst die JSON-String-Ratio-Felder, die der DeviceManager für
// Reduktionsraten liefert, z. B. {"numerator":"1265","denominator":"1000"}.
function parseRatio(raw) {
  const r = JSON.parse(raw);
  const ratio = Number(r.numerator) / Number(r.denominator);
  return Number.isFinite(ratio) ? ratio : null;
}

// Alarm-Level laut Doku: 3 = warning, 5 = major, 6 = critical.
const ALARM_LEVELS = [
  { level: 6, severity: "critical" },
  { level: 5, severity: "major" },
  { level: 3, severity: "warning" },
];
// Klartext-Stichprobe pro Schweregrad, damit der Bericht nicht nur die
// Anzahl, sondern auch den Ereignistext zeigen kann — bewusst klein
// gehalten (kein Anspruch auf Vollständigkeit, nur "was ist gerade los").
const ALARM_SAMPLE_SIZE = 5;

// Holt zu jedem Schweregrad die jüngsten Alarme inklusive Klartext
// (description/name/suggestion) — separat von den reinen Zählungen, da die
// Liste (anders als /count) bei einem leeren Ergebnis keinen Fehler werfen
// soll, der die restliche Kennzahlerhebung mitreißt.
async function fetchAlarmSamples(config, base, authHeaders) {
  const samples = [];
  for (const { level, severity } of ALARM_LEVELS) {
    try {
      const { body } = await requestJson(
        config,
        joinUrl(base, `/alarm/currentalarm?filter=level::${level}&sortby=startTime,d&range=[0-${ALARM_SAMPLE_SIZE - 1}]`),
        { headers: authHeaders }
      );
      for (const alarm of body.data ?? []) {
        samples.push({
          severity,
          name: String(alarm.name ?? "").slice(0, 200) || "Alarm",
          description: String(alarm.description ?? "").slice(0, 500) || "—",
          suggestion: alarm.suggestion ? String(alarm.suggestion).slice(0, 500) : undefined,
          time: Number.isFinite(Number(alarm.startTime)) ? new Date(Number(alarm.startTime) * 1000).toISOString() : undefined,
        });
      }
    } catch (err) {
      config.logger?.warn(`Alarmtexte (${severity}) konnten nicht abgerufen werden (übersprungen): ${err.message}`);
    }
  }
  return samples;
}

async function collectStorageMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanprotect;
  const poolId = config.oceanprotect.storagePoolId ?? "0";
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const [dataInfo, poolInfo, critical, major, warning, alarmSamples] = await Promise.all([
    requestJson(config, joinUrl(base, `/storagepool_data_info/${poolId}`), { headers: authHeaders }),
    requestJson(config, joinUrl(base, `/storagepool/${poolId}`), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::6"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::5"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::3"), { headers: authHeaders }),
    fetchAlarmSamples(config, base, authHeaders),
  ]);

  const metrics = [];

  // DEDUPLICATIONRATE/SPACEREDUCTIONRATE sind laut Doku JSON-Strings wie
  // {"numerator":"10","denominator":"10","logic":"="}. SPACEREDUCTIONRATE
  // ist die Gesamtreduktion (Dedup + Kompression) — das, was der
  // DeviceManager unter "Data Reduction" als Reduction Ratio anzeigt.
  let reductionRatio = null;
  try {
    const ratio = parseRatio(dataInfo.body.data.DEDUPLICATIONRATE);
    if (ratio !== null) metrics.push({ key: "dedup_ratio", value: ratio, unit: "x" });
  } catch (err) {
    config.logger?.warn(`dedup_ratio konnte nicht ausgewertet werden (übersprungen): ${err.message}`);
  }
  try {
    reductionRatio = parseRatio(dataInfo.body.data.SPACEREDUCTIONRATE);
    if (reductionRatio !== null) metrics.push({ key: "data_reduction_ratio", value: reductionRatio, unit: "x" });
  } catch (err) {
    config.logger?.warn(`data_reduction_ratio konnte nicht ausgewertet werden (übersprungen): ${err.message}`);
  }

  // USERCONSUMEDCAPACITY ist in Sektoren (512 Byte) angegeben.
  const usedSectors = Number(poolInfo.body.data.USERCONSUMEDCAPACITY);
  let usedTB = null;
  if (Number.isFinite(usedSectors)) {
    usedTB = (usedSectors * 512) / 1024 ** 4;
    metrics.push({ key: "protected_capacity_tb", value: usedTB, unit: "TB" });
  }

  // "Kapazität vor Reduktion" (Pre-Savings) = genutzte Kapazität ×
  // Gesamtreduktionsrate — kein eigener Rohwert in der API, aber aus den
  // beiden oben ohnehin abgefragten Werten berechenbar.
  if (usedTB !== null && reductionRatio !== null) {
    metrics.push({ key: "capacity_before_reduction_tb", value: usedTB * reductionRatio, unit: "TB" });
  }

  const fillLevel = Number(poolInfo.body.data.USERCONSUMEDCAPACITYPERCENTAGE);
  if (Number.isFinite(fillLevel)) {
    metrics.push({ key: "storage_pool_fill_level", value: fillLevel, unit: "%" });
  }

  // Alarm-Level laut Doku: 3 = warning, 5 = major, 6 = critical — als drei
  // getrennte Kennzahlen gemeldet (deckt sich mit der Darstellung im
  // DeviceManager selbst: "0 Critical / 1 Major / 1 Warning").
  metrics.push({ key: "alerts_critical", value: Number(critical.body.data.COUNT) || 0, unit: "count" });
  metrics.push({ key: "alerts_major", value: Number(major.body.data.COUNT) || 0, unit: "count" });
  metrics.push({ key: "alerts_warning", value: Number(warning.body.data.COUNT) || 0, unit: "count" });

  return { metrics, alarmSamples };
}

// Geräte-/Komponentenstatus: Systemzustand, Controller (CPU/Speicher),
// Disks, Lüfter, Netzteile, Netzwerk-Ports — alles über die jeweiligen
// "Batch Querying"-Endpunkte des DeviceManager (ein Aufruf liefert alle
// Instanzen als Array, kein Durchpaginieren nötig).
async function collectHardwareMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanprotect;
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const [system, controllers, disks, fans, power, ethPorts, replicationPairs, bbus, sfpModules, email, syslog, license, certificates] = await Promise.all([
    requestJson(config, joinUrl(base, "/system/"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/controller"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/disk"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/fan"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/power"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/eth_port"), { headers: authHeaders }),
    // Eigens abgesichert (neuer, noch unverifizierter Endpunkt) statt Teil
    // des obigen Promise.all — ein Fehlschlag hier soll die längst bewährten
    // Kennzahlen darüber nicht mitreißen.
    fetchOptional(config, "Replikationspaare", requestJson(config, joinUrl(base, "/REPLICATIONPAIR"), { headers: authHeaders })),
    fetchOptional(config, "BBU-Status", requestJson(config, joinUrl(base, "/backup_power"), { headers: authHeaders })),
    // Aus dem Huawei-Inspector-Healthcheck abgeleitet: Optical-Module-Status
    // ("Optical module status") sowie ob Email-/Syslog-Benachrichtigungen
    // eingerichtet sind ("Checking DME IQ Access" — dort war zusätzlich der
    // reine Call-Home-Kanal Teil des Checks, dafür fehlt in der REST-Doku
    // aber ein Abfrage-Endpunkt, daher hier nur Email/Syslog).
    fetchOptional(config, "Optical-Module-Status", requestJson(config, joinUrl(base, "/sfp"), { headers: authHeaders })),
    fetchOptional(config, "Email-Benachrichtigung", requestJson(config, joinUrl(base, "/email"), { headers: authHeaders })),
    fetchOptional(config, "Syslog-Benachrichtigung", requestJson(config, joinUrl(base, "/syslog"), { headers: authHeaders })),
    // Weitere Inspector-Checks: Lizenz- und Zertifikatsablauf.
    fetchOptional(config, "Lizenzstatus", requestJson(config, joinUrl(base, "/license/activelicense"), { headers: authHeaders })),
    fetchOptional(config, "Zertifikatsstatus", requestJson(config, joinUrl(base, "/certificate"), { headers: authHeaders })),
  ]);

  const metrics = [];
  const componentFaults = [];

  // System HEALTHSTATUS/RUNNINGSTATUS: 1 = Normal für beide.
  const sys = system.body.data;
  const systemHealthy = Number(sys.HEALTHSTATUS) === 1 && Number(sys.RUNNINGSTATUS) === 1 ? 100 : 0;
  metrics.push({ key: "system_availability", value: systemHealthy, unit: "%" });

  // Modell/Version sind Geräteattribute (kein Zeitreihen-Wert) — werden
  // getrennt als deviceInfo zurückgegeben, nicht als Metrik.
  const deviceInfo = { model: sys.productModeString || null, softwareVersion: sys.PRODUCTVERSION || null };

  const controllerList = Array.isArray(controllers.body.data) ? controllers.body.data : [];
  const cpuValues = controllerList.map((c) => Number(c.CPUUSAGE)).filter(Number.isFinite);
  const memValues = controllerList.map((c) => Number(c.MEMORYUSAGE)).filter(Number.isFinite);
  if (cpuValues.length > 0) {
    metrics.push({ key: "controller_cpu_usage_avg", value: cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length, unit: "%" });
  }
  if (memValues.length > 0) {
    metrics.push({ key: "controller_memory_usage_avg", value: memValues.reduce((a, b) => a + b, 0) / memValues.length, unit: "%" });
  }
  metrics.push({
    key: "controllers_faulty",
    value: controllerList.filter((c) => Number(c.HEALTHSTATUS) !== 1).length,
    unit: "count",
  });
  collectFaultDetails(componentFaults, "Controller", controllerList, (s) => s === 1);

  // Firmware-Konsistenz zwischen Controllern (aus dem Inspector-Healthcheck
  // "Consistency Check of the System Software Version") — unterschiedliche
  // SOFTVER-Werte deuten auf ein unvollständiges Update hin.
  const firmwareVersions = new Set(controllerList.map((c) => c.SOFTVER).filter(Boolean));
  if (firmwareVersions.size > 0) {
    metrics.push({ key: "controllers_firmware_inconsistent", value: firmwareVersions.size > 1 ? 1 : 0, unit: "count" });
    if (firmwareVersions.size > 1) {
      for (const c of controllerList) {
        componentFaults.push({ category: "Firmware", id: `Controller ${c.ID}`, description: `Version ${c.SOFTVER}` });
      }
    }
  }

  // HEALTHSTATUS-Konvention für Disk/Fan/Power laut Doku: 1 = Normal, alles
  // andere (0 Unknown, 2 Faulty, 3 About to fail, 9 Inconsistent, 11 No
  // input, 17 Single link, ...) zählt hier als "nicht normal".
  const diskList = Array.isArray(disks.body.data) ? disks.body.data : [];
  metrics.push({ key: "disks_faulty", value: diskList.filter((d) => Number(d.HEALTHSTATUS) !== 1).length, unit: "count" });
  collectFaultDetails(componentFaults, "Festplatte", diskList, (s) => s === 1);

  const fanList = Array.isArray(fans.body.data) ? fans.body.data : [];
  metrics.push({ key: "fans_faulty", value: fanList.filter((f) => Number(f.HEALTHSTATUS) !== 1).length, unit: "count" });
  collectFaultDetails(componentFaults, "Lüfter", fanList, (s) => s === 1);

  const powerList = Array.isArray(power.body.data) ? power.body.data : [];
  metrics.push({ key: "power_modules_faulty", value: powerList.filter((p) => Number(p.HEALTHSTATUS) !== 1).length, unit: "count" });
  collectFaultDetails(componentFaults, "Netzteil", powerList, (s) => s === 1);

  // Nur Ports zählen, die überhaupt in Betrieb sind (HEALTHSTATUS != 0
  // Unknown — unbestückte/inaktive Ports haben sonst RUNNINGSTATUS 0, was
  // fälschlich als "down" durchgehen würde) und die kein reiner
  // Wartungsport sind (z. B. "CTE0.A.MAINTENANCE") — die sind laut Kunde
  // regulär nicht angeschlossen und würden sonst dauerhaft als "down" zählen.
  const ethList = Array.isArray(ethPorts.body.data) ? ethPorts.body.data : [];
  const activePorts = ethList.filter((p) => Number(p.HEALTHSTATUS) !== 0 && !/maintenance/i.test(String(p.ID ?? "")));
  const downPorts = activePorts.filter((p) => Number(p.RUNNINGSTATUS) === 11);
  metrics.push({ key: "eth_ports_down", value: downPorts.length, unit: "count" });
  for (const p of downPorts) {
    componentFaults.push({ category: "Netzwerk-Port", id: String(p.ID ?? "—"), description: "Offline" });
  }

  // Optical-Module-HEALTHSTATUS: 0 = nicht erkannt (laut Inspector-Kriterium
  // normal, z. B. unbestückter Port), 1 = normal, alles andere (2 faulty,
  // 9 inconsistent) zählt als fehlerhaft.
  const sfpList = Array.isArray(sfpModules?.body?.data) ? sfpModules.body.data : [];
  if (sfpList.length > 0) {
    metrics.push({
      key: "optical_modules_faulty",
      value: sfpList.filter((s) => ![0, 1].includes(Number(s.healthStatus))).length,
      unit: "count",
    });
    collectFaultDetails(componentFaults, "Optikmodul", sfpList, (s) => s === 0 || s === 1);
  }

  // Lizenz-/Zertifikatsablauf aus dem Inspector-Healthcheck. 30 Tage Vorlauf
  // als bewusst konservative Schwelle, um rechtzeitig vor Ablauf zu warnen.
  const EXPIRY_WARNING_DAYS = 30;
  const now = Date.now();
  function daysUntil(dateStr) {
    if (!dateStr || dateStr === "--") return null;
    const t = new Date(dateStr).getTime();
    return Number.isFinite(t) ? Math.floor((t - now) / (1000 * 60 * 60 * 24)) : null;
  }

  if (license) {
    const activeFunctions = (license.body.data.LicenseFunction ?? []).filter((f) => Number(f.FuncSwitch) === 1);
    const expiringSoon = activeFunctions
      .map((f) => ({ id: f.FeatureId, days: daysUntil(f.RunTime) }))
      .filter((f) => f.days !== null && f.days <= EXPIRY_WARNING_DAYS);
    metrics.push({ key: "license_expiring_soon", value: expiringSoon.length > 0 ? 1 : 0, unit: "count" });
    for (const f of expiringSoon) {
      componentFaults.push({
        category: "Lizenz",
        id: `Feature ${f.id}`,
        description: f.days < 0 ? "Abgelaufen" : `Läuft in ${f.days} Tagen ab`,
      });
    }
  }

  if (certificates) {
    const certList = Array.isArray(certificates.body.data) ? certificates.body.data : [];
    const expiringSoon = certList
      .filter((c) => Number(c.CERTIFICATE_STATUS) === 1)
      .map((c) => ({ type: c.CERTIFICATE_TYPE, days: daysUntil(c.CERTIFICATE_EXPIRE_TIME) }))
      .filter((c) => c.days !== null && c.days <= EXPIRY_WARNING_DAYS);
    metrics.push({ key: "certificate_expiring_soon", value: expiringSoon.length > 0 ? 1 : 0, unit: "count" });
    for (const c of expiringSoon) {
      componentFaults.push({
        category: "Zertifikat",
        id: `Typ ${c.type}`,
        description: c.days < 0 ? "Abgelaufen" : `Läuft in ${c.days} Tagen ab`,
      });
    }
  }

  // Ob überhaupt eine Benachrichtigung eingerichtet ist, wenn ein Alarm
  // auftritt — ein Gerät ohne Email-/Syslog-Weiterleitung wird nur bemerkt,
  // wenn jemand aktiv nachschaut.
  if (email) {
    metrics.push({ key: "email_notifications_disabled", value: Number(email.body.data.CMO_EMAIL_NEED_SEND) === 1 ? 0 : 1, unit: "count" });
  }
  if (syslog) {
    metrics.push({
      key: "syslog_notifications_disabled",
      value: Number(syslog.body.data.OM_MSG_OP_SET_ALARM_SYSLOG_CFG) === 1 ? 0 : 1,
      unit: "count",
    });
  }

  // Nur melden, wenn überhaupt Replikationspaare konfiguriert sind — sonst
  // würde "0" fälschlich als "alles gesund" statt "keine Replikation
  // eingerichtet" gelesen werden.
  const replicationPairList = Array.isArray(replicationPairs?.body?.data) ? replicationPairs.body.data : [];
  if (replicationPairList.length > 0) {
    metrics.push({
      key: "replication_pairs_unhealthy",
      value: replicationPairList.filter((r) => Number(r.HEALTHSTATUS) !== 1).length,
      unit: "count",
    });
    collectFaultDetails(componentFaults, "Replikationspaar", replicationPairList, (s) => s === 1);
  }

  // Nur melden, wenn der Endpunkt überhaupt Daten liefert — nicht jede
  // Appliance-Konfiguration hat BBUs verbaut.
  const bbuList = Array.isArray(bbus?.body?.data) ? bbus.body.data : [];
  if (bbuList.length > 0) {
    metrics.push({ key: "bbu_faulty", value: bbuList.filter((b) => Number(b.HEALTHSTATUS) !== 1).length, unit: "count" });
    collectFaultDetails(componentFaults, "BBU", bbuList, (s) => s === 1);
  }

  // Die auf der Appliance mitlaufende Backup-Software (DataBackup) läuft
  // selbst als Container-Dienst auf dem Storage-Controller — DEVICE_GLOBAL_
  // CONF/get_container_enable_info und .../get_container_resource_info
  // liefern dessen Eckdaten (aktiv/inaktiv, zugeteilte CPU-Kerne/RAM).
  // Braucht einen ctrlNodeId (z. B. "0A") — der erste Controller aus der
  // Liste oben reicht dafür.
  const ctrlNodeId = controllerList[0]?.ID;
  if (ctrlNodeId) {
    const containerMetrics = await fetchOptional(
      config,
      "Container-Status",
      collectContainerMetrics(config, base, authHeaders, ctrlNodeId)
    );
    if (containerMetrics) metrics.push(...containerMetrics);
  }

  return { metrics, deviceInfo, componentFaults };
}

// Eckdaten des Backup-Software-Containers (aktiv/inaktiv, zugeteilte
// CPU-Kerne/RAM) — kein eigener Softwareversions-Wert in dieser Schnittstelle
// (die Version des Container-Images ist über die REST-API nicht abrufbar,
// nur die von der Appliance zugewiesenen Ressourcen).
async function collectContainerMetrics(config, base, authHeaders, ctrlNodeId) {
  const { body: enableInfo } = await requestJson(config, joinUrl(base, "/DEVICE_GLOBAL_CONF/get_container_enable_info"), {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ ctrlNodeId }),
  });

  const metrics = [];
  const containerEnabled = Number(enableInfo.data.containerEnable) === 1;
  metrics.push({ key: "container_service_enabled", value: containerEnabled ? 1 : 0, unit: "bool" });

  if (!containerEnabled) return metrics;

  const { body: resourceInfo } = await requestJson(config, joinUrl(base, "/DEVICE_GLOBAL_CONF/get_container_resource_info"), {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ ctrlNodeId }),
  });

  const cpuCores = Number(resourceInfo.data.containerCpu);
  if (Number.isFinite(cpuCores)) metrics.push({ key: "container_cpu_cores", value: cpuCores, unit: "cores" });

  const memoryBytes = Number(resourceInfo.data.containerMemory);
  if (Number.isFinite(memoryBytes)) metrics.push({ key: "container_memory_gb", value: memoryBytes / 1024 ** 3, unit: "GB" });

  return metrics;
}

// Ransomware-Erkennung auf Kopien läuft pro Resource-Subtyp getrennt
// (resource_sub_type ist Pflichtparameter). Ein fehlschlagender Subtyp
// (z. B. weil im Environment gar nicht vorhanden) darf die anderen nicht
// verhindern — daher einzeln try/catch statt Promise.all.
const RANSOMWARE_RESOURCE_SUBTYPES = ["vim.VirtualMachine", "NasShare", "NasFileSystem"];

async function fetchRansomwareDetectStats(config, dataBackupUrl, authHeaders) {
  let infected = 0;
  let abnormal = 0;
  let anyOk = false;

  for (const resourceSubType of RANSOMWARE_RESOURCE_SUBTYPES) {
    try {
      const { body } = await requestJson(
        config,
        joinUrl(dataBackupUrl, `/v1/copies/detect-statistics?resource_sub_type=${encodeURIComponent(resourceSubType)}&page_no=0&page_size=200`),
        { headers: authHeaders }
      );
      for (const item of body.items ?? []) {
        infected += Number(item.infected_copy_num) || 0;
        abnormal += Number(item.abnormal_copy_num) || 0;
      }
      anyOk = true;
    } catch (err) {
      config.logger?.debug(`Ransomware-Erkennungsstatistik für ${resourceSubType} nicht verfügbar: ${err.message}`);
    }
  }

  return anyOk ? { infected, abnormal } : null;
}

// Klartext für die üblichen HEALTHSTATUS-Codes der DeviceManager-API — für
// die Detailreferenz am Ende des Berichts, wenn eine Fehler-Kennzahl > 0 ist.
const HEALTH_STATUS_LABELS = {
  0: "Unbekannt",
  2: "Fehlerhaft",
  3: "Fällt demnächst aus",
  9: "Inkonsistent",
  11: "Kein Eingang",
  17: "Nur ein Link",
};
function describeHealthStatus(code) {
  return HEALTH_STATUS_LABELS[code] ?? `Status-Code ${code}`;
}

// Sammelt für eine Komponentenliste (Controller, Disk, Lüfter, …) Details zu
// den NICHT normalen Einträgen — Grundlage für den Detail-Referenzabschnitt
// am Ende des Berichts, damit z. B. "Fehlerhafte Controller: 1" nicht ohne
// Kontext dasteht.
function collectFaultDetails(componentFaults, category, list, isOk) {
  for (const item of list) {
    const status = Number(item.HEALTHSTATUS ?? item.healthStatus);
    if (isOk(status)) continue;
    componentFaults.push({
      category,
      id: String(item.ID ?? item.id ?? "—"),
      description: describeHealthStatus(status),
    });
  }
}

// Jede DataBackup-Teilabfrage einzeln absichern: ein neuer/unsicherer
// Endpunkt (z. B. Recovery-Drill-Statistik, noch nicht gegen echte Daten
// verifiziert) soll bei Fehlschlag nicht die bereits bewährten Kennzahlen
// (SLA, Job-Erfolgsquote, Air-Gap) mitreißen.
async function fetchOptional(config, label, promise) {
  try {
    return await promise;
  } catch (err) {
    config.logger?.warn(`${label} konnte nicht abgerufen werden (übersprungen): ${err.message}`);
    return null;
  }
}

// Laut Doku unterstützt /v1/report-data/jobs nur diese drei festen,
// rollierenden Fenster (kein freier Start/Ende) — LAST_WEEK statt des
// vorher verwendeten LAST_THREE_MONTH, damit ein Kennzahlwert nicht über
// drei Monate hinweg gemittelt wird, wenn der Collector viel öfter läuft
// (jeder Lauf liefert damit einen aktuelleren Schnappschuss; das Portal
// mittelt ohnehin selbst über den gewählten Berichtszeitraum).
const JOB_STATS_TIME_RANGE = "LAST_WEEK";
// Wie viele der am häufigsten fehlschlagenden SLA-Richtlinien/Ressourcen
// im Bericht gezeigt werden (analog zum Huawei-Dashboard "Top Job Failures").
const TOP_FAILURES_LIMIT = 5;

// Extrahiert aus einem ResourceTaskSummary/SlaTaskSummary-Array (siehe
// /v1/report-data/jobs) die am häufigsten fehlgeschlagenen Einträge, absteigend
// sortiert. Mehrere Zeilen können sich denselben Namen mit unterschiedlichem
// Status teilen — pro Name werden nur die "fail"-artigen Zeilen aufsummiert.
function topFailuresFrom(summary, nameField) {
  const byName = new Map();
  for (const entry of summary ?? []) {
    if (!/fail/i.test(entry.status ?? "")) continue;
    const name = entry[nameField];
    if (!name) continue;
    byName.set(name, (byName.get(name) ?? 0) + (Number(entry.count) || 0));
  }
  return [...byName.entries()]
    .map(([name, failedCount]) => ({ name, failedCount }))
    .sort((a, b) => b.failedCount - a.failedCount)
    .slice(0, TOP_FAILURES_LIMIT);
}

async function collectDataBackupMetrics(config, token) {
  const { dataBackupUrl } = config.oceanprotect;
  const authHeaders = { "X-Auth-Token": token };

  const [sla, jobStatsByResource, jobStatsBySla, airgap, drills, ransomware, protection, nodeDetail] = await Promise.all([
    fetchOptional(config, "SLA-Compliance", requestJson(config, joinUrl(dataBackupUrl, "/v1/protected-objects/sla-compliance"), { headers: authHeaders })),
    fetchOptional(
      config,
      "Backup-Job-Statistik (Ressourcen)",
      requestJson(config, joinUrl(dataBackupUrl, "/v1/report-data/jobs"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ timeRange: JOB_STATS_TIME_RANGE, dataQueryTypeEnum: "RESOURCE" }),
      })
    ),
    fetchOptional(
      config,
      "Backup-Job-Statistik (SLA)",
      requestJson(config, joinUrl(dataBackupUrl, "/v1/report-data/jobs"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ timeRange: JOB_STATS_TIME_RANGE, dataQueryTypeEnum: "SLA" }),
      })
    ),
    fetchOptional(
      config,
      "Air-Gap-Isolationsjobs",
      requestJson(config, joinUrl(dataBackupUrl, "/v1/anti-ransomware/airgap/job/isolation"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ pageNo: "1", pageSize: "1" }),
      })
    ),
    // GET-Request — laut Doku zwar mit leerem JSON-Body im Beispiel, aber
    // fetch() erlaubt bei GET/HEAD keinen body (wirft sonst einen Fehler).
    fetchOptional(
      config,
      "Recovery-Drill-Statistik",
      requestJson(config, joinUrl(dataBackupUrl, "/v1/anti-ransomware/recovery-drill/plans/statistics"), { headers: authHeaders })
    ),
    fetchRansomwareDetectStats(config, dataBackupUrl, authHeaders),
    fetchOptional(config, "Ressourcenschutz-Übersicht", requestJson(config, joinUrl(dataBackupUrl, "/v1/resource/protection/summary?sub_type=null"), { headers: authHeaders })),
    // Liefert u. a. die Versionsnummer der Backup-Software selbst (getrennt
    // von der Storage-Firmware, die der DeviceManager unter PRODUCTVERSION meldet).
    fetchOptional(config, "Backup-Node-Details", requestJson(config, joinUrl(dataBackupUrl, "/v1/clusters/backup/local-node/detail"), { headers: authHeaders })),
  ]);

  const metrics = [];
  let dataBackupVersion;
  let resourceBreakdown;
  let topJobFailures;

  if (sla) {
    const inCompliance = Number(sla.body.in_compliance) || 0;
    const outOfCompliance = Number(sla.body.out_of_compliance) || 0;
    metrics.push({ key: "sla_compliant_count", value: inCompliance, unit: "count" });
    metrics.push({ key: "sla_noncompliant_count", value: outOfCompliance, unit: "count" });
    if (inCompliance + outOfCompliance > 0) {
      metrics.push({
        key: "rpo_compliance_rate",
        value: (inCompliance / (inCompliance + outOfCompliance)) * 100,
        unit: "%",
      });
    }
  }

  if (jobStatsByResource) {
    // Die Doku listet für ResourceTaskSummary.status keine feste Werteliste
    // — hier wird case-insensitive auf "success" gematcht. Bei Abweichungen
    // im realen Antwortformat ggf. anpassen (Log-Ausgabe der Rohdaten prüfen).
    const summary = jobStatsByResource.body.resourceTaskSummary ?? [];
    let successCount = 0;
    let totalCount = 0;
    for (const entry of summary) {
      const count = Number(entry.count) || 0;
      totalCount += count;
      if (/success/i.test(entry.status ?? "")) successCount += count;
    }
    if (totalCount > 0) {
      metrics.push({ key: "backup_success_rate", value: (successCount / totalCount) * 100, unit: "%" });
      metrics.push({ key: "backup_failed_jobs_count", value: totalCount - successCount, unit: "count" });
    }
    topJobFailures = { bySla: [], byResource: topFailuresFrom(summary, "resourceName") };
  }

  if (jobStatsBySla) {
    const summary = jobStatsBySla.body.slaTaskSummary ?? [];
    topJobFailures = { bySla: topFailuresFrom(summary, "slaName"), byResource: topJobFailures?.byResource ?? [] };
  }

  if (airgap) {
    metrics.push({ key: "air_gap_isolation_events", value: Number(airgap.body.totalCount) || 0, unit: "count" });
  }

  if (drills) {
    const totalDrills = Number(drills.body.totalDrillExecutionCount) || 0;
    const successfulDrills = Number(drills.body.successfulExecutionCount) || 0;
    metrics.push({ key: "recovery_drills_executed", value: totalDrills, unit: "count" });
    if (totalDrills > 0) {
      metrics.push({ key: "recovery_drill_success_rate", value: (successfulDrills / totalDrills) * 100, unit: "%" });
    }
  }

  if (ransomware) {
    metrics.push({ key: "ransomware_infected_copies", value: ransomware.infected, unit: "count" });
    metrics.push({ key: "ransomware_abnormal_copies", value: ransomware.abnormal, unit: "count" });
  }

  if (protection) {
    const summary = protection.body.summary ?? [];
    let protectedCount = 0;
    let unprotectedCount = 0;
    const byType = new Map();
    for (const entry of summary) {
      const p = Number(entry.protected_count) || 0;
      const u = Number(entry.unprotected_count) || 0;
      protectedCount += p;
      unprotectedCount += u;
      const type = entry.resource_type || entry.resource_sub_type || "Sonstige";
      const prev = byType.get(type) ?? { protectedCount: 0, unprotectedCount: 0 };
      byType.set(type, { protectedCount: prev.protectedCount + p, unprotectedCount: prev.unprotectedCount + u });
    }
    if (protectedCount + unprotectedCount > 0) {
      metrics.push({ key: "resource_protection_rate", value: (protectedCount / (protectedCount + unprotectedCount)) * 100, unit: "%" });
      metrics.push({ key: "resources_unprotected_count", value: unprotectedCount, unit: "count" });
    }
    if (byType.size > 0) {
      resourceBreakdown = [...byType.entries()].map(([resourceType, counts]) => ({ resourceType, ...counts }));
    }
  }

  if (nodeDetail?.body?.version) {
    dataBackupVersion = String(nodeDetail.body.version);
  }

  return { metrics, dataBackupVersion, resourceBreakdown, topJobFailures };
}

// Storage und DataBackup sind unabhängige Dienste mit unabhängigem Login.
// Schlägt der Login für einen der beiden fehl (z. B. Konto-Problem bei
// DataBackup), soll das die Kennzahlen des jeweils anderen, funktionierenden
// Diensts nicht verhindern — nur der betroffene Teil wird übersprungen
// (mit Warnung im Log), statt den kompletten Lauf abzubrechen.
async function tryCollectStorage(config) {
  let session;
  try {
    session = await loginStorage(config);
  } catch (err) {
    config.logger?.warn(`Storage-Login fehlgeschlagen — Storage-Kennzahlen werden übersprungen: ${err.message}`);
    return { metrics: [], deviceSerialNumber: null, deviceInfo: null, alarmSamples: [], componentFaults: [] };
  }
  try {
    const [capacityResult, hardwareResult] = await Promise.allSettled([
      collectStorageMetrics(config, session),
      collectHardwareMetrics(config, session),
    ]);
    const metrics = [];
    let deviceInfo = null;
    let alarmSamples = [];
    let componentFaults = [];
    if (capacityResult.status === "fulfilled") {
      metrics.push(...capacityResult.value.metrics);
      alarmSamples = capacityResult.value.alarmSamples;
    } else {
      config.logger?.warn(`Kapazitäts-/Alarm-Kennzahlen konnten nicht erhoben werden: ${capacityResult.reason.message}`);
    }
    if (hardwareResult.status === "fulfilled") {
      metrics.push(...hardwareResult.value.metrics);
      deviceInfo = hardwareResult.value.deviceInfo;
      componentFaults = hardwareResult.value.componentFaults;
    } else {
      config.logger?.warn(`Hardware-Kennzahlen konnten nicht erhoben werden: ${hardwareResult.reason.message}`);
    }
    // deviceId aus der Login-Antwort ist bei Huawei die Geräte-ESN
    // (Seriennummer) — dieselbe Kennung, die schon in jeder Request-URL steckt.
    return { metrics, deviceSerialNumber: session.deviceId, deviceInfo, alarmSamples, componentFaults };
  } finally {
    await logoutStorage(config, session);
  }
}

async function tryCollectDataBackup(config) {
  let token;
  try {
    token = await loginDataBackup(config);
  } catch (err) {
    config.logger?.warn(`DataBackup-Login fehlgeschlagen — DataBackup-Kennzahlen werden übersprungen: ${err.message}`);
    return { metrics: [] };
  }
  try {
    return await collectDataBackupMetrics(config, token);
  } catch (err) {
    config.logger?.warn(`DataBackup-Kennzahlen konnten nicht erhoben werden: ${err.message}`);
    return { metrics: [] };
  }
}

async function collect(config) {
  const oc = config.oceanprotect ?? {};
  const required = ["deviceManagerUrl", "deviceManagerUsername", "deviceManagerPassword", "dataBackupUrl", "dataBackupUsername", "dataBackupPassword"];
  const missing = required.filter((k) => !oc[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/oceanprotect.js: config.oceanprotect fehlt: ${missing.join(", ")}`);
  }

  const [storageResult, dataBackupResult] = await Promise.all([
    tryCollectStorage(config),
    tryCollectDataBackup(config),
  ]);
  const metrics = [...storageResult.metrics, ...dataBackupResult.metrics];

  if (metrics.length === 0) {
    throw new Error("Weder Storage- noch DataBackup-Kennzahlen konnten erhoben werden — siehe Warnungen oben.");
  }

  const meta = {};
  if (storageResult.deviceSerialNumber) meta.deviceSerialNumber = storageResult.deviceSerialNumber;
  if (storageResult.deviceInfo?.model) meta.deviceModel = storageResult.deviceInfo.model;
  if (storageResult.deviceInfo?.softwareVersion) meta.deviceSoftwareVersion = storageResult.deviceInfo.softwareVersion;
  if (storageResult.alarmSamples?.length > 0) meta.alarmSamples = storageResult.alarmSamples;
  if (storageResult.componentFaults?.length > 0) meta.componentFaults = storageResult.componentFaults;
  if (dataBackupResult.dataBackupVersion) meta.dataBackupVersion = dataBackupResult.dataBackupVersion;
  if (dataBackupResult.resourceBreakdown?.length > 0) meta.resourceBreakdown = dataBackupResult.resourceBreakdown;
  if (dataBackupResult.topJobFailures && (dataBackupResult.topJobFailures.bySla.length > 0 || dataBackupResult.topJobFailures.byResource.length > 0)) {
    meta.topJobFailures = dataBackupResult.topJobFailures;
  }

  return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
}

module.exports = { collect };
