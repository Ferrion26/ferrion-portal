import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/app/produkte/products-data";
import { isCollectorOutdated } from "@/lib/managed-reports/collectorVersion";
import { getCollectorBaseline } from "@/lib/settings";
import { Badge } from "@/components/ui/Badge";
import ApiKeyManager from "./ApiKeyManager";
import GenerateReportButton from "./GenerateReportButton";
import IngestionTable from "./IngestionTable";
import ReportsTable from "./ReportsTable";
import ReplicationNoteForm from "./ReplicationNoteForm";
import LocationForm from "./LocationForm";
import RetentionForm from "./RetentionForm";

export const metadata = { title: "Subscription — Managed Reports — Admin" };

export default async function ManagedReportDetailPage({ params }: { params: { id: string } }) {
  const subscription = await prisma.managedServiceSubscription.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      apiKeys: { orderBy: { createdAt: "desc" } },
      reports: { orderBy: { generatedAt: "desc" }, include: { document: true } },
      _count: { select: { metrics: true } },
    },
  });
  if (!subscription) notFound();

  const [ingestions, openFindingsCount, unreviewedFindingsCount, collectorBaseline] = await Promise.all([
    prisma.collectorIngestion.findMany({
      where: { subscriptionId: params.id },
      orderBy: { receivedAt: "desc" },
      take: 30,
      include: { _count: { select: { metrics: true } } },
    }),
    prisma.deviceFinding.count({ where: { subscriptionId: params.id, resolvedAt: null } }),
    prisma.deviceFinding.count({ where: { subscriptionId: params.id, resolvedAt: null, acknowledgedAt: null } }),
    getCollectorBaseline(),
  ]);
  const collectorOutdated = isCollectorOutdated(subscription.collectorVersion, collectorBaseline);

  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);

  // Andere aktive Subscriptions desselben Kunden — können zu einem
  // kombinierten Bericht (getrennte Abschnitte pro Produkt) hinzugefügt werden.
  const siblingSubscriptions = await prisma.managedServiceSubscription.findMany({
    where: { customerId: subscription.customerId, id: { not: subscription.id }, active: true },
  });
  const siblings = siblingSubscriptions.map((s) => {
    const p = PRODUCTS.find((pr) => pr.slug === s.productSlug);
    return { id: s.id, label: `${p?.vendor ?? ""} ${p?.name ?? s.productSlug}`.trim() };
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/managed-reports/customers/${subscription.customerId}`} className="text-xs text-gray-500 hover:text-[#c9a84c]">
          ← {subscription.customer.company ?? subscription.customer.name ?? subscription.customer.email}
        </Link>
        <p className="text-xs text-gray-500 tracking-widest uppercase mb-2 mt-2">
          {product?.vendor ?? ""} {product?.name ?? subscription.productSlug} · {subscription.packageId}
        </p>
        <h1 className="text-2xl font-bold text-white mb-1">
          {subscription.customer.company ?? subscription.customer.name ?? subscription.customer.email}
        </h1>
        <p className="text-sm text-gray-500">
          <Link href={`/admin/managed-reports/${subscription.id}/data`} className="text-[#c9a84c] hover:text-[#e0bc5a] underline decoration-dotted">
            {subscription._count.metrics} Kennzahlen empfangen
          </Link>{" "}
          · Subscription seit {formatDate(subscription.startDate)}
          {openFindingsCount > 0 && (
            <>
              {" · "}
              <Link href={`/admin/managed-reports/${subscription.id}/findings`} className="text-amber-400 hover:text-amber-300 underline decoration-dotted">
                {openFindingsCount} offene Alarme/Fehler
                {unreviewedFindingsCount > 0 && ` (${unreviewedFindingsCount} noch zu prüfen)`}
              </Link>
            </>
          )}
        </p>
        {(subscription.deviceName || subscription.deviceModel || subscription.deviceSoftwareVersion || subscription.deviceSerialNumber || subscription.location) && (
          <p className="text-sm text-gray-500 mt-1">
            {subscription.deviceName && <>Gerätename: {subscription.deviceName} · </>}
            {subscription.deviceModel && <>Modell: {subscription.deviceModel} · </>}
            {subscription.deviceSoftwareVersion && <>Version: {subscription.deviceSoftwareVersion} · </>}
            {subscription.deviceSerialNumber && <>SN: {subscription.deviceSerialNumber}</>}
            {subscription.location && <> · Standort: {subscription.location}</>}
          </p>
        )}
        {subscription.collectorVersion && (
          <p className="text-sm text-gray-500 mt-1">
            Collector: {subscription.collectorVersion}
            {collectorOutdated && (
              <>
                {" "}
                <Badge variant="yellow">Veraltet — Baseline {collectorBaseline}</Badge>
              </>
            )}
          </p>
        )}
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-4">Collector-API-Keys</h2>
        <ApiKeyManager
          subscriptionId={subscription.id}
          apiKeys={subscription.apiKeys.map((k) => ({
            id: k.id,
            label: k.label,
            lastSeenAt: k.lastSeenAt?.toISOString() ?? null,
            revokedAt: k.revokedAt?.toISOString() ?? null,
            createdAt: k.createdAt.toISOString(),
          }))}
        />
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-4">Ingestion-Verlauf</h2>
        <p className="text-xs text-gray-500 mb-4">
          Welche Daten wann eingegangen sind — sowohl Live-Pushes des Collectors als auch manuelle Uploads. Manueller Upload für air-gapped Standorte läuft
          jetzt gebündelt über die{" "}
          <Link href={`/admin/managed-reports/customers/${subscription.customerId}`} className="text-[#c9a84c] hover:text-[#e0bc5a]">
            Kundenübersicht
          </Link>
          .
        </p>
        <IngestionTable
          subscriptionId={subscription.id}
          ingestions={ingestions.map((ing) => ({
            id: ing.id,
            receivedAt: ing.receivedAt.toISOString(),
            source: ing.source,
            fileName: ing.fileName,
            metricsCount: ing._count.metrics,
          }))}
        />
        {ingestions.length === 30 && <p className="text-xs text-gray-500 mt-3">Zeigt die letzten 30 Einträge.</p>}
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-2">Standort</h2>
        <p className="text-xs text-gray-500 mb-4">
          Physischer Standort des Geräts (z. B. Rechenzentrum/Serverraum) — die REST-API meldet nur die Position einer Komponente innerhalb des Gehäuses, nicht
          den Standort des Systems selbst. Erscheint im Bericht (PDF + Web).
        </p>
        <LocationForm subscriptionId={subscription.id} initialValue={subscription.location} />
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-2">Hinweis für den Bericht</h2>
        <p className="text-xs text-gray-500 mb-4">
          Freitext, z. B. um eine Beziehung zu einem anderen System zu dokumentieren — erscheint als Hinweiszeile im Bericht.
        </p>
        <ReplicationNoteForm subscriptionId={subscription.id} initialValue={subscription.replicationNote} />
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-2">Datenaufbewahrung</h2>
        <p className="text-xs text-gray-500 mb-4">
          Nach wie vielen Tagen Rohdaten (Kennzahlen, Ingestion-Verlauf, bereits behobene Alarme/Fehler) automatisch gelöscht werden. Leer = unbegrenzt. Aktive,
          noch offene Alarme/Fehler werden nie automatisch gelöscht. Ist eine Frist gesetzt, sind nach Ablauf auch der Rohdaten-Browser und ein rückwirkendes
          Nachtragen neuer Kennzahlen (Backfill) für die betroffenen Ingestions nicht mehr möglich, da die zugrunde liegenden Rohdaten dann gelöscht sind.
        </p>
        <RetentionForm subscriptionId={subscription.id} initialDays={subscription.metricsRetentionDays} />
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Berichte</h2>
          <GenerateReportButton
            subscriptionId={subscription.id}
            defaultPeriodType={subscription.defaultPeriodType}
            siblings={siblings}
          />
        </div>

        <ReportsTable
          subscriptionId={subscription.id}
          reports={subscription.reports.map((report) => ({
            id: report.id,
            periodType: report.periodType,
            periodStart: report.periodStart.toISOString(),
            generatedAt: report.generatedAt.toISOString(),
            status: report.status,
            additionalSubscriptionIds: report.additionalSubscriptionIds,
            document: report.document ? { id: report.document.id, name: report.document.name } : null,
          }))}
        />
      </div>
    </div>
  );
}
