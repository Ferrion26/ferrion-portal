import { describe, it, expect } from "vitest";
import { alarmSamplesToFindings, componentFaultsToFindings } from "./reconcileFindings";

// Nur die reinen Mapping-Funktionen — reconcileFindings() selbst braucht
// eine echte Datenbank und ist per Live-Testlauf verifiziert (siehe
// Session-Historie), nicht per Unit-Test mit Mocks.
describe("alarmSamplesToFindings", () => {
  it("uses the device's alarm sequence as the stable identity when present", () => {
    const findings = alarmSamplesToFindings([
      { severity: "critical", sequence: "1320", name: "Optical Module Rate Mismatch", description: "desc" },
    ]);
    expect(findings[0].identityKey).toBe("1320");
    expect(findings[0].category).toBe("critical");
    expect(findings[0].title).toBe("Optical Module Rate Mismatch");
  });

  it("falls back to severity+name when the sequence is missing", () => {
    const findings = alarmSamplesToFindings([{ severity: "warning", name: "Job Failed", description: "desc" }]);
    expect(findings[0].identityKey).toBe("warning:Job Failed");
  });

  it("carries the suggestion through when present", () => {
    const findings = alarmSamplesToFindings([
      { severity: "major", name: "License Expired", description: "desc", suggestion: "Renew the license." },
    ]);
    expect(findings[0].suggestion).toBe("Renew the license.");
  });
});

describe("componentFaultsToFindings", () => {
  it("combines category and id into a stable identity key", () => {
    const findings = componentFaultsToFindings([{ category: "Controller", id: "0B", description: "Fehlerhaft" }]);
    expect(findings[0].identityKey).toBe("Controller:0B");
    expect(findings[0].title).toBe("0B");
  });

  it("keeps distinct components with the same id but different category separate", () => {
    const findings = componentFaultsToFindings([
      { category: "Controller", id: "0A", description: "Fehlerhaft" },
      { category: "Firmware", id: "0A", description: "Version mismatch" },
    ]);
    expect(findings[0].identityKey).not.toBe(findings[1].identityKey);
  });
});
