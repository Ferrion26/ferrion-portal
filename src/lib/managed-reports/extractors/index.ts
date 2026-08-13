import { MetricExtractor } from "./types";
import { getMetricDefinitions, getReportableProductSlugs } from "../metrics";
import { OCEANPROTECT_EXTRACTORS } from "./oceanprotect";
import { OCEANSTOR_EXTRACTORS } from "./oceanstor";
import { NETAPP_EXTRACTORS } from "./netapp";
import { FUSIONCOMPUTE_EXTRACTORS } from "./fusioncompute";

export * from "./types";

// Der einzige Ort, den ein neuer Extractor ergänzen muss: Datei unter
// extractors/<slug>.ts anlegen (oder eine bestehende erweitern) und hier
// registrieren — dieselben productSlug-Schlüssel wie in
// src/lib/managed-reports/metrics/index.ts.
const METRIC_EXTRACTORS: Record<string, MetricExtractor[]> = {
  oceanprotect: OCEANPROTECT_EXTRACTORS,
  "oceanstor-hybrid-flash": OCEANSTOR_EXTRACTORS,
  "netapp-aff": NETAPP_EXTRACTORS,
  "huawei-dcs": FUSIONCOMPUTE_EXTRACTORS,
};

// Extractor-Keys und vom Collector gesendete Kennzahl-Keys landen in
// derselben ManagedServiceMetric.metricKey-Spalte — eine Kollision würde
// den Collector-Wert stillschweigend überschreiben oder umgekehrt. Wird
// beim ersten Import geprüft (Server-Cold-Start), nicht erst zur Laufzeit
// eines einzelnen Ingests, damit ein Konfigurationsfehler sofort auffällt.
for (const slug of getReportableProductSlugs()) {
  const definitionKeys = new Set(getMetricDefinitions(slug).map((d) => d.key));
  const extractorKeys = new Set<string>();
  for (const extractor of METRIC_EXTRACTORS[slug] ?? []) {
    if (definitionKeys.has(extractor.key)) {
      throw new Error(
        `Extractor-Key "${extractor.key}" (Produkt "${slug}") kollidiert mit einer vom Collector gesendeten Kennzahl gleichen Namens.`
      );
    }
    if (extractorKeys.has(extractor.key)) {
      throw new Error(`Extractor-Key "${extractor.key}" (Produkt "${slug}") ist mehrfach registriert.`);
    }
    extractorKeys.add(extractor.key);
  }
}

export function getExtractors(productSlug: string): MetricExtractor[] {
  return METRIC_EXTRACTORS[productSlug] ?? [];
}

// Für scripts/backfill-metrics.ts: welches Produkt einen Extractor-Key
// besitzt, wird für den Rückwirkend-Lauf gebraucht (nur Subscriptions
// dieses Produkts kommen als Ziel infrage).
export function findExtractor(key: string): { productSlug: string; extractor: MetricExtractor } | null {
  for (const [productSlug, extractors] of Object.entries(METRIC_EXTRACTORS)) {
    const extractor = extractors.find((e) => e.key === key);
    if (extractor) return { productSlug, extractor };
  }
  return null;
}

export function runExtractors(
  productSlug: string,
  rawEndpoints: Record<string, unknown>
): { key: string; value: number; unit?: string }[] {
  const results: { key: string; value: number; unit?: string }[] = [];
  for (const extractor of getExtractors(productSlug)) {
    const result = extractor.extract(rawEndpoints);
    if (result) results.push({ key: extractor.key, value: result.value, unit: result.unit });
  }
  return results;
}
