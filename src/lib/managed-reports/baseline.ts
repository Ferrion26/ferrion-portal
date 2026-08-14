import { prisma } from "@/lib/prisma";

export interface BaselineFeature {
  title: string;
  description?: string;
}

export interface BaselineIssue {
  ticketNumber?: string;
  title: string;
  description?: string;
  severity?: string;
  solution?: string;
}

export type VersionBaselineStatus = "current" | "outdated" | "unknown";

export interface VersionBaselineResult {
  status: VersionBaselineStatus;
  installedVersion?: string;
  recommendedVersion?: string;
  // Nur bei status "outdated" befüllt — kumulierte New/Modified Features
  // und Resolved Issues aller Baseline-Versionen zwischen der installierten
  // (exklusiv) und der empfohlenen (inklusiv).
  pendingFeatures: BaselineFeature[];
  pendingFixes: BaselineIssue[];
}

// Lädt die Baseline-Policy für ein Produkt inkl. aller Versionen, sortiert
// nach Veröffentlichungsdatum (älteste zuerst) — Grundlage für den
// "zwischen installierter und empfohlener Version liegende Fixes/Features"-
// Vergleich in evaluateVersionStatus(). Gibt null zurück, wenn (noch) keine
// Policy für das Produkt existiert.
export async function getBaselineForProduct(productSlug: string) {
  return prisma.baselinePolicy.findFirst({
    where: { productSlug },
    include: { softwareVersions: { orderBy: { publicationDate: "asc" } } },
  });
}

type Policy = NonNullable<Awaited<ReturnType<typeof getBaselineForProduct>>>;

// Der vom Collector gemeldete deviceSoftwareVersion-Rohstring folgt NICHT
// demselben Format wie der gepflegte Baseline-Eintrag — z. B. meldet ein
// echtes NetApp-System "NetApp Release 9.15.1P13: Tue Jul 15 14:07:45 UTC
// 2025", während die Baseline nur "ONTAP 9.15.1P13" führt (Huawei analog:
// Baseline "OceanStor Series V700R001C20SPH106" vs. Collector-Rohwert wie
// "V700R001C20SPC100 SPH106"). Ein reiner Teilstring-Vergleich der ganzen
// Strings würde hier scheitern. Stattdessen wird aus beiden Strings der
// strukturierte Versions-Code extrahiert (Huawei-Schema V<n>R<n>C<n>[SP<L><n>]
// oder punktierte Schemata wie NetApps "9.15.1P13"/Huaweis "8.10.0") und nur
// diese Codes verglichen — kein selbstgebauter Versions-ORDNER (siehe
// publicationDate dafür), nur ein robusterer Identitäts-Abgleich als
// "ein String enthält den anderen".
const VERSION_TOKEN_PATTERNS = [
  /V\d+R\d+C\d+(?:SP[A-Z]\d+)?/gi, // Huawei, z. B. V700R001C20SPH106
  /\d+\.\d+\.\d+(?:P\d+)?/g, // punktiert, z. B. 9.15.1P13, 8.10.0
];

function extractVersionTokens(s: string): string[] {
  const tokens: string[] = [];
  for (const pattern of VERSION_TOKEN_PATTERNS) {
    const matches = s.match(pattern);
    if (matches) tokens.push(...matches.map((m) => m.toLowerCase()));
  }
  return tokens;
}

function versionsMatch(baselineVersionNumber: string, installed: string): boolean {
  const baselineTokens = extractVersionTokens(baselineVersionNumber);
  const installedTokens = extractVersionTokens(installed);
  if (baselineTokens.length === 0 || installedTokens.length === 0) {
    // Kein strukturierter Code in einem der beiden Strings gefunden (z. B.
    // ein exotisches Versionsformat) — Rückfall auf einen einfachen,
    // whitespace-/case-toleranten Teilstring-Abgleich der Gesamtstrings.
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    const a = norm(baselineVersionNumber);
    const b = norm(installed);
    return a.includes(b) || b.includes(a);
  }
  return baselineTokens.some((t) => installedTokens.includes(t));
}

// Vergleicht die vom Collector gemeldete Geräte-Version (subscription.
// deviceSoftwareVersion) gegen die Baseline-Policy des Produkts. Gibt
// bewusst "unknown" zurück (statt eines erzwungenen "outdated"), wenn die
// installierte Version fehlt oder zu keinem bekannten Baseline-Eintrag
// passt — eine unbegründete "veraltet"-Behauptung wäre irreführender als
// ein neutraler Hinweis. Gibt null zurück, wenn die Policy keine als
// "empfohlen" markierte Version hat (nichts zum Vergleichen).
export function evaluateVersionStatus(installedVersion: string | null | undefined, policy: Policy | null): VersionBaselineResult | null {
  if (!policy || policy.softwareVersions.length === 0) return null;
  const recommended = policy.softwareVersions.find((v) => v.recommended);
  if (!recommended) return null;

  if (!installedVersion) {
    return { status: "unknown", recommendedVersion: recommended.versionNumber, pendingFeatures: [], pendingFixes: [] };
  }

  const current = policy.softwareVersions.find((v) => versionsMatch(v.versionNumber, installedVersion));

  if (!current) {
    return { status: "unknown", installedVersion, recommendedVersion: recommended.versionNumber, pendingFeatures: [], pendingFixes: [] };
  }

  if (current.id === recommended.id) {
    return { status: "current", installedVersion, recommendedVersion: recommended.versionNumber, pendingFeatures: [], pendingFixes: [] };
  }

  const currentDate = current.publicationDate?.getTime() ?? -Infinity;
  const recommendedDate = recommended.publicationDate?.getTime() ?? Infinity;
  if (currentDate >= recommendedDate) {
    // Installierte Version ist gleich alt oder neuer als die empfohlene
    // (z. B. fehlende Daten, oder ein Admin hat eine ältere Version als
    // "empfohlen" markiert) — nichts als ausstehend zu melden.
    return { status: "current", installedVersion, recommendedVersion: recommended.versionNumber, pendingFeatures: [], pendingFixes: [] };
  }

  const between = policy.softwareVersions.filter((v) => {
    const d = v.publicationDate?.getTime() ?? -Infinity;
    return d > currentDate && d <= recommendedDate;
  });

  const pendingFeatures: BaselineFeature[] = [];
  const pendingFixes: BaselineIssue[] = [];
  for (const v of between) {
    pendingFeatures.push(...((v.newFeatures as BaselineFeature[] | null) ?? []), ...((v.modifiedFeatures as BaselineFeature[] | null) ?? []));
    pendingFixes.push(...((v.resolvedIssues as BaselineIssue[] | null) ?? []));
  }

  return { status: "outdated", installedVersion, recommendedVersion: recommended.versionNumber, pendingFeatures, pendingFixes };
}
