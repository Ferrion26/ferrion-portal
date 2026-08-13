// Eine Kennzahl, die das Portal selbst aus bereits gespeicherten
// meta.rawEndpoints berechnet — im Unterschied zu MetricDefinition
// (src/lib/managed-reports/metrics/types.ts), die nur beschreibt, wie eine
// vom Collector fertig berechnete Kennzahl angezeigt wird. Ein Extractor
// bringt seine Berechnung selbst mit, damit neue Kennzahlen aus bereits
// erfassten Rohdaten entstehen können, ohne dass ein neuer Collector nötig
// ist — vorausgesetzt, der benötigte Endpunkt wird schon abgefragt.
export interface MetricExtractor {
  // Muss produktweit eindeutig sein — weder ein von collector/adapters/*.js
  // gesendeter Kennzahl-Key noch der Key eines anderen Extractors desselben
  // Produkts (siehe Kollisions-Check in index.ts). Beide Quellen schreiben
  // in dieselbe ManagedServiceMetric.metricKey-Spalte.
  key: string;
  // rawEndpoints-Schlüssel (siehe captureRaw in den Collector-Adaptern), die
  // extract() braucht — rein informativ/für einen günstigen Vorab-Check,
  // ob überhaupt genug Rohdaten für diesen Extractor vorliegen.
  requiresEndpoints: string[];
  // null, wenn die benötigten Rohdaten in diesem Payload fehlen (z. B. bei
  // einer älteren Ingestion von vor Einführung des jeweiligen Endpunkts) —
  // kein Fehler, einfach kein Wert für diesen Lauf.
  extract(rawEndpoints: Record<string, unknown>): { value: number; unit?: string } | null;
}
