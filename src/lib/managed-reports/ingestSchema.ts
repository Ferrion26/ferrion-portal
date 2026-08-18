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
      // Übersicht je Volume (NetApp) — Name/SVM/Aggregat/Zustand/Kapazität,
      // vom letzten Ingest überschrieben, keine Historie (wie capacityBreakdown).
      volumes: z
        .array(
          z.object({
            name: z.string().min(1).max(100),
            svm: z.string().max(100),
            aggregate: z.string().max(200),
            state: z.string().max(50),
            usedTB: z.number().min(0),
            totalTB: z.number().min(0),
          })
        )
        .max(300)
        .optional(),
      // Übersicht je LUN (Huawei OceanStor/OceanProtect-Storage-Ebene,
      // NetApp) — Zustand/Kapazität sowie die darauf gemappten Initiatoren
      // (iSCSI-IQN/FC-WWN), vom letzten Ingest überschrieben, keine Historie
      // (wie volumes).
      luns: z
        .array(
          z.object({
            id: z.string().max(100),
            name: z.string().min(1).max(100),
            healthStatus: z.string().max(50),
            capacityTB: z.number().min(0),
            allocatedTB: z.number().min(0).optional(),
            mapped: z.boolean(),
            initiators: z
              .array(
                z.object({
                  type: z.enum(["iscsi", "fc"]),
                  name: z.string().max(200),
                  hostName: z.string().max(100).optional(),
                })
              )
              .max(20)
              .optional(),
          })
        )
        .max(300)
        .optional(),
      // Netzwerk-Port-/Interface-Übersicht (IP/Maske/Gateway/MAC/MTU/Zweck)
      // für die Systemdokumentation — bei Huawei aus /eth_port extrahiert,
      // bei NetApp aus den IP-Interfaces (LIFs). Fließt NICHT in den
      // Healthcheck-Bericht ein, nur in generateSystemDocumentation.ts.
      networkPorts: z
        .array(
          z.object({
            name: z.string().min(1).max(100),
            ip: z.string().max(50).optional(),
            mask: z.string().max(50).optional(),
            gateway: z.string().max(50).optional(),
            mac: z.string().max(50).optional(),
            mtu: z.number().min(0).optional(),
            bondName: z.string().max(200).optional(),
            purpose: z.string().max(100).optional(),
            speedMbps: z.number().min(0).optional(),
            healthy: z.boolean(),
          })
        )
        .max(100)
        .optional(),
      // Client-/Ressourcenliste für die Systemdokumentation (nur OceanProtect
      // DataBackup). Fließt NICHT in den Healthcheck-Bericht ein.
      clients: z
        .array(
          z.object({
            name: z.string().min(1).max(200),
            environmentName: z.string().max(200).optional(),
            ip: z.string().max(50).optional(),
            osType: z.string().max(100).optional(),
            type: z.string().max(100).optional(),
            protectionStatus: z.string().max(100).optional(),
            slaCompliant: z.boolean().optional(),
            parentName: z.string().max(200).optional(),
          })
        )
        .max(500)
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
            // Physisches Gehäuse, in dem die Komponente steckt (z. B. "CTE0"
            // für eine PSU/einen Lüfter darin) — aus dem LOCATION-Feld des
            // Geräts abgeleitet, wo vorhanden. Fehlt bei Komponenten ohne
            // sinnvolle Gehäusezuordnung (Lizenz, Zertifikat, …) und bei
            // älteren, vor Einführung dieses Felds erfassten Daten.
            group: z.string().max(100).optional(),
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
            group: z.string().max(100).optional(),
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
