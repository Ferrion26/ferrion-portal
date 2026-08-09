import { QuarterSummaryEntry } from "./aggregate";

// Shared value formatting — used by both the PDF template and the
// narrative/recommendation text so a number reads identically everywhere
// in the report.
export function formatValue(entry: Pick<QuarterSummaryEntry, "format" | "value" | "unit">, locale: "de" | "en") {
  const n = (digits: number) =>
    entry.value.toLocaleString(locale === "de" ? "de-AT" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
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
