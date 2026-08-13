import { MetricExtractor } from "./types";

// Noch keine Extraktoren nötig — alle heutigen NetApp-Kennzahlen werden
// bereits vom Collector berechnet (collector/adapters/netapp.js). Neue, aus
// meta.rawEndpoints rückwirkend berechenbare Kennzahlen kommen hier rein,
// sobald gebraucht.
export const NETAPP_EXTRACTORS: MetricExtractor[] = [];
