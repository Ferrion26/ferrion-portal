import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/app/produkte/products-data";
import { Badge } from "@/components/ui/Badge";
import { getReportableProductSlugs } from "@/lib/managed-reports/metrics";
import NewSubscriptionForm from "../../NewSubscriptionForm";

export const metadata = { title: "Kunde — Managed Reports — Admin" };

// Zweite Navigationsebene: die Verträge/Geräte eines einzelnen Kunden
// (siehe ../../page.tsx für die Kundenübersicht darüber). Von hier aus
// geht es weiter in die einzelne Subscription (../../[id]).
export default async function ManagedReportsCustomerPage({ params }: { params: { customerId: string } }) {
  const customer = await prisma.user.findUnique({
    where: { id: params.customerId },
    select: { id: true, name: true, email: true, company: true },
  });
  if (!customer) notFound();

  const subscriptions = await prisma.managedServiceSubscription.findMany({
    where: { customerId: params.customerId },
    orderBy: { createdAt: "desc" },
    include: {
      reports: { orderBy: { generatedAt: "desc" }, take: 1 },
      _count: { select: { apiKeys: true } },
    },
  });

  const reportableSlugs = getReportableProductSlugs();
  const managedProducts = PRODUCTS.filter((p) => reportableSlugs.includes(p.slug));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/managed-reports" className="text-xs text-gray-500 hover:text-[#c9a84c]">
          ← Alle Kunden
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2 mb-1">{customer.company ?? customer.name ?? customer.email}</h1>
        <p className="text-sm text-gray-500">{subscriptions.length} Vertrag/Geräte-Subscription{subscriptions.length === 1 ? "" : "s"}</p>
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-4">Neue Subscription anlegen</h2>
        <NewSubscriptionForm
          fixedCustomerId={customer.id}
          products={managedProducts.map((p) => ({ slug: p.slug, name: p.name, vendor: p.vendor }))}
        />
      </div>

      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Verträge/Geräte</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Produkt</th>
              <th className="px-6 py-3 font-medium">Paket</th>
              <th className="px-6 py-3 font-medium">API-Keys</th>
              <th className="px-6 py-3 font-medium">Letzter Bericht</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const product = PRODUCTS.find((p) => p.slug === sub.productSlug);
              const lastReport = sub.reports[0];
              return (
                <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <Link href={`/admin/managed-reports/${sub.id}`} className="font-medium text-gray-300 hover:text-[#c9a84c]">
                      {product?.vendor ?? ""} {product?.name ?? sub.productSlug}
                    </Link>
                    {sub.deviceModel && <p className="text-xs text-gray-500 mt-0.5">{sub.deviceModel}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{sub.packageId}</td>
                  <td className="px-6 py-4 text-gray-400">{sub._count.apiKeys}</td>
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
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Noch kein Vertrag für diesen Kunden angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
