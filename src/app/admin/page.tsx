import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin — Ferrion Portal" };

export default async function AdminDashboard() {
  const [customerCount, orderCount, openTickets, pendingQuotes] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.quote.count({ where: { status: "SENT" } }),
  ]);

  const stats = [
    { label: "Customers", value: customerCount, href: "/admin/customers" },
    { label: "Total Orders", value: orderCount, href: "/admin/orders" },
    { label: "Open Tickets", value: openTickets, href: "/admin/tickets" },
    { label: "Pending Quotes", value: pendingQuotes, href: "/admin/quotes" },
  ];

  const recentTickets = await prisma.supportTicket.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: { select: { name: true, email: true, company: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Overview</h1>

      <div className="grid grid-cols-4 gap-5 mb-10">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="card p-5 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Open Support Tickets</h2>
          <Link href="/admin/tickets" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Priority</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{t.subject}</td>
                <td className="px-6 py-3 text-gray-500">
                  {t.customer.company ?? t.customer.name ?? t.customer.email}
                </td>
                <td className="px-6 py-3">{t.priority}</td>
                <td className="px-6 py-3">{t.status}</td>
              </tr>
            ))}
            {recentTickets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                  No open tickets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
