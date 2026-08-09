// Calendar-period helpers (UTC-based, since periods are stored as plain
// DateTime boundaries, not tied to a customer timezone). Reports can span a
// month, quarter, half-year, or year — chosen per report generation, not a
// fixed cadence (see ReportPeriodType in prisma/schema.prisma).

export type PeriodType = "MONTH" | "QUARTER" | "HALF_YEAR" | "YEAR";

const PERIOD_MONTHS: Record<PeriodType, number> = {
  MONTH: 1,
  QUARTER: 3,
  HALF_YEAR: 6,
  YEAR: 12,
};

// The period of `periodType` that `now` currently falls in, still in
// progress. Only meant for admin preview reports (a collector just set up
// mid-period has no data for the last *completed* period yet) — never used
// by the automatic cron generation, which always reports on a finished period.
export function getCurrentPeriod(periodType: PeriodType, now = new Date()) {
  const span = PERIOD_MONTHS[periodType];
  const startMonth = Math.floor(now.getUTCMonth() / span) * span;
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), startMonth, 1));
  const periodEnd = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + span, 1));
  return { periodStart, periodEnd };
}

// The most recently *completed* period of `periodType` relative to `now`.
export function getMostRecentCompletedPeriod(periodType: PeriodType, now = new Date()) {
  const { periodStart: currentStart } = getCurrentPeriod(periodType, now);
  const span = PERIOD_MONTHS[periodType];
  const periodEnd = currentStart;
  const periodStart = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() - span, 1));
  return { periodStart, periodEnd };
}

export function periodLabel(periodType: PeriodType, periodStart: Date, locale: "de" | "en" = "de") {
  const year = periodStart.getUTCFullYear();
  switch (periodType) {
    case "MONTH": {
      const formatter = new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-US", { month: "long", timeZone: "UTC" });
      return `${formatter.format(periodStart)} ${year}`;
    }
    case "QUARTER":
      return `Q${Math.floor(periodStart.getUTCMonth() / 3) + 1} ${year}`;
    case "HALF_YEAR":
      return `H${periodStart.getUTCMonth() < 6 ? 1 : 2} ${year}`;
    case "YEAR":
      return `${year}`;
  }
}

// Back-compat aliases — the automatic cron (generate-quarterly-reports)
// always reports on a finished quarter and keeps using these directly.
export function getMostRecentCompletedQuarter(now = new Date()) {
  return getMostRecentCompletedPeriod("QUARTER", now);
}
export function getCurrentQuarter(now = new Date()) {
  return getCurrentPeriod("QUARTER", now);
}
export function quarterLabel(periodStart: Date) {
  return periodLabel("QUARTER", periodStart);
}
