import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Bestellungen — Ferrion Portal" };

export default async function OrdersPage() {
  const session = await getSession();
  const t = getT().dashboard;
  const orders = await prisma.order.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { documents: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.orders}</h1>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{t.reference}</th>
              <th className="px-6 py-3 font-medium">{t.date}</th>
              <th className="px-6 py-3 font-medium">{t.amount}</th>
              <th className="px-6 py-3 font-medium">{t.status}</th>
              <th className="px-6 py-3 font-medium">{t.documents}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-mono font-medium text-gray-300">{o.reference}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(o.createdAt)}</td>
                <td className="px-6 py-4 text-gray-300 font-medium">{formatCurrency(Number(o.totalAmount), o.currency)}</td>
                <td className="px-6 py-4">{orderStatusBadge(o.status)}</td>
                <td className="px-6 py-4">
                  {o.documents.length > 0
                    ? <span className="text-[#c9a84c]">{o.documents.length} {t.files}</span>
                    : <span className="text-gray-600">—</span>}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t.noOrders}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
