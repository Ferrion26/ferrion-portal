// Adapter für Commvault (Backup-Software): liest Job-/Client-/Storage-/
// Infrastruktur-/Lizenz-/Ereignis-Status über die Commvault-REST-API aus.
//
// Quelle: Commvaults öffentliche REST-API-Doku (documentation.commvault.com/
// api.commvault.com) sowie — als zusätzliche, code-basierte Referenz —
// Commvaults offizieller Python-SDK-Quellcode (github.com/Commvault/
// cvpysdk, öffentlich, parst dieselbe REST-API) — online recherchiert, wie
// beim NetApp-/FusionCompute-Adapter, NICHT an einem realen CommCell
// verifiziert. Unterschiedlich gut belegt je Bereich:
//   - Login, Client-/Job-Liste, Storage-Pool-Kapazität+Status (GET
//     /StoragePool), Index-Server-Liste (GET /IndexServers), Storage-
//     Policy-Liste (GET /StoragePolicy), umfassender Client-Netzwerkstatus
//     (GET /V4/Servers): aus vollständig abrufbaren Doku-Seiten MIT
//     Beispiel-Antwort bestätigt (Endpunkt, Methode, Feldnamen).
//   - CommCell-Stammdaten, SLA-Compliance, Lizenz-Ablauf, Ereignisse,
//     Library-Inventar (GET /Library): nur aus Suchergebnis-Snippets bzw.
//     cvpysdk-Quellcode belegt, NICHT aus einer abrufbaren Doku-Seite mit
//     Beispiel-Antwort.
//   - MediaAgent-Status (GET /V2/MediaAgents), Tape-Bibliotheken (GET
//     /V4/Storage/Tape): am unsichersten — MediaAgent ausschließlich aus
//     einem Commvault-Community-Forenpost belegt (laut Autor selbst von
//     Commvault Support, nicht öffentlich dokumentiert), Tape-Endpunkt-
//     Existenz zwar über SDK+Forenpost bestätigt, aber nirgends ein
//     abrufbares Antwortschema gefunden.
//   Alle Bereiche mit unsicherem Schema sind bewusst besonders defensiv
//   geschrieben (mehrere Feldnamen-Kandidaten, try/catch um die
//   Feld-Interpretation) — ein falsches Schema führt bestenfalls dazu,
//   dass die jeweilige Kennzahl fehlt, nie zum Abbruch des Laufs. Beim
//   ersten echten Ingest bitte meta.rawEndpoints im Admin-Bereich prüfen
//   und diese Datei bei Abweichungen anpassen (wie bereits bei
//   netapp.js/fusioncompute.js praktiziert).
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

// --- Software-Lebenszyklus (End-of-Life) ---
// Quelle: https://documentation.commvault.com/11.42/software/deprecated_releases.html
// (Major.Minor -> End-of-Life-Datum). WICHTIG: automatisiert abgerufen und
// NICHT Zeile für Zeile manuell gegen die Live-Seite nachgeprüft — bei
// Zweifel die Seite direkt konsultieren und diese Tabelle aktualisieren.
// Nur Major.Minor-Granularität, wie auf der Quellseite selbst (kein
// Patch-Level). Ein Versionsfeld ist bestätigt vorhanden bei CommServe
// (/CommServ) und Clients (/V4/Servers) — bei MediaAgent/Index Server ist
// laut Doku/SDK kein Versionsfeld auffindbar, dafür gibt es bewusst keinen
// Lebenszyklus-Check (kein Feld erfunden).
const COMMVAULT_EOL_TABLE = {
  "11.20": "2025-06-15",
  "11.24": "2024-06-15",
  "11.25": "2022-09-15",
  "11.26": "2022-12-15",
  "11.28": "2025-06-15",
  "11.30": "2023-12-15",
  "11.32": "2026-06-15",
  "11.34": "2024-12-15",
};

// Gibt null zurück, wenn keine Version bekannt ist (kein Check möglich),
// sonst { majorMinor, status, eolDate? }. status "unknown" (Version nicht
// in der Tabelle) wird von den Aufrufern NIE als Fehler gewertet — nur
// "eol" (Version steht in der Tabelle und das Datum liegt in der
// Vergangenheit) gilt als Fehlstatus.
function evaluateLifecycle(versionString) {
  if (!versionString) return null;
  const match = String(versionString).match(/(\d+\.\d+)/);
  if (!match) return null;
  const majorMinor = match[1];
  const eolDate = COMMVAULT_EOL_TABLE[majorMinor];
  if (!eolDate) return { majorMinor, status: "unknown" };
  const isEol = new Date(eolDate).getTime() < Date.now();
  return { majorMinor, status: isEol ? "eol" : "supported", eolDate };
}

// --- CommCell-Stammdaten (Gerätename/Version) + CommServe-Lebenszyklus ---
// Kein einziger, aus abrufbarer Doku bestätigter Endpunkt gefunden — bester
// verfügbarer Kandidat GET /CommServ, mit mehreren Feldnamen-Kandidaten
// probiert. Liefert best-effort null statt den Lauf abzubrechen. Die
// ermittelte Version wird zusätzlich gegen COMMVAULT_EOL_TABLE geprüft
// (immer genau ein componentChecks-Eintrag, da es nur eine CommServe-
// Instanz gibt — kein Mengen-Risiko wie bei vielen Clients).
async function collectCommCellInfo(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  const res = await fetchOptional(config, "CommCell-Info", requestJson(config, joinUrl(session.base, "/CommServ"), { headers: authHeaders(session) }));
  if (!res) return { name: null, version: null, metrics, componentFaults, componentChecks };
  captureRaw(rawEndpoints, "/CommServ", res);
  const data = Array.isArray(res.body) ? res.body[0] : res.body;
  const name = data?.commservName ?? data?.commCellName ?? data?.name ?? null;
  const version = data?.version ?? data?.csVersionInfo ?? null;

  const lifecycle = evaluateLifecycle(version);
  if (lifecycle) {
    const description =
      lifecycle.status === "eol"
        ? `Version ${lifecycle.majorMinor} — End-of-Life seit ${lifecycle.eolDate}`
        : lifecycle.status === "unknown"
          ? `Version ${lifecycle.majorMinor} — nicht in der Lebenszyklus-Tabelle gefunden`
          : `Version ${lifecycle.majorMinor} — unterstützt`;
    componentChecks.push({ category: "Software-Lebenszyklus", id: "CommServe", description, ok: lifecycle.status !== "eol" });
    if (lifecycle.status === "eol") {
      componentFaults.push({ category: "Software-Lebenszyklus", id: "CommServe", description });
    }
    metrics.push({ key: "commserve_outdated", value: lifecycle.status === "eol" ? 1 : 0, unit: "count" });
  }

  return { name, version, metrics, componentFaults, componentChecks };
}

// --- Backup-Jobs + Disaster-Recovery-Backup-Jobs ---
// GET /Job?jobCategory=Finished&completedJobLookupTime=<Sekunden> ist aus
// einer vollständig abrufbaren Doku-Seite bestätigt (Endpunkt, Query-
// Parameter, status-Feld je Job). 7 Tage Rückblick als bewusst
// konservatives Fenster (Backup-Jobs laufen i. d. R. täglich).
//
// &hideAdminJobs=false ist zusätzlich nötig, damit CommServe-interne Jobs
// (u. a. das Disaster-Recovery-Backup, jobType "CS DR Backup") überhaupt
// in der Antwort erscheinen — ohne dieses Flag werden sie laut einem
// Commvault-Community-Post seit Version 11.28 unterdrückt (über den
// hideAdminJobs-Feldnamen im offiziellen SDK-Quellcode zusätzlich
// bestätigt). Da dadurch auch ANDERE CommServe-interne Jobtypen auftauchen
// könnten, werden alle jobType-Werte, die mit "CS " beginnen, bewusst aus
// der regulären Erfolgsquote ausgeschlossen (nicht nur der DR-Backup-Typ)
// — sonst würde die reguläre Erfolgsquote durch interne Admin-Jobs verwässert.
const JOB_LOOKBACK_SECONDS = 7 * 24 * 60 * 60;
const JOB_FAILURE_STATUSES = new Set(["Failed", "Killed", "Failed to Start"]);
const DR_BACKUP_JOB_TYPE = "CS DR Backup";

async function collectJobMetrics(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  const res = await fetchOptional(
    config,
    "Job-Liste",
    requestJson(
      config,
      joinUrl(session.base, `/Job?jobCategory=Finished&completedJobLookupTime=${JOB_LOOKBACK_SECONDS}&limit=1000&hideAdminJobs=false`),
      { headers: authHeaders(session) }
    )
  );
  if (!res) return { metrics, componentFaults, componentChecks };
  captureRaw(rawEndpoints, "/Job", res);
  const allJobs = extractList(res.body, "jobs").map((j) => j.jobSummary ?? j);
  if (allJobs.length === 0) return { metrics, componentFaults, componentChecks };

  const regularJobs = allJobs.filter((j) => !String(j.jobType ?? "").startsWith("CS "));
  const drJobs = allJobs.filter((j) => String(j.jobType ?? "") === DR_BACKUP_JOB_TYPE);

  let completed = 0;
  let failed = 0;
  for (const j of regularJobs) {
    const status = String(j.status ?? "");
    if (status === "Completed") completed++;
    if (JOB_FAILURE_STATUSES.has(status)) failed++;
  }
  metrics.push({ key: "backup_jobs_failed", value: failed, unit: "count" });
  if (regularJobs.length > 0) {
    metrics.push({ key: "backup_success_rate", value: (completed / regularJobs.length) * 100, unit: "%" });
  }

  if (drJobs.length > 0) {
    const failedDr = drJobs.filter((j) => JOB_FAILURE_STATUSES.has(String(j.status ?? ""))).length;
    metrics.push({ key: "dr_backup_jobs_failed", value: failedDr, unit: "count" });

    // Jobs sind laut Doku üblicherweise zeitlich absteigend sortiert, zur
    // Sicherheit wird trotzdem explizit nach jobStartTime sortiert.
    const latest = [...drJobs].sort((a, b) => Number(b.jobStartTime ?? 0) - Number(a.jobStartTime ?? 0))[0];
    const latestOk = String(latest.status ?? "") === "Completed";
    componentChecks.push({ category: "Disaster Recovery", id: "Letztes DR-Backup", description: latest.status ?? "unbekannt", ok: latestOk });
    if (!latestOk) {
      componentFaults.push({ category: "Disaster Recovery", id: "Letztes DR-Backup", description: latest.status ?? "unbekannt" });
    }
  }

  return { metrics, componentFaults, componentChecks };
}

// --- Client-Netzwerkstatus (ALLE Clients, ein einziger Aufruf) ---
// GET /V4/Servers?showOnlyInfrastructureMachines=0 ist aus einer
// vollständig abrufbaren Doku-Seite MIT Beispiel-Antwort bestätigt —
// liefert in einem einzigen Aufruf jeden Client (nicht nur Infrastruktur-
// Rollen) inkl. networkReadiness-Feld (ONLINE/OFFLINE/UNKNOWN/
// NOT_APPLICABLE). Ersetzt die ursprüngliche, auf 50 Clients gedeckelte
// Pro-Client-Bereitschaftsprüfung (GET .../get-client-checkreadiness)
// vollständig — die ist sowohl teurer (ein Aufruf je Client) als auch
// zwangsläufig unvollständig bei mehr als 50 Clients. OFFLINE/UNKNOWN
// gelten als Fehlstatus, NOT_APPLICABLE (Client-Typen ohne eigenes
// Netzwerk-Konzept, z. B. reine Konfigurationsobjekte) nicht.
async function collectClientMetrics(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  const res = await fetchOptional(
    config,
    "Client-Netzwerkstatus",
    requestJson(config, joinUrl(session.base, "/V4/Servers?showOnlyInfrastructureMachines=0"), { headers: authHeaders(session) })
  );
  if (!res) return { metrics, componentFaults, componentChecks };
  captureRaw(rawEndpoints, "/V4/Servers", res);
  const servers = extractList(res.body, "servers");
  if (servers.length === 0) return { metrics, componentFaults, componentChecks };

  let notReady = 0;
  let outdated = 0;
  for (const s of servers) {
    const name = String(s.name ?? s.displayName ?? s.hostName ?? "—");
    const readiness = String(s.networkReadiness ?? "").toUpperCase();
    if (readiness !== "NOT_APPLICABLE") {
      // kein Netzwerk-Konzept für diesen Client-Typ, weder ok noch Fehler
      const ok = readiness === "ONLINE";
      componentChecks.push({ category: "Client", id: name, description: readiness || "Unbekannt", ok });
      if (!ok) {
        notReady++;
        componentFaults.push({ category: "Client", id: name, description: `Netzwerkstatus: ${readiness || "unbekannt"}` });
      }
    }

    // Software-Lebenszyklus je Client: version-Feld laut Beispiel-Antwort
    // von GET /V4/Servers bestätigt (z. B. "11.22.5"). Anders als bei der
    // Bereitschaftsprüfung oben wird HIER bewusst NUR bei tatsächlich
    // veralteten Clients ein componentChecks-/componentFaults-Eintrag
    // erzeugt (nicht für jeden Client) — sonst würde das componentChecks-
    // Limit (300 je Ingest, siehe ingestSchema.ts) bei vielen Clients real
    // gesprengt, da die Bereitschaftsprüfung oben bereits ungedeckelt
    // einen Eintrag je Client erzeugt.
    const lifecycle = evaluateLifecycle(s.version);
    if (lifecycle?.status === "eol") {
      outdated++;
      const description = `Version ${lifecycle.majorMinor} — End-of-Life seit ${lifecycle.eolDate}`;
      componentChecks.push({ category: "Software-Lebenszyklus", id: name, description, ok: false });
      componentFaults.push({ category: "Software-Lebenszyklus", id: name, description });
    }
  }
  metrics.push({ key: "clients_not_ready", value: notReady, unit: "count" });
  metrics.push({ key: "clients_outdated", value: outdated, unit: "count" });
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
  const componentFaults = [];
  const componentChecks = [];

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
  // beim bestehenden EXPIRY_WARNING_DAYS-Muster (oceanstor.js). Zusätzlich
  // zur reinen Ja/Nein-Kennzahl wird das konkrete Ablaufdatum jetzt auch
  // als componentChecks-Eintrag ausgegeben (immer sichtbar im Bericht,
  // nicht nur wenn die Frist bereits läuft) — kein Mengen-Risiko, da es
  // nur eine Lizenz je CommCell gibt.
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
      const expiryDateStr = new Date(expiryMs).toISOString().slice(0, 10);
      const expiringSoon = daysUntil <= EXPIRY_WARNING_DAYS;
      metrics.push({ key: "license_expiring_soon", value: expiringSoon ? 1 : 0, unit: "count" });

      const description =
        daysUntil < 0
          ? `Abgelaufen am ${expiryDateStr} (vor ${Math.abs(daysUntil)} Tagen)`
          : `Läuft ab am ${expiryDateStr} (in ${daysUntil} Tagen)`;
      componentChecks.push({ category: "Lizenz", id: "Commvault-Lizenz", description, ok: !expiringSoon });
      if (expiringSoon) {
        componentFaults.push({ category: "Lizenz", id: "Commvault-Lizenz", description });
      }
    }
  }

  return { metrics, componentFaults, componentChecks };
}

// --- Storage-Kapazität + MediaAgent-Status + Ereignisse ---
async function collectStorageMediaAndEvents(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  // Storage-Pool-Kapazität + Status: GET /StoragePool ist aus einer
  // vollständig abrufbaren Doku-Seite MIT Beispiel-Antwort bestätigt —
  // storagePoolList[] mit totalCapacity/totalFreeSpace (Byte) sowie einem
  // status/statusCode-Feldpaar je Pool (Beispiel: status="Online",
  // statusCode=0).
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
    let unhealthy = 0;
    for (const p of pools) {
      const total = Number(p.totalCapacity);
      const free = Number(p.totalFreeSpace);
      if (Number.isFinite(total)) totalBytes += total;
      if (Number.isFinite(free)) freeBytes += free;

      const name = String(p.storagePoolEntity?.storagePoolName ?? p.name ?? "—");
      const statusCode = Number(p.statusCode);
      const ok = Number.isFinite(statusCode) ? statusCode === 0 : String(p.status ?? "").toLowerCase() === "online";
      componentChecks.push({ category: "Storage Pool", id: name, description: p.status ?? "unbekannt", ok });
      if (!ok) {
        unhealthy++;
        componentFaults.push({ category: "Storage Pool", id: name, description: p.status ?? "unbekannt" });
      }
    }
    if (pools.length > 0) {
      metrics.push({ key: "storage_pools_unhealthy", value: unhealthy, unit: "count" });
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

// --- Infrastruktur-Inventar: Index Server, Libraries, Tape, Storage Policies ---
// Vier voneinander unabhängige, je einzeln fetchOptional-geschützte
// Teilschritte — ein fehlender/falsch geformter Endpunkt lässt nur diesen
// einen Teil weg, nie den ganzen Zweig abstürzen.
async function collectInfrastructureInventory(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  // Index Server: GET /IndexServers ist aus einer abrufbaren Doku-Seite
  // bestätigt (Name/OS/Cloud-Zuordnung), enthält aber laut derselben Doku
  // KEIN Status- oder Kapazitätsfeld — das ist im Command Center nur über
  // die UI sichtbar, nicht über die REST-API. Wird deshalb bewusst als
  // reines Inventar (immer ok: true) statt als erfundener Gut/Schlecht-
  // Check umgesetzt.
  const indexServerRes = await fetchOptional(
    config,
    "Index-Server-Liste",
    requestJson(config, joinUrl(session.base, "/IndexServers"), { headers: authHeaders(session) })
  );
  if (indexServerRes) {
    captureRaw(rawEndpoints, "/IndexServers", indexServerRes);
    const servers = extractList(indexServerRes.body, "indexServers");
    if (servers.length > 0) {
      for (const s of servers) {
        const name = String(s.name ?? s.displayName ?? "—");
        const os = s.OS ? ` (${s.OS})` : "";
        componentChecks.push({ category: "Index Server", id: name, description: `Inventar${os} — kein Status über REST-API verfügbar`, ok: true });
      }
      metrics.push({ key: "index_servers_count", value: servers.length, unit: "count" });
    }
  }

  // Libraries (Disk/Tape/Cloud): GET /Library ist als Endpunkt über
  // Commvaults SDK-Quellcode bestätigt, liefert dort aber nur Name/ID
  // zuverlässig — libraryType (Typ-Unterscheidung) nur aus
  // Suchergebnis-Snippets belegt. Reines Best-Effort-Inventar (immer
  // ok: true, kein bestätigtes Status-Feld) — Kapazität/Status für
  // Disk-Libraries kommt stattdessen aus dem besser belegten
  // GET /StoragePool oben.
  const LIBRARY_TYPE_LABELS = { 0: "Disk", 1: "Tape", 2: "Cloud" };
  const libraryRes = await fetchOptional(
    config,
    "Library-Liste",
    requestJson(config, joinUrl(session.base, "/Library"), { headers: authHeaders(session) })
  );
  if (libraryRes) {
    captureRaw(rawEndpoints, "/Library", libraryRes);
    const libraries = extractList(libraryRes.body, "libraryList", "response");
    for (const l of libraries) {
      const entity = l.library ?? l.libraryEntity ?? l;
      const name = String(entity.libraryName ?? entity.name ?? "—");
      const type = LIBRARY_TYPE_LABELS[Number(l.libraryType)] ?? "Unbekannt";
      componentChecks.push({ category: "Library", id: name, description: `Typ: ${type} — Inventar, kein bestätigtes Status-Feld`, ok: true });
    }
  }

  // Tape-Bibliotheken: GET /V4/Storage/Tape ist als Endpunkt über
  // Commvaults SDK-Quellcode + einen Community-Forenpost belegt, aber
  // NIRGENDS ein abrufbares Antwortschema gefunden — mit Abstand die
  // unsicherste Quelle in dieser Datei. Mehrere Feldnamen-Kandidaten +
  // try/catch, damit ein falsches Schema die Kennzahl nur weglässt statt
  // den Lauf abzubrechen.
  const tapeRes = await fetchOptional(
    config,
    "Tape-Bibliotheken",
    requestJson(config, joinUrl(session.base, "/V4/Storage/Tape"), { headers: authHeaders(session) })
  );
  if (tapeRes) {
    captureRaw(rawEndpoints, "/V4/Storage/Tape", tapeRes);
    try {
      const tapeLibraries = extractList(tapeRes.body, "tapeLibraryList", "libraries", "tapeLibraries");
      if (tapeLibraries.length > 0) {
        let unhealthy = 0;
        for (const t of tapeLibraries) {
          const name = String(t.name ?? t.libraryName ?? "—");
          const status = String(t.status ?? t.state ?? "").toLowerCase();
          // Ohne bestätigtes Schema wird nur bei einem erkennbaren
          // "offline"/"error"/"disabled"-Text als Fehler gewertet — ein
          // unbekannter/leerer Status gilt bewusst NICHT als Fehler (sonst
          // würde ein falsches Feld beim ersten echten Ingest sofort
          // fälschlich Alarm schlagen).
          const faulty = /offline|error|disabled|fault/.test(status);
          componentChecks.push({ category: "Tape-Bibliothek", id: name, description: t.status ?? t.state ?? "unbekannt", ok: !faulty });
          if (faulty) {
            unhealthy++;
            componentFaults.push({ category: "Tape-Bibliothek", id: name, description: t.status ?? t.state ?? "unbekannt" });
          }
        }
        metrics.push({ key: "tape_libraries_unhealthy", value: unhealthy, unit: "count" });
      }
    } catch (err) {
      config.logger?.warn(`Commvault: Tape-Bibliotheks-Antwort hatte unerwartetes Format (übersprungen): ${err.message}`);
    }
  }

  // Storage Policies: GET /StoragePolicy ist aus einer abrufbaren Doku-
  // Seite MIT Beispiel-Antwort UND Commvaults SDK-Quellcode bestätigt —
  // liefert Name/ID/Stream-/Kopienzahl, aber KEIN Status-/Health-Feld
  // (reine Konfigurationsobjekte). Wird als Inventarliste umgesetzt
  // (immer ok: true), nicht als Gut/Schlecht-Check.
  const policyRes = await fetchOptional(
    config,
    "Storage-Policy-Liste",
    requestJson(config, joinUrl(session.base, "/StoragePolicy"), { headers: authHeaders(session) })
  );
  if (policyRes) {
    captureRaw(rawEndpoints, "/StoragePolicy", policyRes);
    const policies = extractList(policyRes.body, "policies");
    if (policies.length > 0) {
      for (const p of policies) {
        const name = String(p.storagePolicy?.storagePolicyName ?? p.name ?? "—");
        const streams = p.numberOfStreams !== undefined ? `${p.numberOfStreams} Streams` : null;
        const copies = p.numberOfCopies !== undefined ? `${p.numberOfCopies} Kopien` : null;
        const description = [copies, streams].filter(Boolean).join(", ") || "Inventar";
        componentChecks.push({ category: "Storage Policy", id: name, description, ok: true });
      }
      metrics.push({ key: "storage_policies_count", value: policies.length, unit: "count" });
    }
  }

  return { metrics, componentFaults, componentChecks };
}

// --- Disaster-Recovery-Backup-Konfiguration ---
// GET /Commcell/DRBackup/Options ist über drei unabhängige Quellen belegt
// (Doku-Snippet, abrufbare Beispiel-Antwort auf api.commvault.com, sowie
// Commvaults offener Python-SDK-Quellcode) — liefert Ziel-Pfad
// (DRDumpLocation), Aufbewahrung (DRNumFulls) und Zeitplan (pattern). Ohne
// konfiguriertes Ziel ist im Ernstfall keine CommServe-Wiederherstellung
// möglich — daher severeIfNonZero.
async function collectDisasterRecoveryConfig(config, session, rawEndpoints) {
  const metrics = [];
  const componentFaults = [];
  const componentChecks = [];

  const res = await fetchOptional(
    config,
    "DR-Backup-Konfiguration",
    requestJson(config, joinUrl(session.base, "/Commcell/DRBackup/Options"), { headers: authHeaders(session) })
  );
  if (!res) return { metrics, componentFaults, componentChecks };
  captureRaw(rawEndpoints, "/Commcell/DRBackup/Options", res);

  const props = res.body?.properties ?? res.body;
  const destination = props?.DRDumpLocation || (props?.uploadBackupMetadataToCloud ? props?.cloudLibrary?.libraryName : null);
  const configured = Boolean(destination);
  const retention = Number(props?.DRNumFulls);
  const description = configured
    ? `Ziel: ${destination}${Number.isFinite(retention) ? `, Aufbewahrung: ${retention} Sicherungen` : ""}`
    : "Kein Ziel konfiguriert";

  componentChecks.push({ category: "Disaster Recovery", id: "DR-Backup-Konfiguration", description, ok: configured });
  if (!configured) {
    componentFaults.push({ category: "Disaster Recovery", id: "DR-Backup-Konfiguration", description: "Kein DR-Backup-Ziel konfiguriert" });
  }
  metrics.push({ key: "dr_backup_not_configured", value: configured ? 0 : 1, unit: "count" });

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
    const [commCellInfo, jobResult, clientResult, slaLicenseResult, storageResult, infrastructureResult, drConfigResult] = await Promise.allSettled([
      collectCommCellInfo(config, session, rawEndpoints),
      collectJobMetrics(config, session, rawEndpoints),
      collectClientMetrics(config, session, rawEndpoints),
      collectSlaAndLicense(config, session, rawEndpoints),
      collectStorageMediaAndEvents(config, session, rawEndpoints),
      collectInfrastructureInventory(config, session, rawEndpoints),
      collectDisasterRecoveryConfig(config, session, rawEndpoints),
    ]);

    const metrics = [];
    let deviceInfo = {};
    const componentFaults = [];
    const componentChecks = [];

    if (commCellInfo.status === "fulfilled") {
      deviceInfo = commCellInfo.value;
      metrics.push(...commCellInfo.value.metrics);
      componentFaults.push(...commCellInfo.value.componentFaults);
      componentChecks.push(...commCellInfo.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: CommCell-Info konnte nicht erhoben werden: ${commCellInfo.reason.message}`);
    }

    if (jobResult.status === "fulfilled") {
      metrics.push(...jobResult.value.metrics);
      componentFaults.push(...jobResult.value.componentFaults);
      componentChecks.push(...jobResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: Job-Kennzahlen konnten nicht erhoben werden: ${jobResult.reason.message}`);
    }

    if (clientResult.status === "fulfilled") {
      metrics.push(...clientResult.value.metrics);
      componentFaults.push(...clientResult.value.componentFaults);
      componentChecks.push(...clientResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: Client-Kennzahlen konnten nicht erhoben werden: ${clientResult.reason.message}`);
    }

    if (slaLicenseResult.status === "fulfilled") {
      metrics.push(...slaLicenseResult.value.metrics);
      componentFaults.push(...slaLicenseResult.value.componentFaults);
      componentChecks.push(...slaLicenseResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: SLA-/Lizenz-Kennzahlen konnten nicht erhoben werden: ${slaLicenseResult.reason.message}`);
    }

    if (storageResult.status === "fulfilled") {
      metrics.push(...storageResult.value.metrics);
      componentFaults.push(...storageResult.value.componentFaults);
      componentChecks.push(...storageResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: Storage-/MediaAgent-/Ereignis-Kennzahlen konnten nicht erhoben werden: ${storageResult.reason.message}`);
    }

    if (infrastructureResult.status === "fulfilled") {
      metrics.push(...infrastructureResult.value.metrics);
      componentFaults.push(...infrastructureResult.value.componentFaults);
      componentChecks.push(...infrastructureResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: Infrastruktur-Inventar konnte nicht erhoben werden: ${infrastructureResult.reason.message}`);
    }

    if (drConfigResult.status === "fulfilled") {
      metrics.push(...drConfigResult.value.metrics);
      componentFaults.push(...drConfigResult.value.componentFaults);
      componentChecks.push(...drConfigResult.value.componentChecks);
    } else {
      config.logger?.warn(`Commvault: DR-Backup-Konfiguration konnte nicht erhoben werden: ${drConfigResult.reason.message}`);
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
