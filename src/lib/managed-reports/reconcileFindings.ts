import { prisma } from "@/lib/prisma";
import { FindingKind } from "@prisma/client";
import { IngestPayload } from "./ingestSchema";

export interface IncomingFinding {
  identityKey: string;
  category: string;
  title: string;
  description: string;
  suggestion?: string;
}

type AlarmSampleInput = NonNullable<NonNullable<IngestPayload["meta"]>["alarmSamples"]>[number];
type ComponentFaultInput = NonNullable<NonNullable<IngestPayload["meta"]>["componentFaults"]>[number];

// Alarm-Objekte aus dem Ingest-Payload in das generische Finding-Format —
// severity wird zur category (für die Ampel-Farbe im Bericht), sequence
// (bzw. ersatzweise severity+name) liefert die stabile Identität.
export function alarmSamplesToFindings(samples: AlarmSampleInput[]): IncomingFinding[] {
  return samples.map((s) => ({
    identityKey: s.sequence ?? `${s.severity}:${s.name}`,
    category: s.severity,
    title: s.name,
    description: s.description,
    suggestion: s.suggestion,
  }));
}

export function componentFaultsToFindings(faults: ComponentFaultInput[]): IncomingFinding[] {
  return faults.map((f) => ({
    identityKey: `${f.category}:${f.id}`,
    category: f.category,
    title: f.id,
    description: f.description,
  }));
}

// Gleicht die aktuell gemeldeten Alarme/Component Faults einer Subscription
// gegen den bisherigen Verlauf ab, statt ihn zu überschreiben:
// - neu gemeldete → als offener Finding-Eintrag angelegt
// - weiterhin gemeldete → lastSeenAt aktualisiert (bzw. wieder geöffnet,
//   falls zwischenzeitlich als behoben markiert)
// - nicht mehr gemeldete, bisher offene → als behoben markiert (resolvedAt)
// So lässt sich im Bericht zeigen, ob ein Punkt aktuell noch offen ist oder
// zwischenzeitlich behoben wurde, statt nur den letzten Momentaufnahme-Stand
// zu zeigen.
export async function reconcileFindings(subscriptionId: string, kind: FindingKind, incoming: IncomingFinding[]) {
  const now = new Date();
  const incomingKeys = incoming.map((f) => f.identityKey);

  await prisma.$transaction([
    ...incoming.map((f) =>
      prisma.deviceFinding.upsert({
        where: { subscriptionId_kind_identityKey: { subscriptionId, kind, identityKey: f.identityKey } },
        create: {
          subscriptionId,
          kind,
          identityKey: f.identityKey,
          category: f.category,
          title: f.title,
          description: f.description,
          suggestion: f.suggestion,
          firstSeenAt: now,
          lastSeenAt: now,
        },
        update: {
          category: f.category,
          title: f.title,
          description: f.description,
          suggestion: f.suggestion,
          lastSeenAt: now,
          resolvedAt: null, // erneut gemeldet → wieder offen, falls zuvor als behoben markiert
          occurrenceCount: { increment: 1 },
        },
      })
    ),
    prisma.deviceFinding.updateMany({
      where: {
        subscriptionId,
        kind,
        resolvedAt: null,
        identityKey: incomingKeys.length > 0 ? { notIn: incomingKeys } : undefined,
      },
      data: { resolvedAt: now },
    }),
  ]);
}
