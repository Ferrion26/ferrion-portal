#!/usr/bin/env node
// Ferrion Managed-Service-Collector — läuft beim Kunden (Task Scheduler /
// cron), liest Kennzahlen einer Plattform aus und meldet sie an das
// Ferrion-Portal (POST /api/collector/ingest). Siehe README.md für Einrichtung.
//
// Ein zweites Produkt anbinden: neue Datei adapters/<produktslug>.js mit
// collect(config) anlegen und hier registrieren — sonst nichts.
const fs = require("fs");
const path = require("path");
const { pushMetrics } = require("./push");

const ADAPTERS = {
  oceanprotect: require("./adapters/oceanprotect"),
};

function loadConfig() {
  const configPath = process.argv[2] || path.join(__dirname, "config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Konfigurationsdatei nicht gefunden: ${configPath} (siehe config.example.json)`);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

async function main() {
  const config = loadConfig();
  const adapter = ADAPTERS[config.productSlug];
  if (!adapter) {
    throw new Error(`Kein Collector-Adapter für productSlug "${config.productSlug}" registriert.`);
  }

  console.log(`[${new Date().toISOString()}] Erhebe Kennzahlen für ${config.productSlug} …`);
  const metrics = await adapter.collect(config);

  console.log(`[${new Date().toISOString()}] Sende ${metrics.length} Kennzahlen an ${config.ingestUrl} …`);
  const result = await pushMetrics(config, metrics);

  console.log(`[${new Date().toISOString()}] OK — ${result.metricsStored} Kennzahlen gespeichert (Ingestion ${result.id}).`);
}

main().catch((err) => {
  console.error(`[${new Date().toISOString()}] Collector-Lauf fehlgeschlagen:`, err.message);
  process.exitCode = 1;
});
