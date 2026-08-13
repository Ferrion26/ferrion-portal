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

// Grober, whitespace-/case-toleranter Teilstring-Abgleich statt eines
// Versions-Parsers — Huawei-Versionsstrings (z. B. "V700R001C20SPH106")
// folgen keinem einfachen numerischen Schema, ein selbstgebauter Parser
// wäre fragiler als ein einfacher Abgleich gegen die gepflegten
// Baseline-Einträge (siehe collectorVersion.ts, das für ein anderes,
// tatsächlich numerisches Versionsformat gedacht ist und hier NICHT passt).
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
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

  const normInstalled = normalize(installedVersion);
  const current = policy.softwareVersions.find((v) => {
    const normEntry = normalize(v.versionNumber);
    return normEntry.includes(normInstalled) || normInstalled.includes(normEntry);
  });

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
