import { describe, it, expect } from "vitest";
import { compareVersions, isCollectorOutdated } from "./collectorVersion";

describe("compareVersions", () => {
  it("orders by major/minor/patch", () => {
    expect(compareVersions("1.2.0", "1.3.0")).toBe(-1);
    expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
    expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
  });

  it("ignores the build suffix", () => {
    expect(compareVersions("1.2.0+a1b2c3d", "1.2.0+dev")).toBe(0);
    expect(compareVersions("1.3.0+abc", "1.2.0")).toBe(1);
  });

  it("treats an unparsable version as equal (no false warning)", () => {
    expect(compareVersions("not-a-version", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.0", "not-a-version")).toBe(0);
  });
});

describe("isCollectorOutdated", () => {
  it("flags a current version below the baseline", () => {
    expect(isCollectorOutdated("1.1.0", "1.2.0")).toBe(true);
  });

  it("does not flag a current version at or above the baseline", () => {
    expect(isCollectorOutdated("1.2.0", "1.2.0")).toBe(false);
    expect(isCollectorOutdated("1.3.0", "1.2.0")).toBe(false);
  });

  it("does not flag when either value is missing", () => {
    expect(isCollectorOutdated(null, "1.2.0")).toBe(false);
    expect(isCollectorOutdated("1.2.0", null)).toBe(false);
    expect(isCollectorOutdated(undefined, undefined)).toBe(false);
  });
});
