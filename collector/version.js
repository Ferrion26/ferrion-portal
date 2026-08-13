// Collector-Version — bei jeder inhaltlichen Änderung an einem Adapter oder
// an index.js von Hand erhöhen (einfaches MAJOR.MINOR.PATCH, kein volles
// SemVer nötig). Der Build-Teil wird beim Packaging (scripts/package-collector.js)
// automatisch aus dem Git-Commit ergänzt (build.json neben dieser Datei in
// der gepackten .zip) — so lässt sich ein an einem Kundenstandort laufendes
// Paket eindeutig auf einen Codestand zurückführen. Ohne Packaging (Skript
// direkt aus dem Repo heraus gestartet) bleibt der Build-Teil "dev".
const fs = require("fs");
const path = require("path");

const VERSION = "1.12.0";

let build = "dev";
try {
  const buildInfo = JSON.parse(fs.readFileSync(path.join(__dirname, "build.json"), "utf8"));
  if (buildInfo.build) build = String(buildInfo.build);
} catch {
  // build.json existiert nur in gepackten Releases (siehe oben) — beim
  // direkten Lauf aus dem Repo ist das kein Fehler.
}

module.exports = { VERSION, BUILD: build, FULL: `${VERSION}+${build}` };
