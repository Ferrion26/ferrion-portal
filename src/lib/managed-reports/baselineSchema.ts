import { z } from "zod";

// Eine Zeile in "New Features"/"Modified Features" — Titel + optionale
// Beschreibung, wie in den Huawei-Release-Notes-Tabellen.
export const baselineFeatureRowSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
});

// Eine Zeile in "Resolved Issues" — zusätzlich Ticket-Nummer/Schweregrad/
// Lösung, falls vorhanden (nicht jede Quelle hat alle Felder).
export const baselineResolvedIssueSchema = z.object({
  ticketNumber: z.string().max(100).optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  severity: z.string().max(50).optional(),
  solution: z.string().max(1000).optional(),
});

// Für POST (Version anlegen) — versionNumber ist Pflicht.
export const createBaselineVersionSchema = z.object({
  versionNumber: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.string().min(1).max(50).default("Valid"),
  // Datumsstring aus <input type="date"> (z. B. "2026-07-28") — bewusst kein
  // z.string().datetime(), das ISO-8601-mit-Uhrzeit verlangt.
  publicationDate: z.string().min(1).optional(),
  recommended: z.boolean().default(false),
  newFeatures: z.array(baselineFeatureRowSchema).max(50).optional(),
  modifiedFeatures: z.array(baselineFeatureRowSchema).max(50).optional(),
  resolvedIssues: z.array(baselineResolvedIssueSchema).max(50).optional(),
  sourceDocument: z.string().max(300).optional(),
});

// Für PATCH (Version bearbeiten) — alle Felder optional, nur Gesendetes wird
// aktualisiert.
export const updateBaselineVersionSchema = createBaselineVersionSchema.partial();
