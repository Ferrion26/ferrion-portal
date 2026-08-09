import versions from "../../../collector/versions.json";

// Bekannte Collector-Versionen (siehe collector/versions.json, gepflegt bei
// jeder Änderung von collector/version.js) — Grundlage für die
// Versions-Baseline-Auswahl im Admin-Bereich, damit die Mindestversion aus
// einer Liste gewählt statt frei getippt wird (Tippfehler würden sonst die
// Warnung für veraltete Collector unbemerkt außer Kraft setzen).
export interface CollectorVersionInfo {
  version: string;
  releasedAt: string;
  notes: string;
}

export const KNOWN_COLLECTOR_VERSIONS: CollectorVersionInfo[] = versions;
