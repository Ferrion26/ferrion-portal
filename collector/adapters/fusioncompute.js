// Adapter für Huawei FusionCompute (Hypervisor-Management, VRM-API): liest
// Host-/Datastore-/VM-Status und aktive Alarme aus. Bietet außerdem —
// bewusst getrennt vom automatischen Healthcheck-Lauf, siehe
// maintenanceCli.js — das aktive Ein-/Ausschalten des Wartungsmodus an
// einem Host an.
//
// Quelle: FusionCompute 8.10.0 VRM-REST-Doku (docs/Rest/FusionCompute
// 8.10.0 REST Interface Reference.zip, Datei "VRM APIs.docx") — anders als
// bei Huaweis Storage-Produkten (OceanProtect/OceanStor) lag hierfür keine
// Live-Verifikation an einem echten Gerät vor (wie beim NetApp-Adapter).
// Mehrere Stellen sind daher bewusst defensiv/mit Fallbacks geschrieben,
// unten einzeln kommentiert. Beim ersten echten Ingest bitte
// meta.rawEndpoints im Admin-Bereich prüfen und diese Datei bei
// Abweichungen im tatsächlichen Antwortformat anpassen.
//
// Auth: POST /service/session mit X-Auth-User/X-Auth-Key/X-Auth-UserType-
// Headern (kein Login-Body wie bei OceanStor/OceanProtect) — der
// Session-Token kommt im X-Auth-Token RESPONSE-HEADER zurück, nicht im
// Body. Gültig 10 Minuten laut Doku — für einen einzelnen Collector-Lauf
// ausreichend, kein Refresh nötig. Die Doku sieht standardmäßig eine
// SHA-256-"Verschlüsselung" des Passworts vor (X-ENCRYPT-ALGORITHM-Header),
// deren genaue Konstruktion (Salt/Encoding) aus der verfügbaren Doku nicht
// zweifelsfrei hervorgeht — bewusste Entscheidung: X-ENCRYPT-ALGORITHM: 1
// (expliziter Klartext-Modus) und TLS als alleiniger Transportschutz, wie
// bei jedem anderen Adapter in diesem Repo. Zu verifizieren, sobald ein
// reales Gerät verfügbar ist.
const { requestJson, joinUrl } = require("../httpClient");

async function login(config) {
  const { managementUrl, username, password } = config.fusioncompute;
  const { headers } = await requestJson(config, joinUrl(managementUrl, "/service/session"), {
    method: "POST",
    headers: {
      "X-Auth-User": username,
      "X-Auth-Key": password,
      "X-Auth-UserType": "0",
      "X-ENCRYPT-ALGORITHM": "1",
    },
    body: "{}",
  });
  const token = headers.get("x-auth-token");
  if (!token) throw new Error("Login: kein X-Auth-Token-Header in der Antwort.");
  return { token };
}

// Kein dokumentierter Logout-Endpunkt für die VRM-Session gefunden — der
// Token läuft nach 10 Minuten von selbst ab (anders als bei OceanStor/
// OceanProtect, deren Session-Logout dokumentiert ist und dort explizit
// aufgerufen wird).
function authHeaders(session) {
  return { "X-Auth-Token": session.token };
}

async function fetchOptional(config, label, promise) {
  try {
    return await promise;
  } catch (err) {
    config.logger?.warn(`${label} konnte nicht abgerufen werden (übersprungen): ${err.message}`);
    return null;
  }
}

function captureRaw(rawEndpoints, key, result) {
  if (!result) return;
  rawEndpoints[key] = result.body;
}

// Die Doku bestätigt "items" nur für den Alarm-Endpunkt eindeutig
// (activeAlarms) — für die übrigen Listen-Endpunkte (hosts/datastores/vms/
// sites) ist der genaue Wrapper-Schlüssel aus der extrahierten Doku nicht
// zweifelsfrei hervorgegangen. Statt zu raten und bei falscher Annahme
// mit einem Absturz zu enden, wird hier mehrere plausible Schlüssel
// probiert und sonst eine leere Liste zurückgegeben (Healthcheck läuft
// weiter, meldet für diesen Bereich nur nichts — sichtbar über
// meta.rawEndpoints zur Fehlersuche beim ersten echten Lauf).
function extractList(body, ...candidateKeys) {
  for (const key of candidateKeys) {
    if (Array.isArray(body?.[key])) return body[key];
  }
  if (Array.isArray(body)) return body;
  return [];
}

function displayName(item) {
  return String(item.name ?? item.hostname ?? item.ip ?? item.uri ?? item.urn ?? "—");
}

// Site-ID aus dem ersten gefundenen Site-Objekt ableiten — probiert ein
// direktes id-Feld, sonst das letzte Pfadsegment aus uri/urn (siehe
// Beispiele in der Doku wie "urn:sites:3C0207D5:hosts:111").
function resolveSiteId(site) {
  if (site.id) return site.id;
  const fromUri = site.uri?.match(/\/sites\/([^/]+)/)?.[1];
  if (fromUri) return fromUri;
  const fromUrn = site.urn?.match(/sites:([^:]+)/)?.[1];
  if (fromUrn) return fromUrn;
  throw new Error("Site-ID konnte nicht aus dem Site-Objekt ermittelt werden.");
}

async function getFirstSiteId(config, session, base) {
  const sitesRes = await requestJson(config, joinUrl(base, "/sites"), { headers: authHeaders(session) });
  const siteList = extractList(sitesRes.body, "items", "sites");
  if (siteList.length === 0) throw new Error("Keine Site unter /service/sites gefunden.");
  return { siteId: resolveSiteId(siteList[0]), sitesRes };
}

// Sowohl numerische (1–4) als auch string-Formen (die Doku zeigt beide in
// unterschiedlichen Beispielen für dasselbe Feld iAlarmLevel) werden auf
// das dreistufige Schema dieses Repos gemappt — "minor" fällt dabei mit
// "warning" zusammen (kein eigenes viertes Level im Bericht).
const ALARM_LEVEL_MAP = { 1: "critical", 2: "major", 3: "warning", 4: "warning", critical: "critical", major: "major", minor: "warning", warning: "warning" };
function normalizeAlarmLevel(raw) {
  return ALARM_LEVEL_MAP[typeof raw === "string" ? raw.toLowerCase() : raw];
}

const ALARM_SAMPLE_SIZE = 5;

async function collect(config) {
  const fc = config.fusioncompute ?? {};
  const required = ["managementUrl", "username", "password"];
  const missing = required.filter((k) => !fc[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/fusioncompute.js: config.fusioncompute fehlt: ${missing.join(", ")}`);
  }

  const session = await login(config);
  const auth = { headers: authHeaders(session) };
  const base = joinUrl(fc.managementUrl, "/service");

  const { siteId, sitesRes } = await getFirstSiteId(config, session, base);
  const siteUri = joinUrl(base, `/sites/${siteId}`);

  const [hostsRes, clustersRes, datastoresRes, vmsRes, alarmsRes] = await Promise.all([
    requestJson(config, joinUrl(siteUri, "/hosts"), auth),
    fetchOptional(config, "Cluster-Liste", requestJson(config, joinUrl(siteUri, "/clusters"), auth)),
    requestJson(config, joinUrl(siteUri, "/datastores"), auth),
    fetchOptional(config, "VM-Liste", requestJson(config, joinUrl(siteUri, "/vms?detail=0"), auth)),
    fetchOptional(
      config,
      "Aktive Alarme",
      requestJson(config, joinUrl(siteUri, "/alarms/activeAlarms"), { method: "POST", headers: authHeaders(session), body: "{}" })
    ),
  ]);

  const rawEndpoints = {};
  captureRaw(rawEndpoints, "/sites", sitesRes);
  captureRaw(rawEndpoints, "/hosts", hostsRes);
  captureRaw(rawEndpoints, "/clusters", clustersRes);
  captureRaw(rawEndpoints, "/datastores", datastoresRes);
  captureRaw(rawEndpoints, "/vms", vmsRes);
  captureRaw(rawEndpoints, "/alarms/activeAlarms", alarmsRes);
  // Cluster werden nur zur Rohdaten-Erfassung abgefragt — im Objekt selbst
  // ist laut Doku kein Health-/Statusfeld dokumentiert (nur Konfigurations-
  // felder wie isEnableHa/isEnableDrs), daher keine eigene Metrik/kein
  // eigener Componentcheck dafür (würde eine nicht belegte Annahme über die
  // Bedeutung eines Felds erfordern).

  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  // --- Hosts ---
  // status: normal (gut) | fault/unknow (Fehler) | rebooting/poweroff/
  // booting/shutdowning (Übergangszustände, nicht als Fehler gewertet).
  const hostList = extractList(hostsRes.body, "items", "hosts");
  if (hostList.length > 0) {
    const normalCount = hostList.filter((h) => h.status === "normal").length;
    metrics.push({ key: "system_availability", value: (normalCount / hostList.length) * 100, unit: "%" });
    metrics.push({ key: "hosts_faulty", value: hostList.filter((h) => h.status === "fault" || h.status === "unknow").length, unit: "count" });
    metrics.push({ key: "hosts_maintenance", value: hostList.filter((h) => h.isMaintaining === true).length, unit: "count" });
    for (const h of hostList) {
      const name = displayName(h);
      const ok = h.status === "normal" && h.isSubhealth !== true;
      const description = h.isMaintaining ? "Wartungsmodus" : h.status ?? "unbekannt";
      componentChecks.push({ category: "Host", id: name, description, ok });
      if (!ok) componentFaults.push({ category: "Host", id: name, description });
    }
  }

  // --- Datastores ---
  // status-Enum ist je nach scope-Parameter unterschiedlich — hier ohne
  // scope (site-weite Liste): NORMAL/ABNORMAL/CREATING/DELETING/READONLY/
  // EXPANDING/RESTORING. actualCapacityGB/usedSizeGB statt der laut Doku
  // veralteten capacityGB/freeSizeGB-Felder.
  const datastoreList = extractList(datastoresRes.body, "items", "datastores");
  let totalGB = 0;
  let usedGB = 0;
  if (datastoreList.length > 0) {
    metrics.push({ key: "datastores_unhealthy", value: datastoreList.filter((d) => d.status !== "NORMAL").length, unit: "count" });
    for (const d of datastoreList) {
      const name = displayName(d);
      const ok = d.status === "NORMAL";
      componentChecks.push({ category: "Datastore", id: name, description: d.status ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "Datastore", id: name, description: d.status ?? "unbekannt" });
      const size = Number(d.actualCapacityGB);
      const used = Number(d.usedSizeGB);
      if (Number.isFinite(size)) totalGB += size;
      if (Number.isFinite(used)) usedGB += used;
    }
  }
  if (totalGB > 0) {
    metrics.push({ key: "total_capacity_tb", value: totalGB / 1024, unit: "TB" });
    metrics.push({ key: "used_capacity_tb", value: usedGB / 1024, unit: "TB" });
    metrics.push({ key: "storage_pool_fill_level", value: (usedGB / totalGB) * 100, unit: "%" });
  }

  // --- VMs ---
  // Nur "unknown" wird als echter Fehler gewertet — stopped/hibernated/
  // pause usw. sind legitime, gewollte Zustände, keine Auffälligkeiten.
  const vmList = extractList(vmsRes?.body, "items", "vms");
  if (vmList.length > 0) {
    metrics.push({ key: "vms_faulty", value: vmList.filter((v) => v.status === "unknown").length, unit: "count" });
    for (const v of vmList) {
      const name = displayName(v);
      const ok = v.status !== "unknown";
      componentChecks.push({ category: "VM", id: name, description: v.status ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "VM", id: name, description: v.status ?? "unbekannt" });
    }
  }

  // --- Alarme ---
  let alarmSamples;
  if (alarmsRes) {
    const items = extractList(alarmsRes.body, "items");
    const counts = { critical: 0, major: 0, warning: 0 };
    const seenBySeverity = { critical: new Set(), major: new Set(), warning: new Set() };
    alarmSamples = [];
    for (const a of items) {
      const severity = normalizeAlarmLevel(a.iAlarmLevel);
      if (!severity) continue;
      counts[severity] += 1;
      const name = String(a.svAlarmName ?? "Alarm");
      const seen = seenBySeverity[severity];
      if (seen.size < ALARM_SAMPLE_SIZE && !seen.has(name)) {
        seen.add(name);
        alarmSamples.push({
          severity,
          name: name.slice(0, 200),
          description: String(a.svAdditionalInfo ?? a.svAlarmCause ?? "—").slice(0, 500),
          time: a.dtOccurTime ?? undefined,
        });
      }
    }
    metrics.push({ key: "alerts_critical", value: counts.critical, unit: "count" });
    metrics.push({ key: "alerts_major", value: counts.major, unit: "count" });
    metrics.push({ key: "alerts_warning", value: counts.warning, unit: "count" });
  }

  if (metrics.length === 0) {
    throw new Error("Keine Kennzahlen konnten erhoben werden.");
  }

  const meta = {};
  if (alarmSamples !== undefined) meta.alarmSamples = alarmSamples;
  if (componentFaults.length > 0) meta.componentFaults = componentFaults;
  if (componentChecks.length > 0) meta.componentChecks = componentChecks;
  if (Object.keys(rawEndpoints).length > 0) meta.rawEndpoints = rawEndpoints;

  return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
}

// --- Aktive Wartung (bewusst nicht Teil von collect()) ---
// Host-Wartungsmodus ein-/ausschalten ist ein schreibender Eingriff am
// Kundengerät — wird nur über den separaten "maintenance"-CLI-Befehl
// ausgelöst (siehe maintenanceCli.js), nie automatisch beim Healthcheck.
async function setMaintenanceMode(config, hostId, enable) {
  const fc = config.fusioncompute ?? {};
  const required = ["managementUrl", "username", "password"];
  const missing = required.filter((k) => !fc[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/fusioncompute.js: config.fusioncompute fehlt: ${missing.join(", ")}`);
  }

  const session = await login(config);
  const base = joinUrl(fc.managementUrl, "/service");
  const { siteId } = await getFirstSiteId(config, session, base);
  const action = enable ? "enterMaintenanceMode" : "exitMaintenanceMode";
  await requestJson(config, joinUrl(base, `/sites/${siteId}/hosts/${hostId}/action/${action}`), {
    method: "POST",
    headers: authHeaders(session),
  });
}

function enterMaintenance(config, hostId) {
  return setMaintenanceMode(config, hostId, true);
}

function exitMaintenance(config, hostId) {
  return setMaintenanceMode(config, hostId, false);
}

module.exports = { collect, enterMaintenance, exitMaintenance };
