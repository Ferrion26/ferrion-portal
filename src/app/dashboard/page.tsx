import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Übersicht — Ferrion Portal" };

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user.id;
  const t = getT().dashboard;

  const [orderCount, quoteCount, openTickets, recentOrders] = await Promise.all([
    prisma.order.count({ where: { customerId: userId } }),
    prisma.quote.count({ where: { customerId: userId, status: { in: ["SENT", "DRAFT"] } } }),
    prisma.supportTicket.count({ where: { customerId: userId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.order.findMany({ where: { customerId: userId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: t.orders, value: orderCount, href: "/dashboard/orders" },
    { label: t.activeQuotes, value: quoteCount, href: "/dashboard/quotes" },
    { label: t.openTickets, value: openTickets, href: "/dashboard/tickets" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">
        {t.welcome}, {session!.user.name ?? t.customer}
      </h1>
      <p className="text-gray-400 mb-8">{t.overview}</p>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="bg-[#111827] border border-white/10 p-6 hover:border-[#c9a84c]/40 transition-colors">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="text-3xl font-bold text-[#c9a84c] mt-1">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-[#111827] border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">{t.recentOrders}</h2>
          <Link href="/dashboard/orders" className="text-sm text-[#c9a84c] hover:underline">{t.viewAll}</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{t.reference}</th>
              <th className="px-6 py-3 font-medium">{t.amount}</th>
              <th className="px-6 py-3 font-medium">{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-3 font-mono text-gray-300">{o.reference}</td>
                <td className="px-6 py-3 text-gray-300">{formatCurrency(Number(o.totalAmount), o.currency)}</td>
                <td className="px-6 py-3 text-gray-400">{o.status}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">{t.noOrders}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
