import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/app/produkte/products-data";
import { quarterLabel } from "@/lib/managed-reports/quarter";
import ReportDownloadButton from "@/components/managed-reports/ReportDownloadButton";

export const metadata = { title: "Berichte — Ferrion Portal" };

export default async function ReportsPage() {
  const session = await getSession();
  const reports = await prisma.quarterlyReport.findMany({
    where: { status: "PUBLISHED", subscription: { customerId: session!.user.id } },
    orderBy: { publishedAt: "desc" },
    include: { subscription: true, document: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Berichte</h1>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Produkt</th>
              <th className="px-6 py-3 font-medium">Quartal</th>
              <th className="px-6 py-3 font-medium">Veröffentlicht</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const product = PRODUCTS.find((p) => p.slug === report.subscription.productSlug);
              return (
                <tr key={report.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-gray-300">
                    {product?.vendor ?? ""} {product?.name ?? report.subscription.productSlug}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{quarterLabel(report.periodStart)}</td>
                  <td className="px-6 py-4 text-gray-400">{report.publishedAt ? formatDate(report.publishedAt) : "—"}</td>
                  <td className="px-6 py-4">
                    {report.document && (
                      <ReportDownloadButton documentId={report.document.id} fileName={report.document.name} />
                    )}
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Noch keine Berichte verfügbar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
