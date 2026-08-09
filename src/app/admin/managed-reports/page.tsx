import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/app/produkte/products-data";
import { Badge } from "@/components/ui/Badge";
import NewSubscriptionForm from "./NewSubscriptionForm";

export const metadata = { title: "Managed Reports — Admin" };

export default async function ManagedReportsPage() {
  const [customers, subscriptions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: { id: true, name: true, email: true, company: true },
      orderBy: { name: "asc" },
    }),
    prisma.managedServiceSubscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true, company: true } },
        reports: { orderBy: { generatedAt: "desc" }, take: 1 },
        _count: { select: { apiKeys: true } },
      },
    }),
  ]);

  const managedProducts = PRODUCTS.filter((p) => p.managedServices);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Managed-Service-Berichte</h1>

        <div className="bg-[#111827] border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-4">Neue Subscription anlegen</h2>
          <NewSubscriptionForm customers={customers} products={managedProducts.map((p) => ({ slug: p.slug, name: p.name, vendor: p.vendor }))} />
        </div>
      </div>

      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Subscriptions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Kunde</th>
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
                      {sub.customer.company ?? sub.customer.name ?? sub.customer.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{product?.name ?? sub.productSlug}</td>
                  <td className="px-6 py-4 text-gray-400">{sub.packageId}</td>
                  <td className="px-6 py-4 text-gray-400">{sub._count.apiKeys}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {lastReport ? formatDate(lastReport.generatedAt) : "—"}
                  </td>
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
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Noch keine Managed-Service-Subscriptions angelegt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
