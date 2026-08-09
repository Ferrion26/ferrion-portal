import { describe, it, expect } from "vitest";
import { getCurrentPeriod, getMostRecentCompletedPeriod, periodLabel } from "./quarter";

// Alle Zeitpunkte in UTC angeben, da die Perioden-Logik bewusst UTC-basiert
// ist (siehe Kommentar in quarter.ts) — sonst würde ein Test in einer
// anderen Zeitzone laufender CI/Entwicklungsumgebung flackern.
const AUG_9_2026 = new Date(Date.UTC(2026, 7, 9, 12, 0, 0));

describe("getCurrentPeriod", () => {
  it("returns the current calendar quarter", () => {
    const { periodStart, periodEnd } = getCurrentPeriod("QUARTER", AUG_9_2026);
    expect(periodStart.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });

  it("returns the current calendar month", () => {
    const { periodStart, periodEnd } = getCurrentPeriod("MONTH", AUG_9_2026);
    expect(periodStart.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("returns the current half-year", () => {
    const { periodStart, periodEnd } = getCurrentPeriod("HALF_YEAR", AUG_9_2026);
    expect(periodStart.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("returns the current year", () => {
    const { periodStart, periodEnd } = getCurrentPeriod("YEAR", AUG_9_2026);
    expect(periodStart.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("getMostRecentCompletedPeriod", () => {
  it("returns the previous quarter, not the in-progress one", () => {
    const { periodStart, periodEnd } = getMostRecentCompletedPeriod("QUARTER", AUG_9_2026);
    expect(periodStart.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("handles a year boundary correctly", () => {
    const jan15 = new Date(Date.UTC(2026, 0, 15));
    const { periodStart, periodEnd } = getMostRecentCompletedPeriod("QUARTER", jan15);
    expect(periodStart.toISOString()).toBe("2025-10-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns the previous month", () => {
    const { periodStart, periodEnd } = getMostRecentCompletedPeriod("MONTH", AUG_9_2026);
    expect(periodStart.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(periodEnd.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });
});

describe("periodLabel", () => {
  it("formats a quarter label", () => {
    expect(periodLabel("QUARTER", new Date(Date.UTC(2026, 6, 1)), "de")).toBe("Q3 2026");
  });

  it("formats a half-year label", () => {
    expect(periodLabel("HALF_YEAR", new Date(Date.UTC(2026, 0, 1)), "de")).toBe("H1 2026");
    expect(periodLabel("HALF_YEAR", new Date(Date.UTC(2026, 6, 1)), "de")).toBe("H2 2026");
  });

  it("formats a year label", () => {
    expect(periodLabel("YEAR", new Date(Date.UTC(2026, 0, 1)), "de")).toBe("2026");
  });

  it("formats a month label in German and English", () => {
    const date = new Date(Date.UTC(2026, 7, 1));
    expect(periodLabel("MONTH", date, "de")).toBe("August 2026");
    expect(periodLabel("MONTH", date, "en")).toBe("August 2026");
  });
});
