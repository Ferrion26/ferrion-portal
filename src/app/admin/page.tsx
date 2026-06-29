import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin — Ferrion Portal" };

export default async function AdminDashboard() {
  const t = getT().admin;

  const [customerCount, orderCount, openTickets, pendingQuotes] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.quote.count({ where: { status: "SENT" } }),
  ]);

  const stats = [
    { label: t.customers, value: customerCount, href: "/admin/customers" },
    { label: t.totalOrders, value: orderCount, href: "/admin/orders" },
    { label: t.openTickets, value: openTickets, href: "/admin/tickets" },
    { label: t.pendingQuotes, value: pendingQuotes, href: "/admin/quotes" },
  ];

  const recentTickets = await prisma.supportTicket.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: { select: { name: true, email: true, company: true } } },
  });

  const dt = getT().dashboard;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">{t.overview}</h1>
      <div className="grid grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="bg-[#111827] border border-white/10 p-5 hover:border-[#c9a84c]/40 transition-colors">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="text-3xl font-bold text-[#c9a84c] mt-1">{s.value}</p>
          </Link>
        ))}
      </div>
      <div className="bg-[#111827] border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">{t.openSupport}</h2>
          <Link href="/admin/tickets" className="text-sm text-[#c9a84c] hover:underline">{t.viewAll}</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{dt.subject}</th>
              <th className="px-6 py-3 font-medium">{t.customers}</th>
              <th className="px-6 py-3 font-medium">{dt.priority}</th>
              <th className="px-6 py-3 font-medium">{dt.status}</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map((tk) => (
              <tr key={tk.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-3 font-medium text-gray-300">{tk.subject}</td>
                <td className="px-6 py-3 text-gray-400">{tk.customer.company ?? tk.customer.name ?? tk.customer.email}</td>
                <td className="px-6 py-3 text-gray-400">{tk.priority}</td>
                <td className="px-6 py-3 text-gray-400">{tk.status}</td>
              </tr>
            ))}
            {recentTickets.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-500">{t.noTickets}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
