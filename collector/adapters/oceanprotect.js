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

  const [system, controllers, disks, fans, power, ethPorts, replicationPairs, bbus] = await Promise.all([
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
  ]);

  const metrics = [];

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

  // HEALTHSTATUS-Konvention für Disk/Fan/Power laut Doku: 1 = Normal, alles
  // andere (0 Unknown, 2 Faulty, 3 About to fail, 9 Inconsistent, 11 No
  // input, 17 Single link, ...) zählt hier als "nicht normal".
  const diskList = Array.isArray(disks.body.data) ? disks.body.data : [];
  metrics.push({ key: "disks_faulty", value: diskList.filter((d) => Number(d.HEALTHSTATUS) !== 1).length, unit: "count" });

  const fanList = Array.isArray(fans.body.data) ? fans.body.data : [];
  metrics.push({ key: "fans_faulty", value: fanList.filter((f) => Number(f.HEALTHSTATUS) !== 1).length, unit: "count" });

  const powerList = Array.isArray(power.body.data) ? power.body.data : [];
  metrics.push({ key: "power_modules_faulty", value: powerList.filter((p) => Number(p.HEALTHSTATUS) !== 1).length, unit: "count" });

  // Nur Ports zählen, die überhaupt in Betrieb sind (HEALTHSTATUS != 0
  // Unknown — unbestückte/inaktive Ports haben sonst RUNNINGSTATUS 0, was
  // fälschlich als "down" durchgehen würde).
  const ethList = Array.isArray(ethPorts.body.data) ? ethPorts.body.data : [];
  const activePorts = ethList.filter((p) => Number(p.HEALTHSTATUS) !== 0);
  metrics.push({
    key: "eth_ports_down",
    value: activePorts.filter((p) => Number(p.RUNNINGSTATUS) === 11).length,
    unit: "count",
  });

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
  }

  // Nur melden, wenn der Endpunkt überhaupt Daten liefert — nicht jede
  // Appliance-Konfiguration hat BBUs verbaut.
  const bbuList = Array.isArray(bbus?.body?.data) ? bbus.body.data : [];
  if (bbuList.length > 0) {
    metrics.push({ key: "bbu_faulty", value: bbuList.filter((b) => Number(b.HEALTHSTATUS) !== 1).length, unit: "count" });
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

  return { metrics, deviceInfo };
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

async function collectDataBackupMetrics(config, token) {
  const { dataBackupUrl } = config.oceanprotect;
  const authHeaders = { "X-Auth-Token": token };

  const [sla, jobStats, airgap, drills, ransomware, protection] = await Promise.all([
    fetchOptional(config, "SLA-Compliance", requestJson(config, joinUrl(dataBackupUrl, "/v1/protected-objects/sla-compliance"), { headers: authHeaders })),
    fetchOptional(
      config,
      "Backup-Job-Statistik",
      requestJson(config, joinUrl(dataBackupUrl, "/v1/report-data/jobs"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ timeRange: "LAST_THREE_MONTH", dataQueryTypeEnum: "RESOURCE" }),
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
  ]);

  const metrics = [];

  if (sla) {
    const inCompliance = Number(sla.body.in_compliance) || 0;
    const outOfCompliance = Number(sla.body.out_of_compliance) || 0;
    if (inCompliance + outOfCompliance > 0) {
      metrics.push({
        key: "rpo_compliance_rate",
        value: (inCompliance / (inCompliance + outOfCompliance)) * 100,
        unit: "%",
      });
    }
  }

  if (jobStats) {
    // Die Doku listet für ResourceTaskSummary.status keine feste Werteliste
    // — hier wird case-insensitive auf "success" gematcht. Bei Abweichungen
    // im realen Antwortformat ggf. anpassen (Log-Ausgabe der Rohdaten prüfen).
    const summary = jobStats.body.resourceTaskSummary ?? [];
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
    for (const entry of summary) {
      protectedCount += Number(entry.protected_count) || 0;
      unprotectedCount += Number(entry.unprotected_count) || 0;
    }
    if (protectedCount + unprotectedCount > 0) {
      metrics.push({ key: "resource_protection_rate", value: (protectedCount / (protectedCount + unprotectedCount)) * 100, unit: "%" });
      metrics.push({ key: "resources_unprotected_count", value: unprotectedCount, unit: "count" });
    }
  }

  return metrics;
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
    return { metrics: [], deviceSerialNumber: null, deviceInfo: null, alarmSamples: [] };
  }
  try {
    const [capacityResult, hardwareResult] = await Promise.allSettled([
      collectStorageMetrics(config, session),
      collectHardwareMetrics(config, session),
    ]);
    const metrics = [];
    let deviceInfo = null;
    let alarmSamples = [];
    if (capacityResult.status === "fulfilled") {
      metrics.push(...capacityResult.value.metrics);
      alarmSamples = capacityResult.value.alarmSamples;
    } else {
      config.logger?.warn(`Kapazitäts-/Alarm-Kennzahlen konnten nicht erhoben werden: ${capacityResult.reason.message}`);
    }
    if (hardwareResult.status === "fulfilled") {
      metrics.push(...hardwareResult.value.metrics);
      deviceInfo = hardwareResult.value.deviceInfo;
    } else {
      config.logger?.warn(`Hardware-Kennzahlen konnten nicht erhoben werden: ${hardwareResult.reason.message}`);
    }
    // deviceId aus der Login-Antwort ist bei Huawei die Geräte-ESN
    // (Seriennummer) — dieselbe Kennung, die schon in jeder Request-URL steckt.
    return { metrics, deviceSerialNumber: session.deviceId, deviceInfo, alarmSamples };
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
    return [];
  }
  try {
    return await collectDataBackupMetrics(config, token);
  } catch (err) {
    config.logger?.warn(`DataBackup-Kennzahlen konnten nicht erhoben werden: ${err.message}`);
    return [];
  }
}

async function collect(config) {
  const oc = config.oceanprotect ?? {};
  const required = ["deviceManagerUrl", "deviceManagerUsername", "deviceManagerPassword", "dataBackupUrl", "dataBackupUsername", "dataBackupPassword"];
  const missing = required.filter((k) => !oc[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/oceanprotect.js: config.oceanprotect fehlt: ${missing.join(", ")}`);
  }

  const [storageResult, dataBackupMetrics] = await Promise.all([
    tryCollectStorage(config),
    tryCollectDataBackup(config),
  ]);
  const metrics = [...storageResult.metrics, ...dataBackupMetrics];

  if (metrics.length === 0) {
    throw new Error("Weder Storage- noch DataBackup-Kennzahlen konnten erhoben werden — siehe Warnungen oben.");
  }

  const meta = {};
  if (storageResult.deviceSerialNumber) meta.deviceSerialNumber = storageResult.deviceSerialNumber;
  if (storageResult.deviceInfo?.model) meta.deviceModel = storageResult.deviceInfo.model;
  if (storageResult.deviceInfo?.softwareVersion) meta.deviceSoftwareVersion = storageResult.deviceInfo.softwareVersion;
  if (storageResult.alarmSamples?.length > 0) meta.alarmSamples = storageResult.alarmSamples;

  return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
}

module.exports = { collect };
