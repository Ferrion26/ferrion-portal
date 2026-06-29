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
        <h1 className="text-2xl font-bold text-white">Support-Tickets</h1>
        <Link
          href="/dashboard/tickets/new"
          className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-4 py-2 text-xs font-bold tracking-widest uppercase"
        >
          + Neues Ticket
        </Link>
      </div>

      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Betreff</th>
              <th className="px-6 py-3 font-medium">Priorität</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Nachrichten</th>
              <th className="px-6 py-3 font-medium">Aktualisiert</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-gray-300">{t.subject}</td>
                <td className="px-6 py-4">{priorityBadge(t.priority)}</td>
                <td className="px-6 py-4">{ticketStatusBadge(t.status)}</td>
                <td className="px-6 py-4 text-gray-400">{t._count.messages}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(t.updatedAt)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Noch keine Tickets vorhanden.{" "}
                  <Link href="/dashboard/tickets/new" className="text-[#c9a84c] hover:underline">
                    Jetzt erstellen
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
