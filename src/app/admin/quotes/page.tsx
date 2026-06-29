import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Quotes — Admin" };

export default async function AdminQuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true, email: true, company: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Quotes</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Valid Until</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium">{q.reference}</td>
                <td className="px-6 py-4 text-gray-500">
                  {q.customer.company ?? q.customer.name ?? q.customer.email}
                </td>
                <td className="px-6 py-4">{formatCurrency(Number(q.totalAmount), q.currency)}</td>
                <td className="px-6 py-4 text-gray-500">
                  {q.validUntil ? formatDate(q.validUntil) : "—"}
                </td>
                <td className="px-6 py-4">{quoteStatusBadge(q.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
