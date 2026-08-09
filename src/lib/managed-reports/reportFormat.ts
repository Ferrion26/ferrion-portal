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
