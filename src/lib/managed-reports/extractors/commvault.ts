import { MetricExtractor } from "./types";

// Noch keine Extraktoren nötig — alle heutigen Commvault-Kennzahlen werden
// bereits vom Collector berechnet (collector/adapters/commvault.js). Neue,
// aus meta.rawEndpoints rückwirkend berechenbare Kennzahlen kommen hier
// rein, sobald gebraucht.
export const COMMVAULT_EXTRACTORS: MetricExtractor[] = [];
