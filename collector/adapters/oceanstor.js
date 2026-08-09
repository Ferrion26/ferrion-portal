// Adapter für Huawei OceanStor (Hybrid-Flash-Serie, z. B. 5310): liest
// Kennzahlen aus der DeviceManager-REST-API der Appliance aus.
//
// Quelle: die vom Kunden bereitgestellte Huawei-REST-Doku
// ("OceanStor V700R001C30 REST Interface Reference", siehe docs/Rest/ im
// Repo). Dieselbe DeviceManager-API-Generation wie beim OceanProtect
// Backup-Storage-Adapter (adapters/oceanprotect.js) — Login, Alarm-,
// Controller-/Disk-/Fan-/Power-Endpunkte sind identisch aufgebaut, daher
// bewusst dieselbe Struktur. OceanStor ist reiner Primärspeicher, es gibt
// keine DataBackup-Ebene (Backup-Jobs, SLA, Air-Gap) wie beim OceanProtect.
//
// metricKeys müssen exakt zu den Definitionen in
// src/lib/managed-reports/metrics/oceanstor.ts passen.
const { requestJson, joinUrl } = require("../httpClient");

async function login(config) {
  const { deviceManagerUrl, username, password } = config.oceanstor;
  const { body, headers } = await requestJson(config, joinUrl(deviceManagerUrl, "/deviceManager/rest/xxxxx/sessions"), {
    method: "POST",
    body: JSON.stringify({ username, password, scope: "0" }),
  });
  const cookie = headers.get("set-cookie");
  if (!cookie) throw new Error("Login: kein Set-Cookie-Header in der Antwort.");
  return { deviceId: body.data.deviceid, iBaseToken: body.data.iBaseToken, cookie };
}

async function logout(config, session) {
  const { deviceManagerUrl } = config.oceanstor;
  await requestJson(config, joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}/sessions`), {
    method: "DELETE",
    headers: { iBaseToken: session.iBaseToken, Cookie: session.cookie },
  }).catch((err) => config.logger?.warn(`Logout fehlgeschlagen (ignoriert): ${err.message}`));
}

// Parst die JSON-String-Ratio-Felder, die der DeviceManager für
// Reduktionsraten liefert, z. B. {"numerator":"1265","denominator":"1000"}.
function parseRatio(raw) {
  const r = JSON.parse(raw);
  const ratio = Number(r.numerator) / Number(r.denominator);
  return Number.isFinite(ratio) ? ratio : null;
}

const ALARM_LEVELS = [
  { level: 6, severity: "critical" },
  { level: 5, severity: "major" },
  { level: 3, severity: "warning" },
];
const ALARM_SAMPLE_SIZE = 5;

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

async function fetchOptional(config, label, promise) {
  try {
    return await promise;
  } catch (err) {
    config.logger?.warn(`${label} konnte nicht abgerufen werden (übersprungen): ${err.message}`);
    return null;
  }
}

async function collectCapacityMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanstor;
  const poolId = config.oceanstor.storagePoolId ?? "0";
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

  const usedSectors = Number(poolInfo.body.data.USERCONSUMEDCAPACITY);
  let usedTB = null;
  if (Number.isFinite(usedSectors)) {
    usedTB = (usedSectors * 512) / 1024 ** 4;
    metrics.push({ key: "used_capacity_tb", value: usedTB, unit: "TB" });
  }

  if (usedTB !== null && reductionRatio !== null) {
    metrics.push({ key: "capacity_before_reduction_tb", value: usedTB * reductionRatio, unit: "TB" });
  }

  const fillLevel = Number(poolInfo.body.data.USERCONSUMEDCAPACITYPERCENTAGE);
  if (Number.isFinite(fillLevel)) {
    metrics.push({ key: "storage_pool_fill_level", value: fillLevel, unit: "%" });
  }

  metrics.push({ key: "alerts_critical", value: Number(critical.body.data.COUNT) || 0, unit: "count" });
  metrics.push({ key: "alerts_major", value: Number(major.body.data.COUNT) || 0, unit: "count" });
  metrics.push({ key: "alerts_warning", value: Number(warning.body.data.COUNT) || 0, unit: "count" });

  return { metrics, alarmSamples };
}

async function collectHardwareMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanstor;
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const [system, controllers, disks, fans, power, ethPorts, fsSnapshots] = await Promise.all([
    requestJson(config, joinUrl(base, "/system/"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/controller"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/disk"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/fan"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/power"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/eth_port"), { headers: authHeaders }),
    fetchOptional(config, "Dateisystem-Snapshot-Anzahl", requestJson(config, joinUrl(base, "/FSSNAPSHOT/count"), { headers: authHeaders })),
  ]);

  const metrics = [];

  const sys = system.body.data;
  const systemHealthy = Number(sys.HEALTHSTATUS) === 1 && Number(sys.RUNNINGSTATUS) === 1 ? 100 : 0;
  metrics.push({ key: "system_availability", value: systemHealthy, unit: "%" });

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
  metrics.push({ key: "controllers_faulty", value: controllerList.filter((c) => Number(c.HEALTHSTATUS) !== 1).length, unit: "count" });

  const diskList = Array.isArray(disks.body.data) ? disks.body.data : [];
  metrics.push({ key: "disks_faulty", value: diskList.filter((d) => Number(d.HEALTHSTATUS) !== 1).length, unit: "count" });

  const fanList = Array.isArray(fans.body.data) ? fans.body.data : [];
  metrics.push({ key: "fans_faulty", value: fanList.filter((f) => Number(f.HEALTHSTATUS) !== 1).length, unit: "count" });

  const powerList = Array.isArray(power.body.data) ? power.body.data : [];
  metrics.push({ key: "power_modules_faulty", value: powerList.filter((p) => Number(p.HEALTHSTATUS) !== 1).length, unit: "count" });

  const ethList = Array.isArray(ethPorts.body.data) ? ethPorts.body.data : [];
  const activePorts = ethList.filter((p) => Number(p.HEALTHSTATUS) !== 0);
  metrics.push({ key: "eth_ports_down", value: activePorts.filter((p) => Number(p.RUNNINGSTATUS) === 11).length, unit: "count" });

  if (fsSnapshots) {
    metrics.push({ key: "snapshot_count", value: Number(fsSnapshots.body.data.COUNT) || 0, unit: "count" });
  }

  return { metrics, deviceInfo };
}

async function collect(config) {
  const oc = config.oceanstor ?? {};
  const required = ["deviceManagerUrl", "username", "password"];
  const missing = required.filter((k) => !oc[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/oceanstor.js: config.oceanstor fehlt: ${missing.join(", ")}`);
  }

  const session = await login(config);
  try {
    const [capacityResult, hardwareResult] = await Promise.allSettled([
      collectCapacityMetrics(config, session),
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

    if (metrics.length === 0) {
      throw new Error("Keine Kennzahlen konnten erhoben werden — siehe Warnungen oben.");
    }

    const meta = {};
    // deviceId aus der Login-Antwort ist bei Huawei die Geräte-ESN (Seriennummer).
    if (session.deviceId) meta.deviceSerialNumber = session.deviceId;
    if (deviceInfo?.model) meta.deviceModel = deviceInfo.model;
    if (deviceInfo?.softwareVersion) meta.deviceSoftwareVersion = deviceInfo.softwareVersion;
    if (alarmSamples.length > 0) meta.alarmSamples = alarmSamples;

    return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
  } finally {
    await logout(config, session);
  }
}

module.exports = { collect };
