import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ticketStatusBadge, priorityBadge } from "@/components/ui/Badge";
import Link from "next/link";

export const metadata = { title: "Support — Ferrion Portal" };

export default async function TicketsPage() {
  const session = await getSession();
  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <Link href="/dashboard/tickets/new" className="btn-primary">
          + New Ticket
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Priority</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Messages</th>
              <th className="px-6 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{t.subject}</td>
                <td className="px-6 py-4">{priorityBadge(t.priority)}</td>
                <td className="px-6 py-4">{ticketStatusBadge(t.status)}</td>
                <td className="px-6 py-4 text-gray-500">{t._count.messages}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(t.updatedAt)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No tickets yet.{" "}
                  <Link href="/dashboard/tickets/new" className="text-brand-600 hover:underline">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
