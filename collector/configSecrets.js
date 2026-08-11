// Verschlüsselt Passwörter in config.json, falls sie dort (noch) im
// Klartext stehen, und entschlüsselt sie nur für die Laufzeit im Speicher —
// siehe secretStore.js für das eigentliche Verschlüsselungsverfahren.
const fs = require("fs");
const { isEncrypted, encryptSecret, decryptSecret } = require("./secretStore");

const PASSWORD_KEY_PATTERN = /password/i;

// Läuft rekursiv über das gesamte Config-Objekt — deckt damit sowohl das
// "devices"-Array (mehrere Geräte) als auch die Legacy-Form mit
// Zugangsdaten direkt auf oberster Ebene ab, ohne beide Formen getrennt
// behandeln zu müssen, und findet automatisch auch das Passwort-Feld eines
// künftigen neuen Produkt-Adapters (jedes Feld, dessen Name "password"
// enthält, z. B. "password", "deviceManagerPassword", "dataBackupPassword").
function walkPasswordFields(obj, transform) {
  if (!obj || typeof obj !== "object") return;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && value.length > 0 && PASSWORD_KEY_PATTERN.test(key)) {
      obj[key] = transform(value);
    } else if (value && typeof value === "object") {
      walkPasswordFields(value, transform);
    }
  }
}

// Verschlüsselt alle noch im Klartext stehenden Passwörter in `config` und
// schreibt die Datei bei Änderungen zurück — idempotent (ein bereits
// verschlüsseltes Passwort bleibt unverändert). Läuft vor jedem Collector-
// Lauf, damit spätestens ab dem zweiten Start kein Klartext-Passwort mehr
// auf der Platte liegt, unabhängig davon, wie config.json ursprünglich
// befüllt wurde (von Hand, aus der Doku kopiert, vom alten Format migriert).
function ensureSecretsEncrypted(configPath, config, log) {
  let changed = 0;
  walkPasswordFields(config, (value) => {
    if (isEncrypted(value)) return value;
    changed++;
    return encryptSecret(value, configPath);
  });
  if (changed > 0) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
    try {
      fs.chmodSync(configPath, 0o600);
    } catch {
      // Windows ohne POSIX-Berechtigungen — best effort.
    }
    log?.info(`${changed} Passwort(-e) in ${configPath} verschlüsselt (waren im Klartext gespeichert).`);
  }
  return changed;
}

// Liefert eine TIEFE Kopie von config mit allen Passwörtern im Klartext —
// nur für die Laufzeit dieses Prozesses im Speicher, wird nie auf die
// Platte geschrieben. Wirft bei einem nicht entschlüsselbaren Wert einen
// klaren Fehler statt mit einem kaputten Passwort weiterzulaufen (z. B.
// config.json wurde auf eine andere Maschine/ein anderes Benutzerkonto
// kopiert — bei Windows-DPAPI erwartungsgemäß nicht mehr entschlüsselbar).
function decryptSecretsForRuntime(config, configPath) {
  const clone = JSON.parse(JSON.stringify(config));
  walkPasswordFields(clone, (value) => {
    if (!isEncrypted(value)) return value;
    try {
      return decryptSecret(value, configPath);
    } catch (err) {
      throw new Error(
        `Ein verschlüsseltes Passwort in ${configPath} konnte nicht entschlüsselt werden (${err.message}). ` +
          `Läuft der Collector auf einer anderen Maschine oder unter einem anderen Benutzerkonto als beim Verschlüsseln? ` +
          `Passwort in diesem Fall in config.json durch den Klartextwert ersetzen — wird beim nächsten Lauf automatisch neu verschlüsselt.`
      );
    }
  });
  return clone;
}

module.exports = { ensureSecretsEncrypted, decryptSecretsForRuntime };
