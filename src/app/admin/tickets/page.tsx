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
      <h1 className="text-2xl font-bold text-white mb-6">Support-Tickets</h1>

      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Betreff</th>
              <th className="px-6 py-3 font-medium">Kunde</th>
              <th className="px-6 py-3 font-medium">Priorität</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Nachrichten</th>
              <th className="px-6 py-3 font-medium">Aktualisiert</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-gray-300">{t.subject}</td>
                <td className="px-6 py-4 text-gray-400">
                  {t.customer.company ?? t.customer.name ?? t.customer.email}
                </td>
                <td className="px-6 py-4">{priorityBadge(t.priority)}</td>
                <td className="px-6 py-4">{ticketStatusBadge(t.status)}</td>
                <td className="px-6 py-4 text-gray-400">{t._count.messages}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(t.updatedAt)}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/tickets/${t.id}`} className="text-sm text-[#c9a84c] hover:underline">
                    Öffnen
                  </Link>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                  Keine Tickets vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
