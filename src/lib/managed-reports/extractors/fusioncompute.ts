import { MetricExtractor } from "./types";

// Noch keine Extraktoren nötig — alle heutigen Huawei-DCS/FusionCompute-
// Kennzahlen werden bereits vom Collector berechnet
// (collector/adapters/fusioncompute.js). Neue, aus meta.rawEndpoints
// rückwirkend berechenbare Kennzahlen kommen hier rein, sobald gebraucht.
export const FUSIONCOMPUTE_EXTRACTORS: MetricExtractor[] = [];
