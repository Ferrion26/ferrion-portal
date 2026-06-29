import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Quotes — Ferrion Portal" };

export default async function QuotesPage() {
  const session = await getSession();
  const quotes = await prisma.quote.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quotes</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Valid Until</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium">{q.reference}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(q.createdAt)}</td>
                <td className="px-6 py-4 font-medium">
                  {formatCurrency(Number(q.totalAmount), q.currency)}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {q.validUntil ? formatDate(q.validUntil) : "—"}
                </td>
                <td className="px-6 py-4">{quoteStatusBadge(q.status)}</td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No quotes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
