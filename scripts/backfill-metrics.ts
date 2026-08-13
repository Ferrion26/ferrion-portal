// Berechnet eine neu registrierte Kennzahl (extractors/<produkt>.ts)
// rückwirkend aus bereits gespeicherten meta.rawEndpoints historischer
// Ingestions — ohne dass dafür ein neuer Collector ausgerollt werden muss.
// Läuft bewusst als eigenständiges Skript (wie prisma/seed.ts), nicht als
// HTTP-Route: ein Durchlauf über ggf. tausende Ingestions würde jedes
// Vercel-Timeout sprengen (siehe src/app/api/cron/cleanup-old-data/route.ts,
// maxDuration = 60, als Negativbeispiel für den falschen Ausführungsort).
//
// Schreibt nur ManagedServiceMetric — bereits erstellte QuarterlyReport-
// Berichte sind eingefrorene Snapshots und werden nie rückwirkend verändert.
// Das @@unique([ingestionId, metricKey])-Constraint auf ManagedServiceMetric
// macht den upsert unten sicher: ein wiederholter Lauf erzeugt keine
// Duplikate, sondern aktualisiert nur denselben Wert erneut.
//
// Aufruf:
//   npm run backfill-metrics -- --metric <extractorKey> [--subscription <id>] [--dry-run]
import { PrismaClient } from "@prisma/client";
import { findExtractor } from "../src/lib/managed-reports/extractors";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

const PAGE_SIZE = 200;

function parseArgs(argv: string[]) {
  let metricKey: string | undefined;
  let subscriptionId: string | undefined;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--metric") {
      metricKey = argv[++i];
    } else if (argv[i] === "--subscription") {
      subscriptionId = argv[++i];
    } else if (argv[i] === "--dry-run") {
      dryRun = true;
    }
  }
  return { metricKey, subscriptionId, dryRun };
}

async function main() {
  const { metricKey, subscriptionId, dryRun } = parseArgs(process.argv.slice(2));
  if (!metricKey) {
    console.error("Nutzung: npm run backfill-metrics -- --metric <extractorKey> [--subscription <id>] [--dry-run]");
    process.exitCode = 1;
    return;
  }

  const found = findExtractor(metricKey);
  if (!found) {
    console.error(`Kein Extractor mit Key "${metricKey}" registriert (siehe src/lib/managed-reports/extractors/<produkt>.ts).`);
    process.exitCode = 1;
    return;
  }
  const { productSlug, extractor } = found;

  let subscriptions: { id: string; productSlug: string }[];
  if (subscriptionId) {
    const sub = await prisma.managedServiceSubscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, productSlug: true },
    });
    if (!sub) {
      console.error(`Subscription "${subscriptionId}" nicht gefunden.`);
      process.exitCode = 1;
      return;
    }
    if (sub.productSlug !== productSlug) {
      console.error(`Subscription "${subscriptionId}" hat productSlug "${sub.productSlug}", Extractor "${metricKey}" gehört zu "${productSlug}".`);
      process.exitCode = 1;
      return;
    }
    subscriptions = [sub];
  } else {
    subscriptions = await prisma.managedServiceSubscription.findMany({
      where: { productSlug },
      select: { id: true, productSlug: true },
    });
  }

  console.log(`Extractor "${metricKey}" (Produkt "${productSlug}") — ${subscriptions.length} Subscription(s), ${dryRun ? "Testlauf (keine Schreibvorgänge)" : "schreibt in die Datenbank"}.`);

  let scanned = 0;
  let matched = 0;
  let written = 0;

  for (const sub of subscriptions) {
    let cursor: string | undefined;
    for (;;) {
      const ingestions = await prisma.collectorIngestion.findMany({
        where: { subscriptionId: sub.id },
        orderBy: { id: "asc" },
        take: PAGE_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: { id: true, receivedAt: true, payload: true },
      });
      if (ingestions.length === 0) break;

      for (const ingestion of ingestions) {
        scanned++;
        const payload = ingestion.payload as { collectedAt?: string; meta?: { rawEndpoints?: Record<string, unknown> } } | null;
        const rawEndpoints = payload?.meta?.rawEndpoints;
        if (!rawEndpoints) continue;

        const result = extractor.extract(rawEndpoints);
        if (!result) continue;
        matched++;

        const recordedAt = payload?.collectedAt ? new Date(payload.collectedAt) : ingestion.receivedAt;
        if (!dryRun) {
          await prisma.managedServiceMetric.upsert({
            where: { ingestionId_metricKey: { ingestionId: ingestion.id, metricKey } },
            update: { value: result.value, unit: result.unit },
            create: {
              subscriptionId: sub.id,
              ingestionId: ingestion.id,
              metricKey,
              value: result.value,
              unit: result.unit,
              recordedAt,
            },
          });
        }
        written++;
      }

      cursor = ingestions[ingestions.length - 1].id;
      if (ingestions.length < PAGE_SIZE) break;
    }
  }

  console.log(`Fertig. ${scanned} Ingestions geprüft, ${matched} enthielten die nötigen Rohdaten, ${written} Kennzahl-Werte ${dryRun ? "würden geschrieben" : "geschrieben"}.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
