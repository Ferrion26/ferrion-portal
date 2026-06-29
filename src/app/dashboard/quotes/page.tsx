import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Angebote — Ferrion Portal" };

export default async function QuotesPage() {
  const session = await getSession();
  const t = getT().dashboard;
  const quotes = await prisma.quote.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.quotes}</h1>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{t.reference}</th>
              <th className="px-6 py-3 font-medium">{t.date}</th>
              <th className="px-6 py-3 font-medium">{t.amount}</th>
              <th className="px-6 py-3 font-medium">{t.validUntil}</th>
              <th className="px-6 py-3 font-medium">{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-mono font-medium text-gray-300">{q.reference}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(q.createdAt)}</td>
                <td className="px-6 py-4 text-gray-300 font-medium">{formatCurrency(Number(q.totalAmount), q.currency)}</td>
                <td className="px-6 py-4 text-gray-400">{q.validUntil ? formatDate(q.validUntil) : "—"}</td>
                <td className="px-6 py-4">{quoteStatusBadge(q.status)}</td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t.noQuotes}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
