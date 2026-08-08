// Baut ein Installationspaket des Collectors (collector/) für die Weitergabe
// an einen Kunden-Standort: dist/ferrion-collector.zip, ohne ein eventuell
// vorhandenes config.json mit echten Zugangsdaten.
//
// Nutzung: npm run collector:package
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const collectorDir = path.join(root, "collector");
const stageDir = path.join(root, "dist", "ferrion-collector");
const zipPath = path.join(root, "dist", "ferrion-collector.zip");

if (process.platform !== "win32") {
  console.error("Dieses Skript nutzt PowerShells Compress-Archive und läuft aktuell nur unter Windows.");
  process.exit(1);
}

fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
fs.mkdirSync(stageDir, { recursive: true });

for (const entry of fs.readdirSync(collectorDir, { withFileTypes: true })) {
  if (entry.name === "config.json") continue; // enthält echte Zugangsdaten, nicht weitergeben
  const src = path.join(collectorDir, entry.name);
  const dest = path.join(stageDir, entry.name);
  fs.cpSync(src, dest, { recursive: true });
}

execFileSync(
  "powershell",
  ["-NoProfile", "-Command", `Compress-Archive -Path "${stageDir}\\*" -DestinationPath "${zipPath}" -Force`],
  { stdio: "inherit" }
);

fs.rmSync(stageDir, { recursive: true, force: true });
console.log("Installationspaket erstellt:", zipPath);
