import { QuarterSummaryEntry } from "./aggregate";

// Shared value formatting — used by both the PDF template and the
// narrative/recommendation text so a number reads identically everywhere
// in the report.
export function formatValue(entry: Pick<QuarterSummaryEntry, "format" | "value" | "unit">, locale: "de" | "en") {
  // "de-DE" statt "de-AT": Austrians Tausendertrennzeichen ist laut ICU ein
  // geschütztes Leerzeichen (U+00A0) statt eines Punkts — react-pdfs
  // Textumbruch behandelt das nicht als unteilbar und bricht die Zahl mitten
  // in der Zahl um (z. B. "1 554,3" → "1" / "554,3" auf zwei Zeilen). "de-DE"
  // verwendet einen echten Punkt, der nie umbricht und optisch identisch zur
  // in Österreich gebräuchlichen Schreibweise ist.
  const n = (digits: number) =>
    entry.value.toLocaleString(locale === "de" ? "de-DE" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  switch (entry.format) {
    case "percent":
      return `${n(1)} %`;
    case "tb":
      return `${n(1)} TB`;
    case "gb":
      return `${n(1)} GB`;
    case "ratio":
      return `${n(2)}×`;
    case "count":
      return n(0);
  }
}

// Erstellungszeitpunkt inkl. Uhrzeit — formatDate() in src/lib/utils.ts
// zeigt bewusst nur das Datum (wird an vielen Stellen für reine
// Kalenderdaten verwendet); der Berichts-Erstellzeitpunkt soll dagegen auf
// die Minute genau nachvollziehbar sein.
// Ohne explizite timeZone verwendet Intl die Zeitzone der Laufzeitumgebung
// (auf Vercel: UTC) statt der des Kunden — das war die Ursache für die um
// 1–2 Stunden (je nach Sommer-/Winterzeit) verschobenen Uhrzeiten im Bericht.
export function formatDateTime(date: Date | string, locale: "de" | "en" = "de") {
  return new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Vienna",
  }).format(new Date(date));
}

// Vereinheitlicht Komponenten-Kennungen wie "PSU 0"/"PSU0" oder "BBU 1"/
// "BBU1" auf dieselbe Schreibweise ohne Leerzeichen. Der Collector baut
// diese Strings aus rohen Gerätefeldern zusammen (mal mit, mal ohne
// Leerzeichen, je nach Feld) — hier statt am Collector korrigiert, damit
// auch bereits erfasste (ältere) Daten einheitlich angezeigt werden.
// Nur kurze GROSSBUCHSTABEN-Kürzel (2–5 Zeichen, z. B. PSU/BBU/CTE/SFP)
// werden angefasst, damit echte mehrteilige Namen wie "Fan Module 3"
// (gemischte Groß-/Kleinschreibung) ihr Leerzeichen behalten.
export function normalizeComponentLabel(text: string): string {
  return text.replace(/\b([A-Z]{2,5})\s+(\d+)/g, "$1$2");
}

// Least-Squares-Steigung (Wert-Einheit pro Tag) über die Kapazitäts-
// Trendpunkte — gemeinsame Grundlage für daysToThreshold() und
// trendGrowthPerDay() weiter unten. null, wenn weniger als 2 Punkte
// vorliegen oder alle Punkte denselben Zeitstempel haben.
function leastSquaresSlope(points: { recordedAt: string; value: number }[]): number | null {
  if (points.length < 2) return null;
  const t0 = new Date(points[0].recordedAt).getTime();
  const xs = points.map((p) => (new Date(p.recordedAt).getTime() - t0) / 86_400_000);
  const ys = points.map((p) => p.value);
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumXX = xs.reduce((a, x) => a + x * x, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;
  return (n * sumXY - sumX * sumY) / denominator;
}

// Einfache lineare Projektion über die Kapazitäts-Trendpunkte (kein
// eigener Forecast-Endpunkt am Gerät nötig) — Grundlage für die
// "Tage bis 80 %/100 %"-Anzeige über der Trendgrafik, wie sie das
// DataBackup-Dashboard selbst zeigt (dort serverseitig berechnet). Ab dem
// letzten Punkt bis zur Schwelle hochgerechnet. null, wenn die Schwelle
// bereits erreicht ist, der Trend fällt/stagniert (Steigung <= 0), oder
// weniger als 2 Punkte vorliegen.
export function daysToThreshold(points: { recordedAt: string; value: number }[], threshold: number): number | null {
  const slope = leastSquaresSlope(points);
  if (slope === null || slope <= 0) return null;

  const ys = points.map((p) => p.value);
  const lastValue = ys[ys.length - 1];
  if (lastValue >= threshold) return null;

  const t0 = new Date(points[0].recordedAt).getTime();
  const lastX = (new Date(points[points.length - 1].recordedAt).getTime() - t0) / 86_400_000;
  const thresholdX = lastX + (threshold - lastValue) / slope;
  return Math.max(0, Math.round(thresholdX - lastX));
}

// Durchschnittliche Änderung pro Tag (Wert-Einheit/Tag, z. B. Prozentpunkte/
// Tag) — zusätzliche Kennzahl neben der Trendgrafik ("Ø Wachstum"), damit
// die Karte nicht nur aus der Linie selbst besteht. null bei < 2 Punkten.
export function trendGrowthPerDay(points: { recordedAt: string; value: number }[]): number | null {
  return leastSquaresSlope(points);
}
