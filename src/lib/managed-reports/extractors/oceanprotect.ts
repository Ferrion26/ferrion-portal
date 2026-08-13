import { MetricExtractor } from "./types";

// Noch keine Extraktoren nötig — alle heutigen OceanProtect-Kennzahlen
// werden bereits vom Collector berechnet (collector/adapters/oceanprotect.js).
// Neue, aus meta.rawEndpoints rückwirkend berechenbare Kennzahlen kommen
// hier rein, sobald gebraucht.
export const OCEANPROTECT_EXTRACTORS: MetricExtractor[] = [];
