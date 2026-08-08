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

async function collectStorageMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanprotect;
  const poolId = config.oceanprotect.storagePoolId ?? "0";
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const [dataInfo, poolInfo, critical, major, warning] = await Promise.all([
    requestJson(config, joinUrl(base, `/storagepool_data_info/${poolId}`), { headers: authHeaders }),
    requestJson(config, joinUrl(base, `/storagepool/${poolId}`), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::6"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::5"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::3"), { headers: authHeaders }),
  ]);

  const metrics = [];

  // DEDUPLICATIONRATE ist laut Doku ein JSON-String wie
  // {"numerator":"10","denominator":"10","logic":"="}.
  try {
    const dedup = JSON.parse(dataInfo.body.data.DEDUPLICATIONRATE);
    const ratio = Number(dedup.numerator) / Number(dedup.denominator);
    if (Number.isFinite(ratio)) metrics.push({ key: "dedup_ratio", value: ratio, unit: "x" });
  } catch (err) {
    config.logger?.warn(`dedup_ratio konnte nicht ausgewertet werden (übersprungen): ${err.message}`);
  }

  // USERCONSUMEDCAPACITY ist in Sektoren (512 Byte) angegeben.
  const usedSectors = Number(poolInfo.body.data.USERCONSUMEDCAPACITY);
  if (Number.isFinite(usedSectors)) {
    const usedTB = (usedSectors * 512) / 1024 ** 4;
    metrics.push({ key: "protected_capacity_tb", value: usedTB, unit: "TB" });
  }

  const fillLevel = Number(poolInfo.body.data.USERCONSUMEDCAPACITYPERCENTAGE);
  if (Number.isFinite(fillLevel)) {
    metrics.push({ key: "storage_pool_fill_level", value: fillLevel, unit: "%" });
  }

  // Alarm-Level laut Doku: 3 = warning, 5 = major, 6 = critical.
  // "major" wird hier zusammen mit "warning" gezählt, da unser Report nur
  // zwei Stufen (kritisch/Warnung) unterscheidet.
  metrics.push({ key: "alerts_critical", value: Number(critical.body.data.COUNT) || 0, unit: "count" });
  metrics.push({
    key: "alerts_warning",
    value: (Number(major.body.data.COUNT) || 0) + (Number(warning.body.data.COUNT) || 0),
    unit: "count",
  });

  return metrics;
}

// Geräte-/Komponentenstatus: Systemzustand, Controller (CPU/Speicher),
// Disks, Lüfter, Netzteile, Netzwerk-Ports — alles über die jeweiligen
// "Batch Querying"-Endpunkte des DeviceManager (ein Aufruf liefert alle
// Instanzen als Array, kein Durchpaginieren nötig).
async function collectHardwareMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanprotect;
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const [system, controllers, disks, fans, power, ethPorts] = await Promise.all([
    requestJson(config, joinUrl(base, "/system/"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/controller"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/disk"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/fan"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/power"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/eth_port"), { headers: authHeaders }),
  ]);

  const metrics = [];

  // System HEALTHSTATUS/RUNNINGSTATUS: 1 = Normal für beide.
  const sys = system.body.data;
  const systemHealthy = Number(sys.HEALTHSTATUS) === 1 && Number(sys.RUNNINGSTATUS) === 1 ? 100 : 0;
  metrics.push({ key: "system_availability", value: systemHealthy, unit: "%" });

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

  return metrics;
}

async function collectDataBackupMetrics(config, token) {
  const { dataBackupUrl } = config.oceanprotect;
  const authHeaders = { "X-Auth-Token": token };

  const [sla, jobStats, airgap] = await Promise.all([
    requestJson(config, joinUrl(dataBackupUrl, "/v1/protected-objects/sla-compliance"), { headers: authHeaders }),
    requestJson(config, joinUrl(dataBackupUrl, "/v1/report-data/jobs"), {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ timeRange: "LAST_THREE_MONTH", dataQueryTypeEnum: "RESOURCE" }),
    }),
    requestJson(config, joinUrl(dataBackupUrl, "/v1/anti-ransomware/airgap/job/isolation"), {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ pageNo: "1", pageSize: "1" }),
    }),
  ]);

  const metrics = [];

  const inCompliance = Number(sla.body.in_compliance) || 0;
  const outOfCompliance = Number(sla.body.out_of_compliance) || 0;
  if (inCompliance + outOfCompliance > 0) {
    metrics.push({
      key: "rpo_compliance_rate",
      value: (inCompliance / (inCompliance + outOfCompliance)) * 100,
      unit: "%",
    });
  }

  // Die Doku listet für ResourceTaskSummary.status keine feste Werteliste —
  // hier wird case-insensitive auf "success" gematcht. Bei Abweichungen im
  // realen Antwortformat ggf. anpassen (Log-Ausgabe der Rohdaten prüfen).
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
  }

  metrics.push({ key: "air_gap_isolation_events", value: Number(airgap.body.totalCount) || 0, unit: "count" });

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
    return [];
  }
  try {
    const [capacityResult, hardwareResult] = await Promise.allSettled([
      collectStorageMetrics(config, session),
      collectHardwareMetrics(config, session),
    ]);
    const metrics = [];
    if (capacityResult.status === "fulfilled") {
      metrics.push(...capacityResult.value);
    } else {
      config.logger?.warn(`Kapazitäts-/Alarm-Kennzahlen konnten nicht erhoben werden: ${capacityResult.reason.message}`);
    }
    if (hardwareResult.status === "fulfilled") {
      metrics.push(...hardwareResult.value);
    } else {
      config.logger?.warn(`Hardware-Kennzahlen konnten nicht erhoben werden: ${hardwareResult.reason.message}`);
    }
    return metrics;
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

  const [storageMetrics, dataBackupMetrics] = await Promise.all([
    tryCollectStorage(config),
    tryCollectDataBackup(config),
  ]);
  const metrics = [...storageMetrics, ...dataBackupMetrics];

  if (metrics.length === 0) {
    throw new Error("Weder Storage- noch DataBackup-Kennzahlen konnten erhoben werden — siehe Warnungen oben.");
  }
  return metrics;
}

module.exports = { collect };
