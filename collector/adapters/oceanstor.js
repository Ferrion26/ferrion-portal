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

// Sammelt die vollständige Rohantwort eines REST-Aufrufs unter einem
// sprechenden Schlüssel (nicht nur die paar Felder, die aktuell in Metriken
// umgewandelt werden) — landet unverändert in meta.rawEndpoints und damit im
// Ingest-Payload (siehe CollectorIngestion.payload). So lassen sich später
// neue Auswertungen auf bereits gesammelten Ingestions nachrüsten, ohne dass
// jeder Kundenstandort erst einen neuen Collector bekommen muss, nur weil
// eine Spalte im ursprünglichen Adapter vergessen wurde.
function captureRaw(rawEndpoints, key, result) {
  if (!result) return;
  rawEndpoints[key] = result.body?.data !== undefined ? result.body.data : result.body;
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
// Wie viele UNTERSCHIEDLICHE Alarmtypen pro Schweregrad im Bericht gezeigt
// werden (siehe oceanprotect.js für die ausführliche Begründung, warum das
// Fetch-Fenster deutlich größer ist als die Sample-Größe).
const ALARM_SAMPLE_SIZE = 5;
const ALARM_FETCH_RANGE = 50;

async function fetchAlarmSamples(config, base, authHeaders, rawEndpoints) {
  const samples = [];
  for (const { level, severity } of ALARM_LEVELS) {
    try {
      const { body } = await requestJson(
        config,
        joinUrl(base, `/alarm/currentalarm?filter=level::${level}&sortby=startTime,d&range=[0-${ALARM_FETCH_RANGE - 1}]`),
        { headers: authHeaders }
      );
      if (rawEndpoints) rawEndpoints[`/alarm/currentalarm?level=${level}`] = body.data;
      const seenNames = new Set();
      for (const alarm of body.data ?? []) {
        const name = String(alarm.name ?? "").slice(0, 200) || "Alarm";
        if (seenNames.has(name)) continue;
        if (seenNames.size >= ALARM_SAMPLE_SIZE) break;
        seenNames.add(name);
        samples.push({
          severity,
          sequence: alarm.sequence !== undefined ? String(alarm.sequence) : undefined,
          name,
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

// Klartext für die üblichen HEALTHSTATUS-Codes der DeviceManager-API — für
// die Detailreferenz am Ende des Berichts, wenn eine Fehler-Kennzahl > 0 ist.
const HEALTH_STATUS_LABELS = {
  0: "Unbekannt",
  1: "Normal",
  2: "Fehlerhaft",
  3: "Fällt demnächst aus",
  5: "Beeinträchtigt",
  9: "Inkonsistent",
  11: "Kein Eingang",
  14: "Ungültig",
  17: "Nur ein Link",
};
function describeHealthStatus(code) {
  return HEALTH_STATUS_LABELS[code] ?? `Status-Code ${code}`;
}

// Menschenlesbarer Name einer Komponente für die Detail-Referenz — die reine
// numerische ID (z. B. "281480086560769" bei einem Ethernet-Port) ist für
// niemanden nachvollziehbar. Reihenfolge nach Feldname, der beim jeweiligen
// Endpunkt laut REST-Doku den Klartext trägt: NAME (eth_port, remote_device),
// LOCALRESNAME (REPLICATIONPAIR), location (sfp, klein geschrieben). Fällt
// mangels Klartextfeld auf die rohe ID zurück.
function componentDisplayName(item) {
  return String(item.NAME ?? item.LOCALRESNAME ?? item.location ?? item.LOCATION ?? item.ID ?? item.id ?? "—");
}

// Sammelt Details zu den NICHT normalen Einträgen (componentFaults) UND —
// sofern componentChecks übergeben wird — zu JEDEM geprüften Element inkl.
// der normalen (für den abschließenden "erfolgreich geprüft"-
// Referenzabschnitt im Bericht).
function collectFaultDetails(componentFaults, componentChecks, category, list, isOk) {
  for (const item of list) {
    const status = Number(item.HEALTHSTATUS ?? item.healthStatus);
    const ok = isOk(status);
    if (componentChecks) {
      componentChecks.push({ category, id: componentDisplayName(item), description: describeHealthStatus(status), ok });
    }
    if (ok) continue;
    componentFaults.push({
      category,
      id: componentDisplayName(item),
      description: describeHealthStatus(status),
    });
  }
}

async function collectCapacityMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanstor;
  const poolId = config.oceanstor.storagePoolId ?? "0";
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const rawEndpoints = {};
  const [dataInfo, poolInfo, critical, major, warning, alarmSamples] = await Promise.all([
    requestJson(config, joinUrl(base, `/storagepool_data_info/${poolId}`), { headers: authHeaders }),
    requestJson(config, joinUrl(base, `/storagepool/${poolId}`), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::6"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::5"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/alarm/currentalarm/count?filter=level::3"), { headers: authHeaders }),
    fetchAlarmSamples(config, base, authHeaders, rawEndpoints),
  ]);
  captureRaw(rawEndpoints, "/storagepool_data_info", dataInfo);
  captureRaw(rawEndpoints, "/storagepool", poolInfo);

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
  const totalSectors = Number(poolInfo.body.data.USERTOTALCAPACITY);
  if (Number.isFinite(totalSectors)) {
    metrics.push({ key: "total_capacity_tb", value: (totalSectors * 512) / 1024 ** 4, unit: "TB" });
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

  return { metrics, alarmSamples, rawEndpoints };
}

async function collectHardwareMetrics(config, session) {
  const { deviceManagerUrl } = config.oceanstor;
  const authHeaders = { iBaseToken: session.iBaseToken, Cookie: session.cookie };
  const base = joinUrl(deviceManagerUrl, `/deviceManager/rest/${session.deviceId}`);

  const [
    system,
    controllers,
    disks,
    fans,
    power,
    ethPorts,
    fsSnapshots,
    replicationPairs,
    remoteDevices,
    sfpModules,
    email,
    syslog,
    license,
    certificates,
    enclosures,
    filesystems,
    storagePools,
    dmeIq,
    mfaEmail,
  ] = await Promise.all([
    requestJson(config, joinUrl(base, "/system/"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/controller"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/disk"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/fan"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/power"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/eth_port"), { headers: authHeaders }),
    fetchOptional(config, "Dateisystem-Snapshot-Anzahl", requestJson(config, joinUrl(base, "/FSSNAPSHOT/count"), { headers: authHeaders })),
    // Replikationspaare/Remote-Devices (siehe oceanprotect.js für die
    // ausführliche Begründung, warum beide getrennt gemeldet werden).
    fetchOptional(config, "Replikationspaare", requestJson(config, joinUrl(base, "/REPLICATIONPAIR"), { headers: authHeaders })),
    fetchOptional(config, "Remote-Devices", requestJson(config, joinUrl(base, "/remote_device"), { headers: authHeaders })),
    // Aus dem Huawei-Inspector-Healthcheck abgeleitet (siehe oceanprotect.js
    // für die ausführliche Begründung).
    fetchOptional(config, "Optical-Module-Status", requestJson(config, joinUrl(base, "/sfp"), { headers: authHeaders })),
    fetchOptional(config, "Email-Benachrichtigung", requestJson(config, joinUrl(base, "/email"), { headers: authHeaders })),
    fetchOptional(config, "Syslog-Benachrichtigung", requestJson(config, joinUrl(base, "/syslog"), { headers: authHeaders })),
    fetchOptional(config, "Lizenzstatus", requestJson(config, joinUrl(base, "/license/activelicense"), { headers: authHeaders })),
    fetchOptional(config, "Zertifikatsstatus", requestJson(config, joinUrl(base, "/certificate"), { headers: authHeaders })),
    // Gehäuse-Inventar (Controller-/Disk-Enclosures) — Teil von "Hardware >
    // Inventory" im DeviceManager (siehe oceanprotect.js).
    fetchOptional(config, "Gehäuse-Status", requestJson(config, joinUrl(base, "/enclosure"), { headers: authHeaders })),
    // Alle Dateisysteme (nicht nur eine bestimmte Freigabe).
    fetchOptional(config, "Dateisystem-Status", requestJson(config, joinUrl(base, "/filesystem"), { headers: authHeaders })),
    // Alle Storage Pools — unabhängig vom für Kapazitätskennzahlen
    // konfigurierten storagePoolId.
    fetchOptional(config, "Storage-Pool-Status (alle)", requestJson(config, joinUrl(base, "/storagepool"), { headers: authHeaders })),
    // DME IQ: Huaweis Remote-O&M-/Call-Home-Kanal.
    fetchOptional(config, "DME-IQ-Status", requestJson(config, joinUrl(base, "/chs_remote_assistance_strategy"), { headers: authHeaders })),
    // Multi-Faktor-Authentifizierung (E-Mail-Einmalpasswort).
    fetchOptional(config, "MFA-Status", requestJson(config, joinUrl(base, "/USER_AUTH_EMAIL"), { headers: authHeaders })),
  ]);

  const rawEndpoints = {};
  captureRaw(rawEndpoints, "/system", system);
  captureRaw(rawEndpoints, "/controller", controllers);
  captureRaw(rawEndpoints, "/disk", disks);
  captureRaw(rawEndpoints, "/fan", fans);
  captureRaw(rawEndpoints, "/power", power);
  captureRaw(rawEndpoints, "/eth_port", ethPorts);
  captureRaw(rawEndpoints, "/FSSNAPSHOT/count", fsSnapshots);
  captureRaw(rawEndpoints, "/REPLICATIONPAIR", replicationPairs);
  captureRaw(rawEndpoints, "/remote_device", remoteDevices);
  captureRaw(rawEndpoints, "/sfp", sfpModules);
  captureRaw(rawEndpoints, "/email", email);
  captureRaw(rawEndpoints, "/syslog", syslog);
  captureRaw(rawEndpoints, "/license/activelicense", license);
  captureRaw(rawEndpoints, "/certificate", certificates);
  captureRaw(rawEndpoints, "/enclosure", enclosures);
  captureRaw(rawEndpoints, "/filesystem", filesystems);
  captureRaw(rawEndpoints, "/storagepool", storagePools);
  captureRaw(rawEndpoints, "/chs_remote_assistance_strategy", dmeIq);
  captureRaw(rawEndpoints, "/USER_AUTH_EMAIL", mfaEmail);

  const metrics = [];
  const componentFaults = [];
  // Jede geprüfte Komponente (Normal UND fehlerhaft) — Grundlage für den
  // abschließenden "erfolgreich geprüft"-Referenzabschnitt im Bericht.
  const componentChecks = [];

  const sys = system.body.data;
  const systemHealthy = Number(sys.HEALTHSTATUS) === 1 && Number(sys.RUNNINGSTATUS) === 1 ? 100 : 0;
  metrics.push({ key: "system_availability", value: systemHealthy, unit: "%" });

  // patchVersion (z. B. "SPH118") wird von /system/ nur zurückgegeben, wenn
  // ein Patch installiert ist — Anschluss direkt an PRODUCTVERSION ohne
  // Trenner, exakt wie Huawei den kombinierten Versionsstring selbst zeigt.
  const softwareVersion = sys.PRODUCTVERSION ? `${sys.PRODUCTVERSION}${sys.patchVersion || ""}` : null;
  // NAME ist der vom Kunden vergebene Systemname (z. B. "hwe-clu1"), der
  // oben links im DeviceManager als Cluster-Bezeichnung erscheint.
  const deviceInfo = { model: sys.productModeString || null, softwareVersion, name: sys.NAME || null };

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
  collectFaultDetails(componentFaults, componentChecks, "Controller", controllerList, (s) => s === 1);

  // Firmware-Konsistenz zwischen Controllern (aus dem Inspector-Healthcheck).
  const firmwareVersions = new Set(controllerList.map((c) => c.SOFTVER).filter(Boolean));
  if (firmwareVersions.size > 0) {
    const firmwareOk = firmwareVersions.size <= 1;
    metrics.push({ key: "controllers_firmware_inconsistent", value: firmwareOk ? 0 : 1, unit: "count" });
    componentChecks.push({
      category: "Firmware",
      id: "Alle Controller",
      description: `Versionen: ${[...firmwareVersions].join(", ")}`,
      ok: firmwareOk,
    });
    if (!firmwareOk) {
      for (const c of controllerList) {
        componentFaults.push({ category: "Firmware", id: `Controller ${c.ID}`, description: `Version ${c.SOFTVER}` });
      }
    }
  }

  const diskList = Array.isArray(disks.body.data) ? disks.body.data : [];
  metrics.push({ key: "disks_faulty", value: diskList.filter((d) => Number(d.HEALTHSTATUS) !== 1).length, unit: "count" });
  collectFaultDetails(componentFaults, componentChecks, "Festplatte", diskList, (s) => s === 1);

  const fanList = Array.isArray(fans.body.data) ? fans.body.data : [];
  metrics.push({ key: "fans_faulty", value: fanList.filter((f) => Number(f.HEALTHSTATUS) !== 1).length, unit: "count" });
  collectFaultDetails(componentFaults, componentChecks, "Lüfter", fanList, (s) => s === 1);

  const powerList = Array.isArray(power.body.data) ? power.body.data : [];
  metrics.push({ key: "power_modules_faulty", value: powerList.filter((p) => Number(p.HEALTHSTATUS) !== 1).length, unit: "count" });
  collectFaultDetails(componentFaults, componentChecks, "Netzteil", powerList, (s) => s === 1);

  // Wartungsports (z. B. "CTE0.A.MAINTENANCE") sind regulär nicht
  // angeschlossen und würden sonst dauerhaft als "down" mitgezählt.
  const ethList = Array.isArray(ethPorts.body.data) ? ethPorts.body.data : [];
  const activePorts = ethList.filter((p) => Number(p.HEALTHSTATUS) !== 0 && !/maintenance/i.test(String(p.NAME ?? p.ID ?? "")));
  const downPorts = activePorts.filter((p) => Number(p.RUNNINGSTATUS) === 11);
  metrics.push({ key: "eth_ports_down", value: downPorts.length, unit: "count" });
  for (const p of activePorts) {
    const down = Number(p.RUNNINGSTATUS) === 11;
    componentChecks.push({ category: "Netzwerk-Port", id: componentDisplayName(p), description: down ? "Offline" : "Online", ok: !down });
    if (down) componentFaults.push({ category: "Netzwerk-Port", id: componentDisplayName(p), description: "Offline" });
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
    collectFaultDetails(componentFaults, componentChecks, "Replikationspaar", replicationPairList, (s) => s === 1);
  }

  // Remote-Devices: eigenständiger Verbindungsstatus zu Replikationszielen
  // (HEALTHSTATUS 1 = Normal, 2 = Faulty, 14 = Invalid).
  const remoteDeviceList = Array.isArray(remoteDevices?.body?.data) ? remoteDevices.body.data : [];
  if (remoteDeviceList.length > 0) {
    metrics.push({
      key: "remote_devices_unhealthy",
      value: remoteDeviceList.filter((d) => Number(d.HEALTHSTATUS) !== 1).length,
      unit: "count",
    });
    collectFaultDetails(componentFaults, componentChecks, "Remote-Device", remoteDeviceList, (s) => s === 1);
  }

  // Gehäuse-Inventar (Controller-/Disk-Enclosures) — "Hardware > Inventory".
  const enclosureList = Array.isArray(enclosures?.body?.data) ? enclosures.body.data : [];
  if (enclosureList.length > 0) {
    metrics.push({ key: "enclosures_faulty", value: enclosureList.filter((e) => Number(e.HEALTHSTATUS) !== 1).length, unit: "count" });
    collectFaultDetails(componentFaults, componentChecks, "Gehäuse", enclosureList, (s) => s === 1);
  }

  // Alle Dateisysteme (nicht nur eine bestimmte Freigabe).
  const filesystemList = Array.isArray(filesystems?.body?.data) ? filesystems.body.data : [];
  if (filesystemList.length > 0) {
    metrics.push({ key: "filesystems_faulty", value: filesystemList.filter((f) => Number(f.HEALTHSTATUS) !== 1).length, unit: "count" });
    collectFaultDetails(componentFaults, componentChecks, "Dateisystem", filesystemList, (s) => s === 1);
  }

  // Alle Storage Pools (HEALTHSTATUS 1 = Normal, 2 = Faulty, 5 = Degraded) —
  // unabhängig vom für Kapazitätskennzahlen konfigurierten storagePoolId.
  const storagePoolList = Array.isArray(storagePools?.body?.data) ? storagePools.body.data : [];
  if (storagePoolList.length > 0) {
    metrics.push({
      key: "storage_pools_unhealthy",
      value: storagePoolList.filter((p) => Number(p.HEALTHSTATUS) !== 1).length,
      unit: "count",
    });
    collectFaultDetails(componentFaults, componentChecks, "Storage Pool", storagePoolList, (s) => s === 1);
  }

  if (fsSnapshots) {
    metrics.push({ key: "snapshot_count", value: Number(fsSnapshots.body.data.COUNT) || 0, unit: "count" });
  }

  // Optical-Module-HEALTHSTATUS: 0 = nicht erkannt (laut Inspector-Kriterium
  // normal, z. B. unbestückter Port), 1 = normal, alles andere fehlerhaft.
  const sfpList = Array.isArray(sfpModules?.body?.data) ? sfpModules.body.data : [];
  if (sfpList.length > 0) {
    metrics.push({
      key: "optical_modules_faulty",
      value: sfpList.filter((s) => ![0, 1].includes(Number(s.healthStatus))).length,
      unit: "count",
    });
    collectFaultDetails(componentFaults, componentChecks, "Optikmodul", sfpList, (s) => s === 0 || s === 1);
  }

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

  // DME IQ (Remote-O&M-/Call-Home-Kanal): remotePolicySwitch 1 = aktiviert.
  if (dmeIq) {
    const dmeIqData = Array.isArray(dmeIq.body.data) ? dmeIq.body.data[0] : dmeIq.body.data;
    if (dmeIqData) {
      metrics.push({ key: "dme_iq_disabled", value: Number(dmeIqData.remotePolicySwitch) === 1 ? 0 : 1, unit: "count" });
    }
  }

  // Multi-Faktor-Authentifizierung (E-Mail-Einmalpasswort): dasselbe Feld
  // wie bei der Alarm-Email-Benachrichtigung, aber ein anderer Endpunkt
  // (USER_AUTH_EMAIL statt email).
  if (mfaEmail) {
    metrics.push({ key: "mfa_disabled", value: Number(mfaEmail.body.data.CMO_EMAIL_NEED_SEND) === 1 ? 0 : 1, unit: "count" });
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

  return { metrics, deviceInfo, componentFaults, componentChecks, rawEndpoints };
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
    let alarmSamples;
    let componentFaults;
    let componentChecks;
    const rawEndpoints = {};
    if (capacityResult.status === "fulfilled") {
      metrics.push(...capacityResult.value.metrics);
      alarmSamples = capacityResult.value.alarmSamples;
      Object.assign(rawEndpoints, capacityResult.value.rawEndpoints);
    } else {
      config.logger?.warn(`Kapazitäts-/Alarm-Kennzahlen konnten nicht erhoben werden: ${capacityResult.reason.message}`);
    }
    if (hardwareResult.status === "fulfilled") {
      metrics.push(...hardwareResult.value.metrics);
      deviceInfo = hardwareResult.value.deviceInfo;
      componentFaults = hardwareResult.value.componentFaults;
      componentChecks = hardwareResult.value.componentChecks;
      Object.assign(rawEndpoints, hardwareResult.value.rawEndpoints);
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
    if (deviceInfo?.name) meta.deviceName = deviceInfo.name;
    if (deviceInfo?.softwareVersion) meta.deviceSoftwareVersion = deviceInfo.softwareVersion;
    // undefined = nicht erhoben, weglassen; leeres Array = echtes Ergebnis
    // ("aktuell keine Alarme/Fehler"), wird mitgeschickt.
    if (alarmSamples !== undefined) meta.alarmSamples = alarmSamples;
    if (componentFaults !== undefined) meta.componentFaults = componentFaults;
    // Reine Momentaufnahme (kein aktiv/gelöst-Historienkonzept wie bei
    // componentFaults) — wird bei jedem Ingest einfach überschrieben.
    if (componentChecks?.length > 0) meta.componentChecks = componentChecks;
    // Vollständige Rohantworten aller abgefragten Endpunkte (siehe captureRaw
    // oben) — für spätere Auswertungen, ohne dafür einen neuen Collector zu
    // benötigen, falls in einem Adapter mal ein Feld vergessen wurde.
    if (Object.keys(rawEndpoints).length > 0) meta.rawEndpoints = rawEndpoints;

    return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
  } finally {
    await logout(config, session);
  }
}

module.exports = { collect };
