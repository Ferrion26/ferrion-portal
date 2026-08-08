// Leichtgewichtiges Logging ohne externe Abhängigkeiten: schreibt jede
// Zeile sowohl auf die Konsole als auch in eine Tages-Logdatei
// (logs/collector-YYYY-MM-DD.log) — damit ein Fehlschlag eines geplanten
// Laufs (Task Scheduler/cron) nachträglich nachvollziehbar bleibt, auch
// wenn niemand gerade auf die Konsole schaut.
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "logs");
const SENSITIVE_KEY_PATTERN = /password|apikey|api-key|token|cookie|ibasetoken/i;

// Ersetzt bekannte sensible Felder (Passwörter, Keys, Tokens, Cookies) in
// verschachtelten Objekten durch eine gekürzte, ungefährliche Darstellung —
// für --debug-Logs, die volle Request/Response-Bodies mitschreiben.
function redact(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = typeof v === "string" && v.length > 0 ? `[redacted, ${v.length} Zeichen]` : "[redacted]";
    } else if (v && typeof v === "object") {
      out[key] = redact(v);
    } else {
      out[key] = v;
    }
  }
  return out;
}

function createLogger({ debug = false } = {}) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const logFile = path.join(LOG_DIR, `collector-${new Date().toISOString().slice(0, 10)}.log`);

  function write(level, message) {
    const line = `[${new Date().toISOString()}] [${level}] ${message}`;
    (level === "ERROR" ? console.error : console.log)(line);
    try {
      fs.appendFileSync(logFile, line + "\n");
    } catch {
      // Logdatei nicht schreibbar (z. B. Berechtigungen) — Konsolenausgabe
      // bleibt trotzdem erhalten, kein harter Fehler nur wegen Logging.
    }
  }

  return {
    info: (msg) => write("INFO", msg),
    warn: (msg) => write("WARN", msg),
    error: (msg) => write("ERROR", msg),
    debug: (msg) => {
      if (debug) write("DEBUG", msg);
    },
    logFile,
  };
}

module.exports = { createLogger, redact };
