#!/usr/bin/env node
// Ferrion Managed-Service-Collector — läuft beim Kunden (Task Scheduler /
// cron), liest Kennzahlen einer oder mehrerer Plattformen aus und meldet sie
// entweder live an das Ferrion-Portal (POST /api/collector/ingest) oder —
// für Standorte ohne Netzwerkweg dorthin (air-gapped) — in lokale
// Export-Dateien, die später manuell im Admin-Bereich hochgeladen werden.
// Siehe README.md.
//
// Aufruf:
//   node index.js config.json                         Live-Push (Standard)
//   node index.js config.json --export-dir ./exports   Export-Dateien statt Push
//   node index.js config.json --debug                  + volle Request/Response-Logs
//
// Ein Standort mit mehreren Geräten (z. B. OceanProtect + OceanStor) braucht
// nur EIN config.json mit einem "devices"-Array (siehe config.example.json)
// und damit auch nur EINEN geplanten Lauf/Task für den ganzen Standort —
// jedes Gerät hat darin seine eigene Subscription (eigener API-Key), aber
// alle laufen in einem Skriptaufruf. Ältere config.json-Dateien mit
// productSlug/apiKey/Zugangsdaten direkt auf oberster Ebene (ein einzelnes
// Gerät) funktionieren unverändert weiter (siehe normalizeDevices unten).
//
// Logs landen immer zusätzlich in logs/collector-<Datum>.log (siehe logger.js).
//
// Ein zweites Produkt anbinden: neue Datei adapters/<produktslug>.js mit
// collect(config) anlegen und hier registrieren — sonst nichts.
const fs = require("fs");
const path = require("path");
const { pushMetrics } = require("./push");
const { createLogger } = require("./logger");
const { FULL: COLLECTOR_VERSION } = require("./version");

const ADAPTERS = {
  oceanprotect: require("./adapters/oceanprotect"),
  "oceanstor-hybrid-flash": require("./adapters/oceanstor"),
};

function parseArgs(argv) {
  let configPath;
  let exportDir;
  let debug = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--export-dir") {
      exportDir = argv[++i];
    } else if (argv[i] === "--debug") {
      debug = true;
    } else if (!configPath) {
      configPath = argv[i];
    }
  }
  return { configPath: configPath || path.join(__dirname, "config.json"), exportDir, debug };
}

function loadConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Konfigurationsdatei nicht gefunden: ${configPath} (siehe config.example.json)`);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// Liest das/die konfigurierten Geräte aus config.json — entweder das neue
// "devices"-Array (mehrere Geräte/Produkte in einem Lauf) oder, wenn das
// fehlt, die Legacy-Form mit productSlug/apiKey/Zugangsdaten direkt auf
// oberster Ebene (ein einzelnes Gerät, wie in älteren Konfigurationen).
function normalizeDevices(config) {
  if (Array.isArray(config.devices)) return config.devices;
  const { devices, ...legacyDevice } = config;
  return [legacyDevice];
}

function writeExportFile(exportDir, productSlug, payload) {
  fs.mkdirSync(exportDir, { recursive: true });
  const safeSlug = productSlug.replace(/[^a-z0-9-]/gi, "_");
  const fileName = `metrics-${safeSlug}-${payload.collectedAt.replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(exportDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

const { configPath, exportDir, debug } = parseArgs(process.argv.slice(2));

async function collectDevice(sharedConfig, device, log, exportDir) {
  // Gerätespezifische Felder (productSlug, apiKey, ingestUrl, Zugangsdaten-
  // Block wie "oceanprotect"/"oceanstor") überschreiben etwaige gleichnamige
  // Felder auf oberster Ebene — geteilte Einstellungen wie allowInsecureTls/
  // debug/ingestUrl können aber auch nur einmal oben stehen, wenn sie für
  // alle Geräte gleich sind.
  const deviceConfig = { ...sharedConfig, ...device, logger: log };

  const adapter = ADAPTERS[deviceConfig.productSlug];
  if (!adapter) {
    throw new Error(`Kein Collector-Adapter für productSlug "${deviceConfig.productSlug}" registriert.`);
  }

  log.info(`Erhebe Kennzahlen für ${deviceConfig.productSlug} …`);
  // Adapter geben entweder nur ein Array (metrics) oder { metrics, meta }
  // zurück (meta z. B. für die Geräte-Seriennummer) — beide Formen erlaubt.
  const collected = await adapter.collect(deviceConfig);
  const metrics = Array.isArray(collected) ? collected : collected.metrics;
  const meta = Array.isArray(collected) ? undefined : collected.meta;
  const payload = { collectedAt: new Date().toISOString(), collectorVersion: COLLECTOR_VERSION, metrics, ...(meta ? { meta } : {}) };

  if (exportDir) {
    const filePath = writeExportFile(exportDir, deviceConfig.productSlug, payload);
    log.info(`OK (${deviceConfig.productSlug}) — ${metrics.length} Kennzahlen in ${filePath} geschrieben.`);
    return;
  }

  if (!deviceConfig.ingestUrl || !deviceConfig.apiKey) {
    throw new Error(`ingestUrl/apiKey fehlen für Gerät "${deviceConfig.productSlug}".`);
  }
  log.info(`Sende ${metrics.length} Kennzahlen (${deviceConfig.productSlug}) an ${deviceConfig.ingestUrl} …`);
  const result = await pushMetrics(deviceConfig, payload);
  log.info(`OK (${deviceConfig.productSlug}) — ${result.metricsStored} Kennzahlen gespeichert (Ingestion ${result.id}).`);
}

async function main() {
  const config = loadConfig(configPath);
  // config.debug in der Datei wirkt wie --debug auf der Kommandozeile.
  const log = createLogger({ debug: debug || config.debug === true });
  config.logger = log;

  log.info(`Log-Datei: ${log.logFile}`);
  log.info(`Collector-Version: ${COLLECTOR_VERSION}`);

  const devices = normalizeDevices(config);
  if (exportDir) {
    log.info('Diese Datei(en) regelmäßig aus der isolierten Umgebung mitnehmen und im Admin-Bereich unter der jeweiligen Subscription ("Manueller Upload") hochladen.');
  }

  const results = await Promise.allSettled(devices.map((device) => collectDevice(config, device, log, exportDir)));

  const failed = results.filter((r) => r.status === "rejected");
  for (const r of failed) {
    log.error(`Ein Gerät ist fehlgeschlagen: ${r.reason.message}`);
  }
  if (failed.length === results.length) {
    throw new Error("Alle konfigurierten Geräte sind fehlgeschlagen — siehe Log oben.");
  }
  if (failed.length > 0) {
    log.warn(`${failed.length} von ${results.length} Geräten fehlgeschlagen — die übrigen wurden trotzdem erhoben/gesendet.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  const log = createLogger({ debug });
  log.error(`Collector-Lauf fehlgeschlagen: ${err.message}`);
  if (err.stack) log.debug(err.stack);
  process.exitCode = 1;
});
