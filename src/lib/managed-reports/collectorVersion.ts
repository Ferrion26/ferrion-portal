// Vergleich von Collector-Versionen (siehe collector/version.js) gegen eine
// global konfigurierbare Mindestversion (SiteSetting "collectorBaseline",
// siehe src/lib/settings.ts) — Grundlage für den Warnhinweis im Admin-Bereich
// bei veralteten Collector-Ständen.
//
// Format: "MAJOR.MINOR.PATCH" oder "MAJOR.MINOR.PATCH+build" (der Build-Teil
// nach "+" ist reine Provenienz, siehe collector/version.js, und fließt
// bewusst nicht in den Versionsvergleich ein).
function parseVersion(v: string): number[] | null {
  const core = v.split("+")[0];
  const parts = core.split(".").map((p) => Number(p));
  if (parts.length === 0 || parts.some((p) => !Number.isFinite(p))) return null;
  return parts;
}

/** -1 wenn a < b, 0 wenn gleich (oder unparsbar), 1 wenn a > b. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

/** true nur bei zwei gültigen, parsbaren Versionen mit current < minVersion. */
export function isCollectorOutdated(current: string | null | undefined, minVersion: string | null | undefined): boolean {
  if (!current || !minVersion) return false;
  return compareVersions(current, minVersion) < 0;
}
