#!/usr/bin/env node
// Ferrion Managed-Service-Collector — läuft beim Kunden (Task Scheduler /
// cron), liest Kennzahlen einer Plattform aus und meldet sie entweder live
// an das Ferrion-Portal (POST /api/collector/ingest) oder — für Standorte
// ohne Netzwerkweg dorthin (air-gapped) — in eine lokale Export-Datei, die
// später manuell im Admin-Bereich hochgeladen wird. Siehe README.md.
//
// Aufruf:
//   node index.js config.json                         Live-Push (Standard)
//   node index.js config.json --export-dir ./exports   Export-Datei statt Push
//   node index.js config.json --debug                  + volle Request/Response-Logs
//
// Logs landen immer zusätzlich in logs/collector-<Datum>.log (siehe logger.js).
//
// Ein zweites Produkt anbinden: neue Datei adapters/<produktslug>.js mit
// collect(config) anlegen und hier registrieren — sonst nichts.
const fs = require("fs");
const path = require("path");
const { pushMetrics } = require("./push");
const { createLogger } = require("./logger");

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

function writeExportFile(exportDir, payload) {
  fs.mkdirSync(exportDir, { recursive: true });
  const fileName = `metrics-${payload.collectedAt.replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(exportDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

const { configPath, exportDir, debug } = parseArgs(process.argv.slice(2));

async function main() {
  const config = loadConfig(configPath);
  // config.debug in der Datei wirkt wie --debug auf der Kommandozeile.
  const log = createLogger({ debug: debug || config.debug === true });
  config.logger = log;

  log.info(`Log-Datei: ${log.logFile}`);

  const adapter = ADAPTERS[config.productSlug];
  if (!adapter) {
    throw new Error(`Kein Collector-Adapter für productSlug "${config.productSlug}" registriert.`);
  }

  log.info(`Erhebe Kennzahlen für ${config.productSlug} …`);
  // Adapter geben entweder nur ein Array (metrics) oder { metrics, meta }
  // zurück (meta z. B. für die Geräte-Seriennummer) — beide Formen erlaubt,
  // damit bestehende Adapter ohne meta nicht angepasst werden müssen.
  const collected = await adapter.collect(config);
  const metrics = Array.isArray(collected) ? collected : collected.metrics;
  const meta = Array.isArray(collected) ? undefined : collected.meta;
  const payload = { collectedAt: new Date().toISOString(), metrics, ...(meta ? { meta } : {}) };

  if (exportDir) {
    const filePath = writeExportFile(exportDir, payload);
    log.info(`OK — ${metrics.length} Kennzahlen in ${filePath} geschrieben.`);
    log.info('Diese Datei(en) regelmäßig aus der isolierten Umgebung mitnehmen und im Admin-Bereich unter der Subscription ("Manueller Upload") hochladen.');
    return;
  }

  log.info(`Sende ${metrics.length} Kennzahlen an ${config.ingestUrl} …`);
  const result = await pushMetrics(config, payload);
  log.info(`OK — ${result.metricsStored} Kennzahlen gespeichert (Ingestion ${result.id}).`);
}

main().catch((err) => {
  const log = createLogger({ debug });
  log.error(`Collector-Lauf fehlgeschlagen: ${err.message}`);
  if (err.stack) log.debug(err.stack);
  process.exitCode = 1;
});
