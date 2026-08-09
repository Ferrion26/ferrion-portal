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
  // Geräteattribute statt Zeitreihen-Kennzahlen — aktuell nur die
  // Seriennummer, wird auf die Subscription geschrieben statt als Metrik.
  meta: z
    .object({
      deviceSerialNumber: z.string().min(1).max(100).optional(),
    })
    .optional(),
});

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;
