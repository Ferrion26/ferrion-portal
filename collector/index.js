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
//
// Ein zweites Produkt anbinden: neue Datei adapters/<produktslug>.js mit
// collect(config) anlegen und hier registrieren — sonst nichts.
const fs = require("fs");
const path = require("path");
const { pushMetrics } = require("./push");

const ADAPTERS = {
  oceanprotect: require("./adapters/oceanprotect"),
};

function parseArgs(argv) {
  let configPath;
  let exportDir;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--export-dir") {
      exportDir = argv[++i];
    } else if (!configPath) {
      configPath = argv[i];
    }
  }
  return { configPath: configPath || path.join(__dirname, "config.json"), exportDir };
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

async function main() {
  const { configPath, exportDir } = parseArgs(process.argv.slice(2));
  const config = loadConfig(configPath);
  const adapter = ADAPTERS[config.productSlug];
  if (!adapter) {
    throw new Error(`Kein Collector-Adapter für productSlug "${config.productSlug}" registriert.`);
  }

  console.log(`[${new Date().toISOString()}] Erhebe Kennzahlen für ${config.productSlug} …`);
  const metrics = await adapter.collect(config);
  const payload = { collectedAt: new Date().toISOString(), metrics };

  if (exportDir) {
    const filePath = writeExportFile(exportDir, payload);
    console.log(`[${new Date().toISOString()}] OK — ${metrics.length} Kennzahlen in ${filePath} geschrieben.`);
    console.log("Diese Datei(en) regelmäßig aus der isolierten Umgebung mitnehmen und im Admin-Bereich unter der Subscription (\"Manueller Upload\") hochladen.");
    return;
  }

  console.log(`[${new Date().toISOString()}] Sende ${metrics.length} Kennzahlen an ${config.ingestUrl} …`);
  const result = await pushMetrics(config, payload);
  console.log(`[${new Date().toISOString()}] OK — ${result.metricsStored} Kennzahlen gespeichert (Ingestion ${result.id}).`);
}

main().catch((err) => {
  console.error(`[${new Date().toISOString()}] Collector-Lauf fehlgeschlagen:`, err.message);
  process.exitCode = 1;
});
