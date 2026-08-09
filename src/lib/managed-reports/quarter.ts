// Calendar-quarter helpers (UTC-based, since periods are stored as plain
// DateTime boundaries, not tied to a customer timezone).

export function quarterLabel(periodStart: Date) {
  const quarter = Math.floor(periodStart.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${periodStart.getUTCFullYear()}`;
}

// The most recently *completed* calendar quarter relative to `now` — a
// quarterly report always looks back at a finished period, never the one
// still in progress.
export function getMostRecentCompletedQuarter(now = new Date()) {
  const currentQuarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
  const currentQuarterStart = new Date(Date.UTC(now.getUTCFullYear(), currentQuarterStartMonth, 1));
  const periodEnd = currentQuarterStart;
  const periodStart = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() - 3, 1));
  return { periodStart, periodEnd };
}

// The calendar quarter `now` currently falls in, still in progress. Only
// meant for admin preview reports (a collector just set up mid-quarter has
// no data for the last *completed* quarter yet) — never used by the
// automatic cron generation, which always reports on a finished quarter.
export function getCurrentQuarter(now = new Date()) {
  const currentQuarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), currentQuarterStartMonth, 1));
  const periodEnd = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + 3, 1));
  return { periodStart, periodEnd };
}
