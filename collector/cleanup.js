// Räumt alte Export-Dateien im Air-Gap-Modus (--export-dir) auf — ohne das
// läuft das Exportverzeichnis auf Dauer voll, da jeder Lauf pro Gerät eine
// neue metrics-<slug>-<timestamp>.json schreibt (siehe writeExportFile in
// index.js), aber nichts davon je wieder löscht.
//
// Drei unabhängig kombinierbare, optionale Grenzen — logrotate-artig
// nacheinander angewendet, jede auf dem nach der vorigen Regel verbliebenen
// Rest (älteste Dateien zuerst betroffen):
//   1. maxAgeDays   — alles über diesem Alter wird gelöscht, unabhängig von Anzahl/Größe.
//   2. maxCount     — danach älteste löschen, bis höchstens N Dateien übrig sind.
//   3. maxSizeMB    — danach älteste löschen, bis die Gesamtgröße das Limit unterschreitet.
const fs = require("fs");
const path = require("path");

const EXPORT_FILE_PATTERN = /^metrics-.*\.json$/;

function listExportFiles(exportDir) {
  if (!fs.existsSync(exportDir)) return [];
  return fs
    .readdirSync(exportDir)
    .filter((name) => EXPORT_FILE_PATTERN.test(name))
    .map((name) => {
      const filePath = path.join(exportDir, name);
      const stat = fs.statSync(filePath);
      return { name, filePath, mtimeMs: stat.mtimeMs, sizeBytes: stat.size };
    })
    .sort((a, b) => a.mtimeMs - b.mtimeMs); // älteste zuerst
}

function deleteFiles(files, log) {
  for (const f of files) {
    fs.unlinkSync(f.filePath);
    log?.info(`Aufräumen: ${f.name} gelöscht.`);
  }
}

// options: { maxAgeDays?: number, maxCount?: number, maxSizeMB?: number }
// Gibt zurück, wie viele Dateien insgesamt gelöscht wurden (für den
// Abschluss-Log-Eintrag in index.js).
function cleanupExports(exportDir, options, log) {
  let files = listExportFiles(exportDir);
  const startCount = files.length;
  let deletedCount = 0;

  if (options.maxAgeDays !== undefined) {
    const cutoff = Date.now() - options.maxAgeDays * 24 * 60 * 60 * 1000;
    const toDelete = files.filter((f) => f.mtimeMs < cutoff);
    deleteFiles(toDelete, log);
    deletedCount += toDelete.length;
    files = files.filter((f) => f.mtimeMs >= cutoff);
  }

  if (options.maxCount !== undefined && files.length > options.maxCount) {
    const excess = files.length - options.maxCount;
    const toDelete = files.slice(0, excess);
    deleteFiles(toDelete, log);
    deletedCount += toDelete.length;
    files = files.slice(excess);
  }

  if (options.maxSizeMB !== undefined) {
    const maxBytes = options.maxSizeMB * 1024 * 1024;
    let totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
    const toDelete = [];
    let i = 0;
    while (totalBytes > maxBytes && i < files.length) {
      toDelete.push(files[i]);
      totalBytes -= files[i].sizeBytes;
      i += 1;
    }
    deleteFiles(toDelete, log);
    deletedCount += toDelete.length;
    files = files.slice(i);
  }

  if (deletedCount > 0) {
    log?.info(`Aufräumen abgeschlossen: ${deletedCount} von ${startCount} Export-Dateien gelöscht, ${files.length} verbleiben.`);
  }
  return deletedCount;
}

module.exports = { cleanupExports, listExportFiles };
