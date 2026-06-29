import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatusBadge } from "@/components/ui/Badge";

export const metadata = { title: "Orders — Ferrion Portal" };

export default async function OrdersPage() {
  const session = await getSession();
  const orders = await prisma.order.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { documents: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Documents</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium">{o.reference}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(o.createdAt)}</td>
                <td className="px-6 py-4 font-medium">
                  {formatCurrency(Number(o.totalAmount), o.currency)}
                </td>
                <td className="px-6 py-4">{orderStatusBadge(o.status)}</td>
                <td className="px-6 py-4">
                  {o.documents.length > 0 ? (
                    <span className="text-brand-600">{o.documents.length} file(s)</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
