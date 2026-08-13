// CLI für aktive Wartungsmodus-Aktionen an einem Host — bewusst getrennt
// vom automatischen Healthcheck-Lauf (siehe adapters/fusioncompute.js),
// da das Ein-/Ausschalten des Wartungsmodus ein schreibender Eingriff am
// Kundengerät ist, der nur explizit vom Admin ausgelöst werden soll.
//
// Aufruf über index.js:
//   node index.js maintenance enter <hostId> [config.json]
//   node index.js maintenance exit  <hostId> [config.json]
//
// Ist mehr als ein FusionCompute-Gerät in config.json konfiguriert (i. d. R.
// unüblich, ein Standort hat meist nur ein VRM-Management), wird das erste
// gefunden verwendet und eine Warnung ausgegeben.
const fs = require("fs");
const path = require("path");
const { createLogger } = require("./logger");
const { decryptSecretsForRuntime } = require("./configSecrets");
const { normalizeToDevicesArray } = require("./configCli");
const { enterMaintenance, exitMaintenance } = require("./adapters/fusioncompute");

function findFusioncomputeDevice(config) {
  const normalized = normalizeToDevicesArray(config);
  // productSlug "huawei-dcs" — siehe Kommentar zu ADAPTERS in index.js.
  const matches = normalized.devices.filter((d) => d.productSlug === "huawei-dcs");
  if (matches.length === 0) {
    throw new Error('Kein Gerät mit productSlug "huawei-dcs" in der Config gefunden — mit "node index.js config add" anlegen.');
  }
  if (matches.length > 1) {
    console.warn(`Achtung: ${matches.length} FusionCompute-Geräte konfiguriert — verwende das erste.`);
  }
  return { ...normalized, ...matches[0] };
}

async function runMaintenanceCli(args) {
  const [action, hostId, configPathArg] = args;
  const configPath = configPathArg || path.join(__dirname, "config.json");
  const log = createLogger({ debug: false });

  if (!["enter", "exit"].includes(action) || !hostId) {
    console.log("Nutzung: node index.js maintenance <enter|exit> <hostId> [config.json]");
    process.exitCode = 1;
    return;
  }

  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Konfigurationsdatei nicht gefunden: ${configPath}`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const runtimeConfig = decryptSecretsForRuntime(config, configPath);
    const deviceConfig = { ...findFusioncomputeDevice(runtimeConfig), logger: log };

    const verb = action === "enter" ? "Aktiviere" : "Deaktiviere";
    log.info(`${verb} Wartungsmodus für Host ${hostId} …`);
    if (action === "enter") {
      await enterMaintenance(deviceConfig, hostId);
    } else {
      await exitMaintenance(deviceConfig, hostId);
    }
    log.info(`Wartungsmodus für Host ${hostId} erfolgreich ${action === "enter" ? "aktiviert" : "deaktiviert"}.`);
  } catch (err) {
    log.error(`Wartungsaktion fehlgeschlagen: ${err.message}`);
    process.exitCode = 1;
  }
}

module.exports = { runMaintenanceCli };
