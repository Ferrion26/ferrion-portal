import { describe, it, expect } from "vitest";
import { deriveStatus, buildExecutiveSummary, buildRecommendations, buildBannerHighlights } from "./reportNarrative";
import { QuarterSummaryEntry } from "./aggregate";

function entry(overrides: Partial<QuarterSummaryEntry> & Pick<QuarterSummaryEntry, "key" | "value">): QuarterSummaryEntry {
  return {
    label: { de: overrides.key, en: overrides.key },
    format: "count",
    section: "hardware",
    ...overrides,
  };
}

describe("deriveStatus", () => {
  it("returns neutral when trendGood is not set", () => {
    expect(deriveStatus(entry({ key: "dedup_ratio", value: 2, format: "ratio" }))).toBe("neutral");
  });

  it("applies default up-thresholds for percent metrics", () => {
    const base = { key: "backup_success_rate", format: "percent" as const, trendGood: "up" as const };
    expect(deriveStatus(entry({ ...base, value: 99.5 }))).toBe("good");
    expect(deriveStatus(entry({ ...base, value: 97 }))).toBe("warning");
    expect(deriveStatus(entry({ ...base, value: 50 }))).toBe("critical");
  });

  it("applies default down-thresholds for percent metrics (lower is better)", () => {
    const base = { key: "controller_cpu_usage_avg", format: "percent" as const, trendGood: "down" as const };
    expect(deriveStatus(entry({ ...base, value: 40 }))).toBe("good");
    expect(deriveStatus(entry({ ...base, value: 70 }))).toBe("warning");
    expect(deriveStatus(entry({ ...base, value: 95 }))).toBe("critical");
  });

  it("honors custom statusThresholds over the defaults", () => {
    const withCustom = entry({
      key: "custom_metric",
      format: "percent",
      trendGood: "up",
      value: 92,
      statusThresholds: { good: 90, warning: 80 },
    });
    expect(deriveStatus(withCustom)).toBe("good");
  });

  it("treats a zero count as good and a nonzero count as warning by default", () => {
    const base = { key: "disks_faulty", format: "count" as const, trendGood: "down" as const };
    expect(deriveStatus(entry({ ...base, value: 0 }))).toBe("good");
    expect(deriveStatus(entry({ ...base, value: 2 }))).toBe("warning");
  });

  it("escalates to critical for keys matching the severe-key hints", () => {
    expect(deriveStatus(entry({ key: "alerts_critical", format: "count", trendGood: "down", value: 1 }))).toBe("critical");
    expect(deriveStatus(entry({ key: "ransomware_infected_copies", format: "count", trendGood: "down", value: 1 }))).toBe(
      "critical"
    );
  });

  it("escalates to critical when severeIfNonZero is set, even without a matching key hint", () => {
    expect(
      deriveStatus(entry({ key: "dme_iq_disabled", format: "count", trendGood: "down", value: 1, severeIfNonZero: true }))
    ).toBe("critical");
    expect(
      deriveStatus(entry({ key: "dme_iq_disabled", format: "count", trendGood: "down", value: 0, severeIfNonZero: true }))
    ).toBe("good");
  });
});

describe("buildExecutiveSummary", () => {
  it("reports stable operation with no issues", () => {
    const summary = buildExecutiveSummary(
      [entry({ key: "disks_faulty", format: "count", trendGood: "down", value: 0 })],
      "de"
    );
    expect(summary.headline).toBe("Stabiler Betrieb");
    expect(summary.issueCount).toBe(0);
    expect(summary.text).toContain("ohne besondere Auffälligkeiten");
  });

  it("reports degraded operation when a critical metric is present", () => {
    const summary = buildExecutiveSummary(
      [entry({ key: "alerts_critical", format: "count", trendGood: "down", value: 3 })],
      "de"
    );
    expect(summary.headline).toBe("Eingeschränkter Betrieb");
    expect(summary.issueCount).toBe(1);
  });

  it("includes system availability in the summary text when present", () => {
    const summary = buildExecutiveSummary(
      [entry({ key: "system_availability", format: "percent", trendGood: "up", value: 99.9 })],
      "de"
    );
    expect(summary.text).toContain("Systemverfügbarkeit");
  });

  it("uses singular phrasing for exactly one issue", () => {
    const summary = buildExecutiveSummary(
      [entry({ key: "fans_faulty", format: "count", trendGood: "down", value: 1 })],
      "de"
    );
    expect(summary.text).toContain("1 Punkt benötigt Aufmerksamkeit");
  });
});

describe("buildRecommendations", () => {
  it("returns the no-recommendations message when nothing is flagged", () => {
    const recs = buildRecommendations([entry({ key: "disks_faulty", format: "count", trendGood: "down", value: 0 })], "de");
    expect(recs).toHaveLength(1);
    expect(recs[0].status).toBe("good");
  });

  it("sorts flagged metrics with critical before warning", () => {
    const recs = buildRecommendations(
      [
        entry({ key: "fans_faulty", format: "count", trendGood: "down", value: 1 }), // warning
        entry({ key: "alerts_critical", format: "count", trendGood: "down", value: 1 }), // critical
      ],
      "de"
    );
    expect(recs[0].status).toBe("critical");
    expect(recs[1].status).toBe("warning");
  });

  it("caps the list at 5 with an overflow note", () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      entry({ key: `fault_${i}`, format: "count", trendGood: "down", value: 1 })
    );
    const recs = buildRecommendations(entries, "de");
    expect(recs).toHaveLength(6); // 5 shown + 1 overflow note
    expect(recs[5].text).toContain("2 weitere");
  });
});

describe("buildBannerHighlights", () => {
  it("prioritizes issues over headline metrics", () => {
    const highlights = buildBannerHighlights(
      [
        entry({ key: "protected_capacity_tb", format: "tb", headline: true, value: 10 }),
        entry({ key: "disks_faulty", format: "count", trendGood: "down", value: 2 }),
      ],
      "de"
    );
    expect(highlights[0].entry.key).toBe("disks_faulty");
    expect(highlights[0].status).toBe("warning");
  });

  it("pads with headline metrics when there are no issues", () => {
    const highlights = buildBannerHighlights(
      [entry({ key: "protected_capacity_tb", format: "tb", headline: true, value: 10 })],
      "de"
    );
    expect(highlights).toHaveLength(1);
    expect(highlights[0].entry.key).toBe("protected_capacity_tb");
  });

  it("never returns more than 3 highlights", () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      entry({ key: `fault_${i}`, format: "count", trendGood: "down", value: 1 })
    );
    expect(buildBannerHighlights(entries, "de")).toHaveLength(3);
  });
});
