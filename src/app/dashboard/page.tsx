import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Dashboard — Ferrion Portal" };

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user.id;

  const [orderCount, quoteCount, openTickets, recentOrders] = await Promise.all([
    prisma.order.count({ where: { customerId: userId } }),
    prisma.quote.count({ where: { customerId: userId, status: { in: ["SENT", "DRAFT"] } } }),
    prisma.supportTicket.count({ where: { customerId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Total Orders", value: orderCount, href: "/dashboard/orders" },
    { label: "Active Quotes", value: quoteCount, href: "/dashboard/quotes" },
    { label: "Open Tickets", value: openTickets, href: "/dashboard/tickets" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back, {session!.user.name ?? "Customer"}
      </h1>
      <p className="text-gray-500 mb-8">Here&apos;s an overview of your account.</p>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="card p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-3 font-mono">{o.reference}</td>
                <td className="px-6 py-3">{formatCurrency(Number(o.totalAmount), o.currency)}</td>
                <td className="px-6 py-3">{o.status}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-gray-400">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
