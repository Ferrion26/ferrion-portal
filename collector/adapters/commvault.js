// Adapter für Commvault (Backup-Software): liest Job-/Client-/Storage-/
// Lizenz-/Ereignis-Status über die Commvault-REST-API aus.
//
// Quelle: Commvaults öffentliche REST-API-Doku (documentation.commvault.com,
// vormals api.commvault.com) — online recherchiert, wie beim NetApp- und
// FusionCompute-Adapter, NICHT an einem realen CommCell verifiziert.
// Unterschiedlich gut belegt je Bereich:
//   - Login/Client-Liste/Job-Liste: aus vollständig abrufbaren Doku-Seiten
//     bestätigt (Endpunkt, Methode, Feldnamen).
//   - CommCell-Stammdaten, SLA-Compliance, Storage-Pool-Kapazität, Lizenz-
//     Ablauf, Ereignisse: nur aus Suchergebnis-Snippets bzw. (MediaAgent-
//     Status) einem einzelnen Commvault-Community-Forenpost belegt, NICHT
//     aus einer vollständig abrufbaren, offiziellen Doku-Seite mit
//     Beispiel-Antwort. Diese Bereiche sind bewusst besonders defensiv
//     geschrieben (mehrere Feldnamen-Kandidaten, try/catch um die
//     Feld-Interpretation) — ein falsches Schema führt bestenfalls dazu,
//     dass die jeweilige Kennzahl fehlt, nie zum Abbruch des Laufs. Beim
//     ersten echten Ingest bitte meta.rawEndpoints im Admin-Bereich prüfen
//     und diese Datei bei Abweichungen anpassen (wie bereits bei
//     netapp.js/fusioncompute.js praktiziert).
//
// metricKeys müssen exakt zu den Definitionen in
// src/lib/managed-reports/metrics/commvault.ts passen.
const { requestJson, joinUrl } = require("../httpClient");

// Login: POST <base>/Login mit Base64-kodiertem Passwort (laut Doku
// zwingend, kein Klartext) — Antwort-Feld "token", danach Header
// "Authtoken: <token>" auf allen Folgeaufrufen (kein "Authorization:
// Bearer"). Neuerer, empfohlener Basis-Pfad "/commandcenter/api" (der
// ältere "/webconsole/api" wird laut Doku inzwischen dorthin umgeleitet).
async function login(config) {
  const { baseUrl, username, password, domain } = config.commvault;
  const base = joinUrl(baseUrl, "/commandcenter/api");
  const { body } = await requestJson(config, joinUrl(base, "/Login"), {
    method: "POST",
    body: JSON.stringify({
      username,
      password: Buffer.from(password, "utf8").toString("base64"),
      domain: domain ?? "",
      commserver: "",
      timeout: 30,
    }),
  });
  if (!body.token) throw new Error("Login: kein token in der Antwort.");
  return { token: body.token, base };
}

async function logout(config, session) {
  await requestJson(config, joinUrl(session.base, "/Logout"), {
    method: "POST",
    headers: { Authtoken: session.token },
  }).catch((err) => config.logger?.warn(`Logout fehlgeschlagen (ignoriert): ${err.message}`));
}

function authHeaders(session) {
  return { Authtoken: session.token };
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

// Defensive Listen-Extraktion — für mehrere Commvault-Endpunkte ist der
// genaue Wrapper-Schlüssel aus der öffentlich abrufbaren Doku nicht
// zweifelsfrei hervorgegangen (siehe Datei-Kopfkommentar). Probiert mehrere
// plausible Schlüssel, fällt auf ein bereits flaches Array zurück, sonst
// leere Liste statt eines Absturzes.
function extractList(body, ...candidateKeys) {
  for (const key of candidateKeys) {
    if (Array.isArray(body?.[key])) return body[key];
  }
  if (Array.isArray(body)) return body;
  return [];
}

// --- CommCell-Stammdaten (Gerätename/Version) ---
// Kein einziger, aus abrufbarer Doku bestätigter Endpunkt gefunden — bester
// verfügbarer Kandidat GET /CommServ, mit mehreren Feldnamen-Kandidaten
// probiert. Liefert best-effort null statt den Lauf abzubrechen.
async function collectCommCellInfo(config, session, rawEndpoints) {
  const res = await fetchOptional(config, "CommCell-Info", requestJson(config, joinUrl(session.base, "/CommServ"), { headers: authHeaders(session) }));
  if (!res) return {};
  captureRaw(rawEndpoints, "/CommServ", res);
  const data = Array.isArray(res.body) ? res.body[0] : res.body;
  return {
    name: data?.commservName ?? data?.commCellName ?? data?.name ?? null,
    version: data?.version ?? data?.csVersionInfo ?? null,
  };
}

// --- Backup-Jobs ---
// GET /Job?jobCategory=Finished&completedJobLookupTime=<Sekunden> ist aus
// einer vollständig abrufbaren Doku-Seite bestätigt (Endpunkt, Query-
// Parameter, status-Feld je Job). 7 Tage Rückblick als bewusst
// konservatives Fenster (Backup-Jobs laufen i. d. R. täglich).
const JOB_LOOKBACK_SECONDS = 7 * 24 * 60 * 60;
const JOB_FAILURE_STATUSES = new Set(["Failed", "Killed", "Failed to Start"]);

async function collectJobMetrics(config, session, rawEndpoints) {
  const metrics = [];
  const res = await fetchOptional(
    config,
    "Job-Liste",
    requestJson(config, joinUrl(session.base, `/Job?jobCategory=Finished&completedJobLookupTime=${JOB_LOOKBACK_SECONDS}&limit=1000`), {
      headers: authHeaders(session),
    })
  );
  if (!res) return metrics;
  captureRaw(rawEndpoints, "/Job", res);
  const jobs = extractList(res.body, "jobs").map((j) => j.jobSummary ?? j);
  if (jobs.length === 0) return metrics;

  let completed = 0;
  let failed = 0;
  for (const j of jobs) {
    const status = String(j.status ?? "");
    if (status === "Completed") completed++;
    if (JOB_FAILURE_STATUSES.has(status)) failed++;
  }
  metrics.push({ key: "backup_jobs_failed", value: failed, unit: "count" });
  if (jobs.length > 0) {
    metrics.push({ key: "backup_success_rate", value: (completed / jobs.length) * 100, unit: "%" });
  }
  return metrics;
}

// --- Client-Bereitschaft ---
// GET /Client (Liste) ist aus abrufbarer Doku bestätigt (clientName/
// clientId/hostName), aber OHNE Status-/Bereitschaftsfeld — Bereitschaft
// ist ein separater, pro Client abzufragender Endpunkt
// (GET /ClientOperations/get-client-checkreadiness/{clientId}, ebenfalls
// aus abrufbarer Doku bestätigt). Da das ein Aufruf PRO Client ist, wird
// auf CLIENT_READINESS_LIMIT gedeckelt (analog LUN_LIMIT/CLIENTS_SCAN_LIMIT
// bei den Huawei-Adaptern) — bei mehr Clients werden nur die ersten
// geprüft, mit Log-Hinweis statt stillschweigend unvollständig zu bleiben.
const CLIENT_READINESS_LIMIT = 50;

function resolveClientNameId(raw) {
  const c = raw.client ?? raw.clientEntity ?? raw;
  const name = String(c.clientName ?? c.hostName ?? raw.clientName ?? "—");
  const id = c.clientId ?? raw.clientId;
  return { name, id };
}

async function collectClientMetrics(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  const listRes = await fetchOptional(config, "Client-Liste", requestJson(config, joinUrl(session.base, "/Client"), { headers: authHeaders(session) }));
  if (!listRes) return { metrics, componentFaults, componentChecks };
  captureRaw(rawEndpoints, "/Client", listRes);
  const rawClients = extractList(listRes.body, "clientProperties", "clients");
  const clients = rawClients.map(resolveClientNameId).filter((c) => c.id !== undefined && c.id !== null);
  if (clients.length === 0) return { metrics, componentFaults, componentChecks };

  const checked = clients.slice(0, CLIENT_READINESS_LIMIT);
  if (clients.length > CLIENT_READINESS_LIMIT) {
    config.logger?.warn(`Commvault: nur die ersten ${CLIENT_READINESS_LIMIT} von ${clients.length} Clients werden auf Bereitschaft geprüft.`);
  }

  let notReady = 0;
  await Promise.all(
    checked.map(async (c) => {
      const res = await fetchOptional(
        config,
        `Client-Bereitschaft (${c.name})`,
        requestJson(config, joinUrl(session.base, `/ClientOperations/get-client-checkreadiness/${c.id}`), { headers: authHeaders(session) })
      );
      if (!res) return; // Abruf fehlgeschlagen -> weder als bereit noch als nicht bereit gewertet
      const summary = extractList(res.body, "summary");
      // entityStatus (0 = erfolgreich) ist laut Doku das primäre Feld — nur
      // wenn es fehlt/kein gültiger Zahlenwert ist, wird auf den status-Text
      // zurückgefallen. Wichtig: /^ready/ statt /ready/, sonst matcht der
      // Regex fälschlich auch "Not Ready." (enthält "Ready" als Teilstring).
      const ready =
        summary.length === 0 ||
        summary.every((s) => {
          const entityStatus = Number(s.entityStatus);
          if (Number.isFinite(entityStatus)) return entityStatus === 0;
          return /^ready/i.test(String(s.status ?? "").trim());
        });
      componentChecks.push({ category: "Client", id: c.name, description: ready ? "Bereit" : "Nicht bereit", ok: ready });
      if (!ready) {
        notReady++;
        componentFaults.push({ category: "Client", id: c.name, description: "Nicht bereit (Check-Readiness fehlgeschlagen)" });
      }
    })
  );
  metrics.push({ key: "clients_not_ready", value: notReady, unit: "count" });
  return { metrics, componentFaults, componentChecks };
}

// --- SLA-Compliance + Lizenz-Ablauf ---
// Beide Endpunkt-Pfade sind über mehrere unabhängige Doku-Seiten/Quellen
// belegt, das jeweilige Antwortschema konnte aus der öffentlich abrufbaren
// Doku NICHT bestätigt werden (nur Beschreibungstext + Beispiel-Feldnamen
// aus Suchergebnis-Snippets). Wird defensiv geparst — bei abweichendem
// Schema bleibt die betroffene Kennzahl einfach weg, kein Absturz.
async function collectSlaAndLicense(config, session, rawEndpoints) {
  const metrics = [];

  const slaRes = await fetchOptional(
    config,
    "SLA-Compliance",
    requestJson(config, joinUrl(session.base, "/api/cv/DashboardOperations/get-commcellsladetails"), { headers: authHeaders(session) })
  );
  if (slaRes) {
    captureRaw(rawEndpoints, "/api/cv/DashboardOperations/get-commcellsladetails", slaRes);
    try {
      const buckets = extractList(slaRes.body, "slaList", "CurrentCount", "list");
      let met = 0;
      let missed = 0;
      for (const b of buckets) {
        const status = String(b.SLAStatus ?? b.status ?? "").toLowerCase();
        const count = Number(b.count ?? b.CurrentCount ?? b.value ?? 0);
        if (!Number.isFinite(count)) continue;
        if (status.includes("met")) met += count;
        else if (status.includes("missed")) missed += count;
      }
      if (met + missed > 0) {
        metrics.push({ key: "sla_compliance_rate", value: (met / (met + missed)) * 100, unit: "%" });
      }
    } catch (err) {
      config.logger?.warn(`Commvault: SLA-Compliance-Antwort hatte unerwartetes Format (übersprungen): ${err.message}`);
    }
  }

  // Lizenz-Ablauf: expiryDate-Einheit unklar (Sekunden vs. Millisekunden) —
  // dieselbe >1e12-Heuristik wie an anderer Stelle in diesem Codebase
  // (siehe oceanprotect.js, retention_time-Auswertung). 30 Tage Vorlauf wie
  // beim bestehenden EXPIRY_WARNING_DAYS-Muster (oceanstor.js).
  const EXPIRY_WARNING_DAYS = 30;
  const licenseRes = await fetchOptional(
    config,
    "Lizenzinfo",
    requestJson(config, joinUrl(session.base, "/api/cv/OpenAPI3/get-license-info"), { headers: authHeaders(session) })
  );
  if (licenseRes) {
    captureRaw(rawEndpoints, "/api/cv/OpenAPI3/get-license-info", licenseRes);
    const expiry = Number(licenseRes.body?.expiryDate);
    if (Number.isFinite(expiry) && expiry > 0) {
      const expiryMs = expiry > 1e12 ? expiry : expiry * 1000;
      const daysUntil = Math.floor((expiryMs - Date.now()) / (1000 * 60 * 60 * 24));
      metrics.push({ key: "license_expiring_soon", value: daysUntil <= EXPIRY_WARNING_DAYS ? 1 : 0, unit: "count" });
    }
  }

  return metrics;
}

// --- Storage-Kapazität + MediaAgent-Status + Ereignisse ---
async function collectStorageMediaAndEvents(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  // Storage-Pool-Kapazität: Endpunkt-Titel mehrfach belegt, Feldschema nur
  // aus Suchergebnis-Snippets (totalFreeSpace/totalCapacity, vermutlich
  // Byte) — nicht gegen eine echte Antwort verifiziert.
  const storageRes = await fetchOptional(
    config,
    "Storage-Pool-Details",
    requestJson(config, joinUrl(session.base, "/StoragePool"), { headers: authHeaders(session) })
  );
  if (storageRes) {
    captureRaw(rawEndpoints, "/StoragePool", storageRes);
    const pools = extractList(storageRes.body, "storagePoolList", "storagePools");
    let totalBytes = 0;
    let freeBytes = 0;
    for (const p of pools) {
      const total = Number(p.totalCapacity);
      const free = Number(p.totalFreeSpace);
      if (Number.isFinite(total)) totalBytes += total;
      if (Number.isFinite(free)) freeBytes += free;
    }
    if (totalBytes > 0) {
      metrics.push({ key: "storage_total_tb", value: totalBytes / 1024 ** 4, unit: "TB" });
      metrics.push({ key: "storage_used_tb", value: (totalBytes - freeBytes) / 1024 ** 4, unit: "TB" });
    }
  }

  // MediaAgent-Status: Endpunkt/Felder AUSSCHLIESSLICH aus einem Commvault-
  // Community-Forenpost belegt (nicht aus der offiziellen Doku) — laut
  // dortigem Autor selbst von Commvault Support, nicht öffentlich
  // dokumentiert. Mit Abstand die unsicherste Quelle in dieser Datei.
  const mediaAgentRes = await fetchOptional(
    config,
    "MediaAgent-Status",
    requestJson(config, joinUrl(session.base, "/V2/MediaAgents"), { headers: authHeaders(session) })
  );
  if (mediaAgentRes) {
    captureRaw(rawEndpoints, "/V2/MediaAgents", mediaAgentRes);
    const agents = extractList(mediaAgentRes.body, "mediaAgentList", "mediaAgents");
    if (agents.length > 0) {
      let down = 0;
      for (const a of agents) {
        const name = String(a.name ?? a.mediaAgentName ?? "—");
        const offlineReason = Number(a.offlineReason);
        const ok = !Number.isFinite(offlineReason) || offlineReason === 0;
        componentChecks.push({ category: "MediaAgent", id: name, description: ok ? "Online" : `Offline (Code ${offlineReason})`, ok });
        if (!ok) {
          down++;
          componentFaults.push({ category: "MediaAgent", id: name, description: `Offline (Code ${offlineReason})` });
        }
      }
      metrics.push({ key: "media_agents_down", value: down, unit: "count" });
    }
  }

  // Ereignisse/Alarme: Pfad/Feldschema nur aus Suchergebnis-Snippet belegt
  // (severity: Information/Minor/Major/Critical als benannte Stufen).
  const eventsRes = await fetchOptional(config, "Ereignisse", requestJson(config, joinUrl(session.base, "/Events"), { headers: authHeaders(session) }));
  if (eventsRes) {
    captureRaw(rawEndpoints, "/Events", eventsRes);
    const events = extractList(eventsRes.body, "commservEvents", "events");
    const counts = { critical: 0, major: 0, minor: 0 };
    for (const e of events) {
      const severity = String(e.severity ?? "").toLowerCase();
      if (severity.includes("critical")) counts.critical++;
      else if (severity.includes("major")) counts.major++;
      else if (severity.includes("minor")) counts.minor++;
    }
    metrics.push({ key: "alerts_critical", value: counts.critical, unit: "count" });
    metrics.push({ key: "alerts_major", value: counts.major, unit: "count" });
    metrics.push({ key: "alerts_minor", value: counts.minor, unit: "count" });
  }

  return { metrics, componentFaults, componentChecks };
}

async function collect(config) {
  const cv = config.commvault ?? {};
  const required = ["baseUrl", "username", "password"];
  const missing = required.filter((k) => !cv[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/commvault.js: config.commvault fehlt: ${missing.join(", ")}`);
  }

  const session = await login(config);
  try {
    const rawEndpoints = {};
    const [commCellInfo, jobResult, clientResult, slaLicenseResult, storageResult] = await Promise.allSettled([
      collectCommCellInfo(config, session, rawEndpoints),
      collectJobMetrics(config, session, rawEndpoints),
      collectClientMetrics(config, session, rawEndpoints),
      collectSlaAndLicense(config, session, rawEndpoints),
      collectStorageMediaAndEvents(config, session, rawEndpoints),
    ]);

    const metrics = [];
    let deviceInfo = {};
    const componentFaults = [];
    const componentChecks = [];

    if (commCellInfo.status === "fulfilled") deviceInfo = commCellInfo.value;
    else config.logger?.warn(`Commvault: CommCell-Info konnte nicht erhoben werden: ${commCellInfo.reason.message}`);

    if (jobResult.status === "fulfilled") metrics.push(...jobResult.value);
    else config.logger?.warn(`Commvault: Job-Kennzahlen konnten nicht erhoben werden: ${jobResult.reason.message}`);

    if (clientResult.status === "fulfilled") {
      metrics.push(...clientResult.value.metrics);
      componentFaults.push(...clientResult.value.componentFaults);
      componentChecks.push(...clientResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: Client-Kennzahlen konnten nicht erhoben werden: ${clientResult.reason.message}`);
    }

    if (slaLicenseResult.status === "fulfilled") metrics.push(...slaLicenseResult.value);
    else config.logger?.warn(`Commvault: SLA-/Lizenz-Kennzahlen konnten nicht erhoben werden: ${slaLicenseResult.reason.message}`);

    if (storageResult.status === "fulfilled") {
      metrics.push(...storageResult.value.metrics);
      componentFaults.push(...storageResult.value.componentFaults);
      componentChecks.push(...storageResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: Storage-/MediaAgent-/Ereignis-Kennzahlen konnten nicht erhoben werden: ${storageResult.reason.message}`);
    }

    if (metrics.length === 0) {
      throw new Error("Keine Kennzahlen konnten erhoben werden — siehe Warnungen oben.");
    }

    const meta = {};
    if (deviceInfo.name) meta.deviceName = deviceInfo.name;
    if (deviceInfo.version) meta.deviceSoftwareVersion = deviceInfo.version;
    if (componentFaults.length > 0) meta.componentFaults = componentFaults;
    if (componentChecks.length > 0) meta.componentChecks = componentChecks;
    if (Object.keys(rawEndpoints).length > 0) meta.rawEndpoints = rawEndpoints;

    return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
  } finally {
    await logout(config, session);
  }
}

module.exports = { collect };
