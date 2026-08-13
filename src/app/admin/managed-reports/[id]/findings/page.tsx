import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/app/produkte/products-data";
import FindingsTable from "./FindingsTable";

export const metadata = { title: "Alarme & Fehler — Managed Reports — Admin" };

type ShowFilter = "review" | "acknowledged" | "all";

const FILTER_WHERE: Record<ShowFilter, object> = {
  review: { resolvedAt: null, acknowledgedAt: null },
  acknowledged: { resolvedAt: null, acknowledgedAt: { not: null } },
  all: {},
};

export default async function FindingsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { show?: string };
}) {
  const subscription = await prisma.managedServiceSubscription.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });
  if (!subscription) notFound();

  // "Nur zu prüfen" ist der Default — genau die Sicht, die vor einer
  // Bericht-Erstellung durchgegangen werden soll.
  const show: ShowFilter = searchParams.show === "acknowledged" ? "acknowledged" : searchParams.show === "all" ? "all" : "review";
  const findings = await prisma.deviceFinding.findMany({
    where: { subscriptionId: params.id, ...FILTER_WHERE[show] },
    orderBy: [{ resolvedAt: "asc" }, { lastSeenAt: "desc" }],
  });

  const product = PRODUCTS.find((p) => p.slug === subscription.productSlug);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/managed-reports/${subscription.id}`} className="text-xs text-gray-500 hover:text-[#c9a84c]">
          ← {subscription.customer.company ?? subscription.customer.name ?? subscription.customer.email}
        </Link>
        <p className="text-xs text-gray-500 tracking-widest uppercase mb-2 mt-2">
          {product?.vendor ?? ""} {product?.name ?? subscription.productSlug} · {subscription.packageId}
        </p>
        <h1 className="text-2xl font-bold text-white mb-1">Alarme &amp; Fehler</h1>
        {subscription.deviceName && <p className="text-sm text-gray-500">Gerät: {subscription.deviceName}</p>}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/admin/managed-reports/${subscription.id}/findings`}
          className={`px-3 py-1.5 text-xs font-medium border ${
            show === "review" ? "bg-[#c9a84c] text-black border-[#c9a84c]" : "border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          Nur zu prüfen
        </Link>
        <Link
          href={`/admin/managed-reports/${subscription.id}/findings?show=acknowledged`}
          className={`px-3 py-1.5 text-xs font-medium border ${
            show === "acknowledged" ? "bg-[#c9a84c] text-black border-[#c9a84c]" : "border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          Bestätigt
        </Link>
        <Link
          href={`/admin/managed-reports/${subscription.id}/findings?show=all`}
          className={`px-3 py-1.5 text-xs font-medium border ${
            show === "all" ? "bg-[#c9a84c] text-black border-[#c9a84c]" : "border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          Alle (inkl. behoben)
        </Link>
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <FindingsTable
          subscriptionId={subscription.id}
          findings={findings.map((f) => ({
            id: f.id,
            kind: f.kind,
            category: f.category,
            title: f.title,
            description: f.description,
            suggestion: f.suggestion,
            firstSeenAt: f.firstSeenAt.toISOString(),
            lastSeenAt: f.lastSeenAt.toISOString(),
            resolvedAt: f.resolvedAt?.toISOString() ?? null,
            acknowledgedAt: f.acknowledgedAt?.toISOString() ?? null,
            acknowledgedByEmail: f.acknowledgedByEmail,
            acknowledgedComment: f.acknowledgedComment,
          }))}
        />
      </div>
    </div>
  );
}
