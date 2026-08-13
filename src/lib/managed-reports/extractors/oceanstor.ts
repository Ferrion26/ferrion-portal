import { MetricExtractor } from "./types";

// Noch keine Extraktoren nötig — alle heutigen OceanStor-Kennzahlen werden
// bereits vom Collector berechnet (collector/adapters/oceanstor.js). Neue,
// aus meta.rawEndpoints rückwirkend berechenbare Kennzahlen kommen hier
// rein, sobald gebraucht.
export const OCEANSTOR_EXTRACTORS: MetricExtractor[] = [];
