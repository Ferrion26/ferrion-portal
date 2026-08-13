import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/app/produkte/products-data";
import { getReportableProductSlugs } from "@/lib/managed-reports/metrics";
import NewBaselinePolicyForm from "./NewBaselinePolicyForm";

export const metadata = { title: "Baselines — Admin" };

export default async function BaselinesPage() {
  const policies = await prisma.baselinePolicy.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      softwareVersions: { where: { recommended: true }, take: 1, select: { versionNumber: true } },
      _count: { select: { softwareVersions: true } },
    },
  });

  const reportableProducts = PRODUCTS.filter((p) => getReportableProductSlugs().includes(p.slug));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Baselines</h1>
        <p className="text-sm text-gray-500 mb-6">
          Empfohlene Software-/Firmware-Versionen je Produkt, inkl. Bugfixes und New Features aus den Release Notes —
          Grundlage für den Baseline-Abschnitt im Healthcheck-Bericht.
        </p>
        <div className="bg-[#111827] border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-4">Neue Policy anlegen</h2>
          <NewBaselinePolicyForm products={reportableProducts.map((p) => ({ slug: p.slug, label: `${p.vendor} ${p.name}` }))} />
        </div>
      </div>

      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Produkt</th>
                <th className="px-6 py-3 font-medium">Versionen</th>
                <th className="px-6 py-3 font-medium">Aktuell empfohlen</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => {
                const product = PRODUCTS.find((p) => p.slug === policy.productSlug);
                return (
                  <tr key={policy.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-gray-300">
                      <Link href={`/admin/baselines/${policy.id}`} className="text-[#c9a84c] hover:text-[#e0bc5a]">
                        {policy.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {product ? `${product.vendor} ${product.name}` : policy.productSlug}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{policy._count.softwareVersions}</td>
                    <td className="px-6 py-4 text-gray-400">{policy.softwareVersions[0]?.versionNumber ?? "—"}</td>
                  </tr>
                );
              })}
              {policies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Noch keine Baseline-Policy angelegt.
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
