import { describe, it, expect } from "vitest";
import { formatValue, formatDateTime, daysToThreshold } from "./reportFormat";

describe("formatValue", () => {
  it("formats percent with one decimal and a % sign", () => {
    expect(formatValue({ format: "percent", value: 83 }, "de")).toBe("83,0 %");
    expect(formatValue({ format: "percent", value: 83 }, "en")).toBe("83.0 %");
  });

  it("formats tb/gb with one decimal and a unit suffix", () => {
    expect(formatValue({ format: "tb", value: 12.4 }, "de")).toBe("12,4 TB");
    expect(formatValue({ format: "gb", value: 512 }, "de")).toBe("512,0 GB");
  });

  it("formats ratio with two decimals and a × sign", () => {
    expect(formatValue({ format: "ratio", value: 2.4 }, "de")).toBe("2,40×");
  });

  it("formats count as a whole number with no decimals", () => {
    expect(formatValue({ format: "count", value: 5 }, "de")).toBe("5");
    expect(formatValue({ format: "count", value: 0 }, "de")).toBe("0");
  });
});

describe("formatDateTime", () => {
  it("renders in the Europe/Vienna timezone regardless of the runtime timezone", () => {
    // 23:30 UTC on 2026-01-15 is 00:30 the next day in Vienna (UTC+1 in winter).
    const winter = new Date("2026-01-15T23:30:00.000Z");
    expect(formatDateTime(winter, "de")).toBe("16.01.2026, 00:30");
  });

  it("accounts for daylight saving time in summer (UTC+2)", () => {
    const summer = new Date("2026-07-15T10:00:00.000Z");
    expect(formatDateTime(summer, "de")).toBe("15.07.2026, 12:00");
  });

  it("accepts an ISO string as well as a Date", () => {
    expect(formatDateTime("2026-07-15T10:00:00.000Z", "de")).toBe("15.07.2026, 12:00");
  });
});

describe("daysToThreshold", () => {
  const day = (n: number) => new Date(2026, 0, 1 + n).toISOString();

  it("projects forward using the least-squares slope of a linear trend", () => {
    const points = [
      { recordedAt: day(0), value: 10 },
      { recordedAt: day(1), value: 20 },
      { recordedAt: day(2), value: 30 },
    ];
    // Slope 10%/day, last value 30% -> 5 days to reach 80%.
    expect(daysToThreshold(points, 80)).toBe(5);
  });

  it("returns null when the trend is flat or decreasing", () => {
    const flat = [
      { recordedAt: day(0), value: 40 },
      { recordedAt: day(1), value: 40 },
      { recordedAt: day(2), value: 40 },
    ];
    expect(daysToThreshold(flat, 80)).toBeNull();

    const decreasing = [
      { recordedAt: day(0), value: 50 },
      { recordedAt: day(1), value: 40 },
      { recordedAt: day(2), value: 30 },
    ];
    expect(daysToThreshold(decreasing, 80)).toBeNull();
  });

  it("returns null when the threshold is already reached", () => {
    const points = [
      { recordedAt: day(0), value: 70 },
      { recordedAt: day(1), value: 90 },
    ];
    expect(daysToThreshold(points, 80)).toBeNull();
  });

  it("returns null with fewer than 2 points", () => {
    expect(daysToThreshold([{ recordedAt: day(0), value: 10 }], 80)).toBeNull();
    expect(daysToThreshold([], 80)).toBeNull();
  });
});
