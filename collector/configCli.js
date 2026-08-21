// CLI-Verwaltung für config.json — Geräte auflisten, hinzufügen, bearbeiten,
// entfernen, ohne die Datei von Hand editieren zu müssen. Aufruf über
// index.js ("node index.js config <list|add|edit|remove> [...] [config.json]").
//
// Verschlüsselt neu eingegebene Passwörter SOFORT (vor dem Schreiben) über
// secretStore.encryptSecret — anders als der normale Collector-Lauf (der
// ensureSecretsEncrypted nutzt, welches nur bei tatsächlicher Änderung
// schreibt) muss diese CLI jede Änderung garantiert persistieren, auch wenn
// dabei kein Passwort-Feld betroffen ist. Deshalb hier ein eigener,
// einziger fs.writeFileSync-Aufruf statt ensureSecretsEncrypted zu verwenden.
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { isEncrypted, encryptSecret } = require("./secretStore");

const DEFAULT_USERNAME = "collector_ro";
const DEFAULT_INGEST_URL = "https://www.ferrion.at/api/collector/ingest";

// Welche Felder pro Produkt abgefragt werden, und in welchem Config-Block
// (z. B. "oceanstor" für productSlug "oceanstor-hybrid-flash" — die beiden
// heißen bewusst unterschiedlich, siehe config.example.json) sie landen.
const PRODUCT_FIELD_SPECS = {
  oceanprotect: {
    block: "oceanprotect",
    fields: [
      { key: "storagePoolId", label: "Storage-Pool-ID", default: "0" },
      { key: "deviceManagerUrl", label: "DeviceManager-URL (z. B. https://<host>:8088)" },
      { key: "deviceManagerUsername", label: "DeviceManager-Benutzername", default: DEFAULT_USERNAME },
      { key: "deviceManagerPassword", label: "DeviceManager-Passwort", password: true },
      { key: "dataBackupUrl", label: "DataBackup-URL (z. B. https://<host>:25081)" },
      { key: "dataBackupUsername", label: "DataBackup-Benutzername", default: DEFAULT_USERNAME },
      { key: "dataBackupPassword", label: "DataBackup-Passwort", password: true },
    ],
  },
  "oceanstor-hybrid-flash": {
    block: "oceanstor",
    fields: [
      { key: "storagePoolId", label: "Storage-Pool-ID", default: "0" },
      { key: "deviceManagerUrl", label: "DeviceManager-URL (z. B. https://<host>:8088)" },
      { key: "username", label: "Benutzername", default: DEFAULT_USERNAME },
      { key: "password", label: "Passwort", password: true },
    ],
  },
  "netapp-aff": {
    block: "netapp",
    fields: [
      { key: "managementUrl", label: "Cluster-Management-URL (z. B. https://<cluster-ip>)" },
      { key: "username", label: "Benutzername", default: DEFAULT_USERNAME },
      { key: "password", label: "Passwort", password: true },
    ],
  },
  // productSlug "huawei-dcs" (nicht "fusioncompute") — siehe Kommentar zu
  // ADAPTERS in index.js: das bestehende Katalogprodukt "Huawei DCS" ist
  // die Server-/Hypervisor-Schicht auf Basis von FusionCompute, der
  // config.json-Block heißt trotzdem weiterhin "fusioncompute".
  "huawei-dcs": {
    block: "fusioncompute",
    fields: [
      { key: "managementUrl", label: "VRM-Management-URL (z. B. https://<vrm-host>)" },
      { key: "username", label: "Benutzername", default: DEFAULT_USERNAME },
      { key: "password", label: "Passwort", password: true },
    ],
  },
  commvault: {
    block: "commvault",
    fields: [
      { key: "baseUrl", label: "CommServe/Command-Center-URL (z. B. https://<commserve-host>)" },
      { key: "username", label: "Benutzername", default: DEFAULT_USERNAME },
      { key: "password", label: "Passwort", password: true },
      { key: "domain", label: "Domäne (nur bei AD-Benutzern, sonst leer lassen)", default: "" },
    ],
  },
};

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

function loadConfigOrEmpty(configPath) {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function writeConfig(configPath, config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
  try {
    fs.chmodSync(configPath, 0o600);
  } catch {
    // Windows ohne POSIX-Berechtigungen — best effort, wie an anderer Stelle
    // im Collector auch (siehe secretStore.js/configSecrets.js).
  }
}

// Vereinheitlicht auf die "devices"-Array-Form — wie normalizeDevices() in
// index.js, aber mutierend statt nur lesend, damit add/edit/remove immer
// gegen dieselbe Form arbeiten und nie wieder in die Legacy-Form
// zurückschreiben (vereinfacht die CLI, ohne bestehende Legacy-configs beim
// nächsten COLLECTOR-Lauf zu brechen — normalizeDevices() liest weiterhin
// beide Formen).
function normalizeToDevicesArray(config) {
  if (Array.isArray(config.devices)) return config;
  const { productSlug, apiKey, oceanprotect, oceanstor, netapp, fusioncompute, ...shared } = config;
  const legacyDevice = { productSlug, apiKey, oceanprotect, oceanstor, netapp, fusioncompute };
  Object.keys(legacyDevice).forEach((k) => legacyDevice[k] === undefined && delete legacyDevice[k]);
  const hasLegacyDevice = Object.keys(legacyDevice).length > 0;
  return { ...shared, devices: hasLegacyDevice ? [legacyDevice] : [] };
}

function maskApiKey(apiKey) {
  if (!apiKey) return "(nicht gesetzt)";
  return apiKey.length <= 4 ? "••••" : `••••${apiKey.slice(-4)}`;
}

function maskFieldValue(key, value) {
  if (!/password/i.test(key)) return value ?? "(nicht gesetzt)";
  if (!value) return "(nicht gesetzt)";
  return isEncrypted(value) ? "(gesetzt, verschlüsselt)" : "(gesetzt, UNVERSCHLÜSSELT — 'config edit' oder einen Collector-Lauf ausführen)";
}

function printDevice(device, index) {
  const spec = PRODUCT_FIELD_SPECS[device.productSlug];
  console.log(`\n[${index}] productSlug: ${device.productSlug}`);
  console.log(`    apiKey: ${maskApiKey(device.apiKey)}`);
  if (!spec) {
    console.log(`    (unbekanntes Produkt — keine Feldbeschreibung verfügbar, Rohdaten:)`);
    console.log(`    ${JSON.stringify(device[device.productSlug] ?? {}, null, 2).replace(/\n/g, "\n    ")}`);
    return;
  }
  const block = device[spec.block] ?? {};
  for (const f of spec.fields) {
    console.log(`    ${spec.block}.${f.key}: ${maskFieldValue(f.key, block[f.key])}`);
  }
}

async function cmdList(configPath) {
  if (!fs.existsSync(configPath)) {
    console.log(`Keine config.json gefunden unter ${configPath} — mit "config add" anlegen.`);
    return;
  }
  const config = loadConfigOrEmpty(configPath);
  const normalized = normalizeToDevicesArray(config);
  console.log(`config.json: ${configPath}`);
  console.log(`ingestUrl: ${normalized.ingestUrl ?? "(nicht gesetzt)"}`);
  console.log(`allowInsecureTls: ${normalized.allowInsecureTls ?? false}`);
  if (normalized.devices.length === 0) {
    console.log("\nKeine Geräte konfiguriert — mit \"config add\" eines anlegen.");
    return;
  }
  normalized.devices.forEach((d, i) => printDevice(d, i));
}

async function promptField(rl, field, currentValue, configPath) {
  const currentDisplay = field.password ? maskFieldValue(field.key, currentValue) : currentValue ?? field.default ?? "";
  const suffix = currentValue !== undefined ? ` [${currentDisplay}, Enter = übernehmen]` : field.default ? ` [${field.default}]` : "";
  const warning = field.password ? " — Achtung: Eingabe wird sichtbar angezeigt" : "";
  const answer = await ask(rl, `  ${field.label}${suffix}${warning}: `);
  if (answer === "") {
    if (currentValue !== undefined) return currentValue; // unverändert lassen
    return field.default;
  }
  return field.password ? encryptSecret(answer, configPath) : answer;
}

async function cmdAdd(rl, configPath) {
  const productSlugs = Object.keys(PRODUCT_FIELD_SPECS);
  console.log("Produkt wählen:");
  productSlugs.forEach((slug, i) => console.log(`  ${i + 1}) ${slug}`));
  const choice = await ask(rl, `Nummer (1-${productSlugs.length}): `);
  const productSlug = productSlugs[Number(choice) - 1];
  if (!productSlug) {
    throw new Error(`Ungültige Auswahl: "${choice}".`);
  }

  let config = normalizeToDevicesArray(loadConfigOrEmpty(configPath));

  if (!config.ingestUrl) {
    config.ingestUrl = (await ask(rl, `ingestUrl [${DEFAULT_INGEST_URL}]: `)) || DEFAULT_INGEST_URL;
  }
  const apiKey = await ask(rl, "API-Key (Admin-Bereich > Managed Reports > Subscription > API-Keys): ");
  if (!apiKey) throw new Error("API-Key darf nicht leer sein.");

  const spec = PRODUCT_FIELD_SPECS[productSlug];
  const block = {};
  console.log(`\nZugangsdaten für ${productSlug}:`);
  for (const field of spec.fields) {
    block[field.key] = await promptField(rl, field, undefined, configPath);
  }

  config.devices.push({ productSlug, apiKey, [spec.block]: block });
  writeConfig(configPath, config);
  console.log(`\nGerät "${productSlug}" hinzugefügt und in ${configPath} gespeichert (Passwörter verschlüsselt).`);
  console.log(`Testlauf: node index.js ${path.basename(configPath)}`);
}

async function cmdEdit(rl, configPath, productSlug) {
  if (!productSlug) throw new Error("Nutzung: node index.js config edit <productSlug> [config.json]");
  const config = normalizeToDevicesArray(loadConfigOrEmpty(configPath));
  const index = config.devices.findIndex((d) => d.productSlug === productSlug);
  if (index === -1) {
    const available = config.devices.map((d) => d.productSlug).join(", ") || "(keine)";
    throw new Error(`Kein Gerät mit productSlug "${productSlug}" gefunden. Vorhanden: ${available}`);
  }

  const device = config.devices[index];
  console.log(`Bearbeite Gerät [${index}] productSlug: ${productSlug} — leere Eingabe lässt den Wert unverändert.\n`);
  const newApiKey = await ask(rl, `API-Key [${maskApiKey(device.apiKey)}, Enter = übernehmen]: `);
  if (newApiKey) device.apiKey = newApiKey;

  const spec = PRODUCT_FIELD_SPECS[productSlug];
  if (spec) {
    const block = device[spec.block] ?? {};
    for (const field of spec.fields) {
      block[field.key] = await promptField(rl, field, block[field.key], configPath);
    }
    device[spec.block] = block;
  } else {
    console.log(`(Unbekanntes Produkt "${productSlug}" — nur der API-Key wurde ggf. aktualisiert, restliche Felder von Hand in ${configPath} anpassen.)`);
  }

  writeConfig(configPath, config);
  console.log(`\nGerät "${productSlug}" aktualisiert und in ${configPath} gespeichert.`);
}

async function cmdRemove(rl, configPath, productSlug) {
  if (!productSlug) throw new Error("Nutzung: node index.js config remove <productSlug> [config.json]");
  const config = normalizeToDevicesArray(loadConfigOrEmpty(configPath));
  const matches = config.devices.filter((d) => d.productSlug === productSlug);
  if (matches.length === 0) {
    const available = config.devices.map((d) => d.productSlug).join(", ") || "(keine)";
    throw new Error(`Kein Gerät mit productSlug "${productSlug}" gefunden. Vorhanden: ${available}`);
  }
  if (matches.length > 1) {
    console.log(`Achtung: ${matches.length} Geräte mit productSlug "${productSlug}" gefunden — es wird nur das erste entfernt. Für die übrigen config.json bitte von Hand anpassen.`);
  }

  const confirmed = await ask(rl, `Gerät "${productSlug}" wirklich entfernen? (y/N): `);
  if (confirmed.toLowerCase() !== "y") {
    console.log("Abgebrochen.");
    return;
  }

  const indexToRemove = config.devices.findIndex((d) => d.productSlug === productSlug);
  config.devices.splice(indexToRemove, 1);
  writeConfig(configPath, config);
  console.log(`Gerät "${productSlug}" entfernt und ${configPath} gespeichert.`);
}

async function runConfigCli(args) {
  const [subcommand, ...rest] = args;
  // Bei "edit"/"remove" ist rest[0] der productSlug, ein optionaler
  // config.json-Pfad kann dahinter folgen; bei "list"/"add" ist rest[0]
  // bereits der optionale config.json-Pfad.
  const needsSlug = subcommand === "edit" || subcommand === "remove";
  const productSlug = needsSlug ? rest[0] : undefined;
  const configPath = (needsSlug ? rest[1] : rest[0]) || path.join(__dirname, "config.json");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    switch (subcommand) {
      case "list":
        await cmdList(configPath);
        break;
      case "add":
        await cmdAdd(rl, configPath);
        break;
      case "edit":
        await cmdEdit(rl, configPath, productSlug);
        break;
      case "remove":
        await cmdRemove(rl, configPath, productSlug);
        break;
      default:
        console.log('Nutzung: node index.js config <list|add|edit|remove> ...\nSiehe "node index.js --help" für Beispiele.');
        process.exitCode = subcommand ? 1 : 0;
    }
  } catch (err) {
    console.error(`Fehler: ${err.message}`);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

module.exports = { runConfigCli, normalizeToDevicesArray, PRODUCT_FIELD_SPECS };
