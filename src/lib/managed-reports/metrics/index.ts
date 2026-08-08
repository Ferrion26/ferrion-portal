import { MetricDefinition } from "./types";
import { OCEANPROTECT_METRICS } from "./oceanprotect";

export * from "./types";

// Der einzige Ort, den ein neues Produkt ergänzen muss, damit Aggregation
// und PDF-Template automatisch mitziehen: neue Datei metrics/<slug>.ts
// anlegen und hier unter dem passenden productSlug (siehe
// src/app/produkte/products-data.ts) registrieren.
const METRIC_DEFINITIONS: Record<string, MetricDefinition[]> = {
  oceanprotect: OCEANPROTECT_METRICS,
};

export function getMetricDefinitions(productSlug: string): MetricDefinition[] {
  return METRIC_DEFINITIONS[productSlug] ?? [];
}
