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
//   node index.js --help                               Diese Übersicht anzeigen
//
// Export-Verzeichnis aufräumen (nur zusammen mit --export-dir):
//   node index.js config.json --export-dir ./exports --cleanup-max-age-days 30
//   node index.js config.json --export-dir ./exports --cleanup-max-count 500
//   node index.js config.json --export-dir ./exports --cleanup-max-size-mb 200
//   (kombinierbar; siehe cleanup.js für die genaue Reihenfolge der Regeln)
//
// config.json über die CLI verwalten, statt von Hand zu editieren:
//   node index.js config list [config.json]
//   node index.js config add [config.json]
//   node index.js config edit <productSlug> [config.json]
//   node index.js config remove <productSlug> [config.json]
//   (siehe configCli.js)
//
// Wartungsmodus an einem FusionCompute-Host — bewusst NICHT Teil des
// automatischen Healthcheck-Laufs, sondern ein separater, explizit
// ausgelöster Befehl (schreibender Eingriff am Kundengerät):
//   node index.js maintenance enter <hostId> [config.json]
//   node index.js maintenance exit  <hostId> [config.json]
//   (siehe maintenanceCli.js)
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
const { ensureSecretsEncrypted, decryptSecretsForRuntime } = require("./configSecrets");
const { cleanupExports } = require("./cleanup");

const ADAPTERS = {
  oceanprotect: require("./adapters/oceanprotect"),
  "oceanstor-hybrid-flash": require("./adapters/oceanstor"),
  "netapp-aff": require("./adapters/netapp"),
  // productSlug ist "huawei-dcs" (nicht "fusioncompute") — das bestehende
  // Katalogprodukt "Huawei DCS" IST laut eigener Produktbeschreibung "die
  // Server-/Hypervisor-Schicht auf Basis von FusionCompute", kein eigenes
  // neues Produkt nötig. Der Adapter/das config.json-Feld heißen weiterhin
  // "fusioncompute" (technisch treffender, wie oceanstor/oceanstor-hybrid-
  // flash ebenfalls unterschiedliche Namen haben).
  "huawei-dcs": require("./adapters/fusioncompute"),
};

function printUsage() {
  // Gibt exakt den Kommentarblock oben im File aus (Zeilen 9–31) — bewusst
  // hier dupliziert statt den Kommentar zu parsen, damit die Laufzeitausgabe
  // nicht von Kommentarformatierung abhängt.
  console.log(`Ferrion Managed-Service-Collector — Aufruf:

  node index.js config.json                         Live-Push (Standard)
  node index.js config.json --export-dir ./exports   Export-Dateien statt Push
  node index.js config.json --debug                  + volle Request/Response-Logs
  node index.js --help                               Diese Übersicht anzeigen

Export-Verzeichnis aufräumen (nur zusammen mit --export-dir):
  node index.js config.json --export-dir ./exports --cleanup-max-age-days 30
  node index.js config.json --export-dir ./exports --cleanup-max-count 500
  node index.js config.json --export-dir ./exports --cleanup-max-size-mb 200
  (kombinierbar)

config.json über die CLI verwalten:
  node index.js config list [config.json]
  node index.js config add [config.json]
  node index.js config edit <productSlug> [config.json]
  node index.js config remove <productSlug> [config.json]

Wartungsmodus an einem FusionCompute-Host:
  node index.js maintenance enter <hostId> [config.json]
  node index.js maintenance exit  <hostId> [config.json]

Siehe README.md für Details.`);
}

function parseArgs(argv) {
  let configPath;
  let exportDir;
  let debug = false;
  let cleanupMaxAgeDays;
  let cleanupMaxCount;
  let cleanupMaxSizeMB;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--export-dir") {
      exportDir = argv[++i];
    } else if (argv[i] === "--debug") {
      debug = true;
    } else if (argv[i] === "--cleanup-max-age-days") {
      cleanupMaxAgeDays = Number(argv[++i]);
    } else if (argv[i] === "--cleanup-max-count") {
      cleanupMaxCount = Number(argv[++i]);
    } else if (argv[i] === "--cleanup-max-size-mb") {
      cleanupMaxSizeMB = Number(argv[++i]);
    } else if (!configPath) {
      configPath = argv[i];
    }
  }
  return {
    configPath: configPath || path.join(__dirname, "config.json"),
    exportDir,
    debug,
    cleanupMaxAgeDays,
    cleanupMaxCount,
    cleanupMaxSizeMB,
  };
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

// Subcommand-Dispatch: "config"/"maintenance"/"--help" laufen VOR dem
// normalen parseArgs()+main()-Ablauf und beenden den Prozess selbst — sonst
// würde z. B. "config" als (falscher) configPath-Dateiname interpretiert.
// Kollisionsrisiko mit einer tatsächlich "config"/"maintenance" genannten
// Config-Datei (ohne .json-Endung) ist bewusst in Kauf genommen, wie bei
// jeder CLI mit Subcommands (npm, git, docker, …).
const firstArg = process.argv[2];
if (firstArg === "--help" || firstArg === "-h") {
  printUsage();
  process.exit(0);
}
if (firstArg === "config") {
  // Node wrappt jedes CommonJS-Modul in eine Funktion — ein `return` auf
  // oberster Ebene ist daher gültig und beendet den Rest dieser Datei
  // (kein `process.exit()` nötig, runConfigCli() ist async und beendet
  // sich selbst über die normale Event-Loop-Terminierung).
  require("./configCli").runConfigCli(process.argv.slice(3));
  return;
}
if (firstArg === "maintenance") {
  require("./maintenanceCli").runMaintenanceCli(process.argv.slice(3));
  return;
}

const { configPath, exportDir, debug, cleanupMaxAgeDays, cleanupMaxCount, cleanupMaxSizeMB } = parseArgs(process.argv.slice(2));

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

  log.info(`Log-Datei: ${log.logFile}`);
  log.info(`Collector-Version: ${COLLECTOR_VERSION}`);

  // Verschlüsselt eventuell noch im Klartext stehende Passwörter in
  // config.json auf der Platte (idempotent), BEVOR config.logger gesetzt
  // wird (der Logger ist nicht JSON-serialisierbar). Für den eigentlichen
  // Lauf wird danach eine reine Speicher-Kopie mit entschlüsselten
  // Passwörtern verwendet — nie die auf der Platte liegende Fassung.
  ensureSecretsEncrypted(configPath, config, log);
  const runtimeConfig = decryptSecretsForRuntime(config, configPath);
  runtimeConfig.logger = log;

  const devices = normalizeDevices(runtimeConfig);
  if (exportDir) {
    log.info('Diese Datei(en) regelmäßig aus der isolierten Umgebung mitnehmen und im Admin-Bereich unter der jeweiligen Subscription ("Manueller Upload") hochladen.');
  }

  const results = await Promise.allSettled(devices.map((device) => collectDevice(runtimeConfig, device, log, exportDir)));

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

  // Nur relevant im Export-Modus und nur, wenn mindestens eine Grenze
  // gesetzt ist — ohne --export-dir gibt es nichts aufzuräumen, und ohne
  // gesetzte Grenze bleibt das Verhalten unverändert (kein Datenverlust
  // ohne bewusste Konfiguration, wie bei metricsRetentionDays im Portal).
  if (exportDir && (cleanupMaxAgeDays !== undefined || cleanupMaxCount !== undefined || cleanupMaxSizeMB !== undefined)) {
    cleanupExports(exportDir, { maxAgeDays: cleanupMaxAgeDays, maxCount: cleanupMaxCount, maxSizeMB: cleanupMaxSizeMB }, log);
  }
}

main().catch((err) => {
  const log = createLogger({ debug });
  log.error(`Collector-Lauf fehlgeschlagen: ${err.message}`);
  if (err.stack) log.debug(err.stack);
  process.exitCode = 1;
});
