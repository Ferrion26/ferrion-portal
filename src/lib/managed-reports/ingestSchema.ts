import { z } from "zod";

// Generic, product-agnostic ingestion payload shape — shared by the live
// collector ingestion route (POST /api/collector/ingest, authenticated via
// x-api-key) and the admin manual-upload route (for air-gapped sites where
// the collector runs in --export-dir mode and the resulting files are
// carried out and uploaded by hand). Both accept exactly this shape so a
// collector export file can be pushed live or uploaded manually without
// any transformation.
export const ingestPayloadSchema = z.object({
  collectedAt: z.string().datetime(),
  metrics: z
    .array(
      z.object({
        key: z.string().min(1).max(100),
        value: z.number(),
        unit: z.string().max(20).optional(),
      })
    )
    .min(1)
    .max(200),
  // Geräteattribute statt Zeitreihen-Kennzahlen — werden auf die
  // Subscription geschrieben statt als Metrik.
  meta: z
    .object({
      deviceSerialNumber: z.string().min(1).max(100).optional(),
      deviceModel: z.string().min(1).max(100).optional(),
      deviceSoftwareVersion: z.string().min(1).max(100).optional(),
      // Bei OceanProtect eine zweite, unabhängige Versionsnummer (Backup-
      // Software, getrennt von der Storage-Firmware in deviceSoftwareVersion).
      dataBackupVersion: z.string().min(1).max(100).optional(),
      // Stichprobe der jüngsten Alarme mit Klartext, je Schweregrad —
      // ersetzt jeweils die vorherige Stichprobe (keine Historie).
      alarmSamples: z
        .array(
          z.object({
            severity: z.enum(["critical", "major", "warning"]),
            name: z.string().min(1).max(200),
            description: z.string().min(1).max(500),
            suggestion: z.string().max(500).optional(),
            time: z.string().max(50).optional(),
          })
        )
        .max(30)
        .optional(),
      // Aufschlüsselung der bekannten Ressourcen nach Typ (Dateisystem,
      // Datenbank, VM, …) inkl. geschützt/ungeschützt.
      resourceBreakdown: z
        .array(
          z.object({
            resourceType: z.string().min(1).max(100),
            protectedCount: z.number().min(0),
            unprotectedCount: z.number().min(0),
          })
        )
        .max(50)
        .optional(),
      // Die am häufigsten fehlgeschlagenen Jobs, getrennt nach SLA-Richtlinie
      // und nach Ressource.
      topJobFailures: z
        .object({
          bySla: z.array(z.object({ name: z.string().min(1).max(200), failedCount: z.number().min(0) })).max(10),
          byResource: z.array(z.object({ name: z.string().min(1).max(200), failedCount: z.number().min(0) })).max(10),
        })
        .optional(),
      // Details zu den konkreten Komponenten hinter einer Fehler-/Warnungs-
      // Kennzahl > 0 (z. B. welcher Controller, welche Lizenz läuft ab) —
      // ersetzt jeweils die vorherige Stichprobe (keine Historie).
      componentFaults: z
        .array(
          z.object({
            category: z.string().min(1).max(100),
            id: z.string().min(1).max(200),
            description: z.string().min(1).max(300),
          })
        )
        .max(50)
        .optional(),
    })
    .optional(),
});

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;
