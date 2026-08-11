// Verschlüsselt/entschlüsselt einzelne Secret-Strings (Passwörter) für
// config.json — kein Ersatz für einen echten Secret-Manager, sondern Schutz
// gegen die realistischsten Risiken bei einem lokal am Kundenstandort
// abgelegten Config-File: versehentliches Teilen einer Datei-/Bildschirm-
// Kopie, ein Backup-Job, der config.json unverändert sichert, ein anderes
// Benutzerkonto auf derselben Maschine, ein "git add -A" aus Versehen.
// Schützt NICHT gegen einen Angreifer mit vollem Zugriff auf genau das
// Benutzerkonto/die Maschine, unter der der Collector selbst läuft — das
// kann kein rein lokales Verfahren leisten, das ohne menschliche
// Passworteingabe automatisiert laufen muss (Task Scheduler/cron).
//
// Windows: Data Protection API (DPAPI) über PowerShell — der Klartext wird
// NIE als Kommandozeilenargument übergeben (dort über die Prozessliste
// einsehbar), sondern per stdin/stdout gepiped. Scope LocalMachine statt
// CurrentUser, damit der Collector unabhängig davon funktioniert, unter
// welchem Konto Task Scheduler ihn tatsächlich ausführt (oft ein
// Service-Konto, das sich vom interaktiven Konto beim Einrichten
// unterscheidet) — kostet etwas Schutzwirkung (jedes Konto auf derselben
// Maschine könnte entschlüsseln), gewinnt aber deutlich an Betriebssicherheit.
//
// Linux/macOS: kein DPAPI-Äquivalent ohne zusätzliche, auf einem Headless-
// Server oft fehlende Abhängigkeiten (libsecret/gnome-keyring) — stattdessen
// AES-256-GCM mit einem zufällig erzeugten, lokal neben config.json
// abgelegten Schlüssel (.collector.key, chmod 600, siehe .gitignore).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const AES_PREFIX = "enc:v1:";
const DPAPI_PREFIX = "encdpapi:v1:";

function isEncrypted(value) {
  return typeof value === "string" && (value.startsWith(AES_PREFIX) || value.startsWith(DPAPI_PREFIX));
}

function keyFilePath(configPath) {
  return path.join(path.dirname(path.resolve(configPath)), ".collector.key");
}

// Ein AES-Schlüssel pro Installation (nicht pro Passwort) — reicht aus, da
// die Datei ohnehin nur so stark geschützt ist wie der Zugriff auf den
// Collector-Host selbst, und vereinfacht Schlüsselverwaltung/Rotation.
function getOrCreateAesKey(configPath) {
  const keyPath = keyFilePath(configPath);
  if (fs.existsSync(keyPath)) {
    return Buffer.from(fs.readFileSync(keyPath, "utf8").trim(), "base64");
  }
  const key = crypto.randomBytes(32);
  fs.writeFileSync(keyPath, key.toString("base64") + "\n", { mode: 0o600 });
  try {
    fs.chmodSync(keyPath, 0o600);
  } catch {
    // Windows ohne POSIX-Berechtigungen o. Ä. — best effort, kein harter Fehler.
  }
  return key;
}

function aesEncrypt(plainText, configPath) {
  const key = getOrCreateAesKey(configPath);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return AES_PREFIX + [iv, authTag, ciphertext].map((b) => b.toString("base64")).join(":");
}

function aesDecrypt(value, configPath) {
  const key = getOrCreateAesKey(configPath);
  const [ivB64, tagB64, dataB64] = value.slice(AES_PREFIX.length).split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Ungültiges AES-Chiffrat-Format.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

// Ruft PowerShell mit dem Klartext/Chiffretext über stdin auf (nie als Argv
// — siehe Kommentar oben) und liest das Ergebnis von stdout.
function runPowerShellDpapi(mode, input) {
  const script =
    mode === "protect"
      ? `Add-Type -AssemblyName System.Security
$plain = [Console]::In.ReadToEnd()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain)
$protected = [System.Security.Cryptography.ProtectedData]::Protect($bytes, $null, [System.Security.Cryptography.DataProtectionScope]::LocalMachine)
[Console]::Out.Write([Convert]::ToBase64String($protected))`
      : `Add-Type -AssemblyName System.Security
$b64 = [Console]::In.ReadToEnd()
$bytes = [Convert]::FromBase64String($b64)
$unprotected = [System.Security.Cryptography.ProtectedData]::Unprotect($bytes, $null, [System.Security.Cryptography.DataProtectionScope]::LocalMachine)
[Console]::Out.Write([System.Text.Encoding]::UTF8.GetString($unprotected))`;

  return execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
    input,
    encoding: "utf8",
  });
}

function encryptSecret(plainText, configPath) {
  if (process.platform === "win32") {
    try {
      return DPAPI_PREFIX + runPowerShellDpapi("protect", plainText);
    } catch {
      // PowerShell/DPAPI nicht verfügbar — lieber AES-verschlüsselt als gar
      // nicht, statt den ganzen Collector-Lauf daran scheitern zu lassen.
      return aesEncrypt(plainText, configPath);
    }
  }
  return aesEncrypt(plainText, configPath);
}

function decryptSecret(value, configPath) {
  if (value.startsWith(DPAPI_PREFIX)) return runPowerShellDpapi("unprotect", value.slice(DPAPI_PREFIX.length));
  if (value.startsWith(AES_PREFIX)) return aesDecrypt(value, configPath);
  throw new Error("Unbekanntes Verschlüsselungsformat.");
}

module.exports = { isEncrypted, encryptSecret, decryptSecret };
