import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/managed-reports/reportFormat";
import { PRODUCTS } from "@/app/produkte/products-data";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Alarme & Fehler — Managed Reports — Admin" };

const KIND_LABEL: Record<string, string> = {
  ALARM: "Alarm",
  COMPONENT_FAULT: "Komponentenfehler",
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

  const showAll = searchParams.show === "all";
  const findings = await prisma.deviceFinding.findMany({
    where: { subscriptionId: params.id, ...(showAll ? {} : { resolvedAt: null }) },
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
            !showAll ? "bg-[#c9a84c] text-black border-[#c9a84c]" : "border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          Nur aktive
        </Link>
        <Link
          href={`/admin/managed-reports/${subscription.id}/findings?show=all`}
          className={`px-3 py-1.5 text-xs font-medium border ${
            showAll ? "bg-[#c9a84c] text-black border-[#c9a84c]" : "border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          Alle (inkl. behoben)
        </Link>
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Art</th>
              <th className="py-2 font-medium">Kategorie</th>
              <th className="py-2 font-medium">Titel</th>
              <th className="py-2 font-medium">Beschreibung</th>
              <th className="py-2 font-medium">Zuerst gesehen</th>
              <th className="py-2 font-medium">Zuletzt gesehen</th>
              <th className="py-2 font-medium">Behoben am</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} className="border-b border-white/5 align-top">
                <td className="py-2">
                  {f.resolvedAt ? <Badge variant="green">Behoben</Badge> : <Badge variant="yellow">Aktiv</Badge>}
                </td>
                <td className="py-2 text-gray-400">{KIND_LABEL[f.kind] ?? f.kind}</td>
                <td className="py-2 text-gray-400">{f.category}</td>
                <td className="py-2 text-white font-medium">{f.title}</td>
                <td className="py-2 text-gray-400 max-w-sm">
                  {f.description}
                  {f.suggestion && <p className="text-gray-500 text-xs mt-1">{f.suggestion}</p>}
                </td>
                <td className="py-2 text-gray-400 whitespace-nowrap">{formatDateTime(f.firstSeenAt)}</td>
                <td className="py-2 text-gray-400 whitespace-nowrap">{formatDateTime(f.lastSeenAt)}</td>
                <td className="py-2 text-gray-400 whitespace-nowrap">{f.resolvedAt ? formatDateTime(f.resolvedAt) : "—"}</td>
              </tr>
            ))}
            {findings.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-500">
                  {showAll ? "Keine Alarme/Fehler erfasst." : "Keine aktiven Alarme/Fehler."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
