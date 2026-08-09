import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { getCollectorBaseline } from "@/lib/settings";
import CollectorBaselineForm from "./CollectorBaselineForm";

export const metadata = { title: "Managed Reports — Admin" };

// Erste Navigationsebene: alle Kunden. Verträge/Geräte eines Kunden liegen
// erst eine Ebene tiefer (siehe customers/[customerId], dort auch "Neue
// Subscription anlegen") — vorher war das eine einzige flache Liste aller
// Subscriptions über alle Kunden hinweg, was bei mehreren Geräten pro Kunde
// schnell unübersichtlich wurde. Auch Kunden ohne bisherigen Vertrag werden
// gezeigt, damit sich von hier aus der erste Vertrag anlegen lässt.
export default async function ManagedReportsPage() {
  const collectorBaseline = await getCollectorBaseline();
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      managedServiceSubscriptions: {
        select: {
          id: true,
          reports: { orderBy: { generatedAt: "desc" }, take: 1, select: { status: true, generatedAt: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Managed-Service-Berichte</h1>
        <p className="text-sm text-gray-500">Kunden mit aktiven Managed-Service-Verträgen. Neue Verträge werden auf der jeweiligen Kundenseite angelegt.</p>
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-2">Collector-Baseline</h2>
        <p className="text-xs text-gray-500 mb-4">
          Globale Mindestversion für den Collector (siehe collector/version.js). Kunden mit einem älteren Collector-Stand
          werden auf ihrer Subscription-Seite mit einem Hinweis markiert. Leer = keine Baseline, keine Warnungen.
        </p>
        <CollectorBaselineForm initialMinVersion={collectorBaseline} />
      </div>

      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Kunden</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Kunde</th>
              <th className="px-6 py-3 font-medium">Verträge/Geräte</th>
              <th className="px-6 py-3 font-medium">Letzter Bericht</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const allReports = customer.managedServiceSubscriptions
                .flatMap((s) => s.reports)
                .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
              const lastReport = allReports[0];
              return (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <Link href={`/admin/managed-reports/customers/${customer.id}`} className="font-medium text-gray-300 hover:text-[#c9a84c]">
                      {customer.company ?? customer.name ?? customer.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{customer.managedServiceSubscriptions.length}</td>
                  <td className="px-6 py-4 text-gray-400">{lastReport ? formatDate(lastReport.generatedAt) : "—"}</td>
                  <td className="px-6 py-4">
                    {lastReport ? (
                      <Badge variant={lastReport.status === "PUBLISHED" ? "green" : "yellow"}>
                        {lastReport.status === "PUBLISHED" ? "Veröffentlicht" : "Entwurf"}
                      </Badge>
                    ) : (
                      <Badge variant="gray">Kein Bericht</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Noch keine Kunden angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
