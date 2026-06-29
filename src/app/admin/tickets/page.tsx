import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ticketStatusBadge, priorityBadge } from "@/components/ui/Badge";
import Link from "next/link";

export const metadata = { title: "Tickets — Admin" };

export default async function AdminTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      customer: { select: { name: true, email: true, company: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Priority</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Messages</th>
              <th className="px-6 py-3 font-medium">Updated</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{t.subject}</td>
                <td className="px-6 py-4 text-gray-500">
                  {t.customer.company ?? t.customer.name ?? t.customer.email}
                </td>
                <td className="px-6 py-4">{priorityBadge(t.priority)}</td>
                <td className="px-6 py-4">{ticketStatusBadge(t.status)}</td>
                <td className="px-6 py-4 text-gray-500">{t._count.messages}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(t.updatedAt)}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/tickets/${t.id}`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-400">
                  No tickets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
