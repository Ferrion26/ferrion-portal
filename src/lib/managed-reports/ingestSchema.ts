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
  // Version+Build des Collector-Skripts selbst (siehe collector/version.js),
  // z. B. "1.2.0+a1b2c3d" — Geräteattribut des Collectors, nicht des
  // überwachten Geräts, daher auf oberster Ebene statt in meta. Ältere
  // Collector-Pakete ohne dieses Feld bleiben gültig (optional).
  collectorVersion: z.string().min(1).max(50).optional(),
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
      // Vom Kunden vergebener Systemname (z. B. "hwe-clu1"), der im
      // DeviceManager als Cluster-Bezeichnung erscheint — anders als
      // deviceModel (Produktmodell) oder deviceSerialNumber (Geräte-ESN).
      deviceName: z.string().min(1).max(100).optional(),
      deviceSoftwareVersion: z.string().min(1).max(100).optional(),
      // Bei OceanProtect eine zweite, unabhängige Versionsnummer (Backup-
      // Software, getrennt von der Storage-Firmware in deviceSoftwareVersion).
      dataBackupVersion: z.string().min(1).max(100).optional(),
      // Stichprobe der aktuell aktiven Alarme mit Klartext, je Schweregrad —
      // wird bei jedem Ingest gegen den bisherigen Verlauf abgeglichen
      // (reconcileFindings): nicht mehr gemeldete, zuvor offene Alarme
      // gelten als behoben. Ein leeres Array ("aktuell keine Alarme") ist
      // ein gültiges Ergebnis und wird bewusst mitgeschickt; nur ein
      // komplett fehlendes Feld bedeutet "nicht erhoben".
      alarmSamples: z
        .array(
          z.object({
            severity: z.enum(["critical", "major", "warning"]),
            // Alarm-Sequenznummer des Geräts — stabile Kennung derselben
            // Alarminstanz über mehrere Collector-Läufe hinweg. Fehlt sie,
            // wird ersatzweise severity+name als (gröbere) Kennung genutzt.
            sequence: z.string().max(50).optional(),
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
      // Kapazität je Storage-Pool/Aggregat (nicht nur der Cluster-weite
      // Summenwert aus den metrics) — bei Systemen mit Cloud-Tiering (z. B.
      // NetApp FabricPool) zusätzlich, wie viel davon in einen angebundenen
      // Cloud-Speicher ausgelagert ist.
      capacityBreakdown: z
        .array(
          z.object({
            name: z.string().min(1).max(100),
            localUsedTB: z.number().min(0),
            localTotalTB: z.number().min(0),
            cloudUsedTB: z.number().min(0).optional(),
            cloudTarget: z.string().max(100).optional(),
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
      // wie alarmSamples bei jedem Ingest gegen den Verlauf abgeglichen.
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
      // JEDE geprüfte Komponente (normal UND fehlerhaft) — anders als
      // componentFaults keine Historie, sondern eine reine Momentaufnahme des
      // letzten Ingests. Grundlage für den abschließenden "erfolgreich
      // geprüft"-Referenzabschnitt im Bericht (zeigt, was tatsächlich
      // überprüft wurde, nicht nur was auffällig war).
      componentChecks: z
        .array(
          z.object({
            category: z.string().min(1).max(100),
            id: z.string().min(1).max(200),
            description: z.string().min(1).max(300),
            ok: z.boolean(),
          })
        )
        .max(300)
        .optional(),
      // Vollständige Rohantworten der abgefragten REST-Endpunkte, unter dem
      // jeweiligen Pfad als Schlüssel (siehe captureRaw in den Collector-
      // Adaptern) — bewusst lose typisiert (unbekannte Gerätefelder), damit
      // spätere Auswertungen auf bereits gesammelten Ingestions aufsetzen
      // können, ohne dass ein neuer Collector nötig wird, nur weil ein
      // Adapter ursprünglich ein Feld nicht ausgewertet hat. Größenlimit
      // schützt vor einem ausufernden Payload bei sehr großen Anlagen.
      rawEndpoints: z
        .record(z.string(), z.unknown())
        .optional()
        .refine((v) => !v || JSON.stringify(v).length <= 2_000_000, {
          message: "rawEndpoints darf 2 MB (JSON) nicht überschreiten.",
        }),
    })
    .optional(),
});

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;
