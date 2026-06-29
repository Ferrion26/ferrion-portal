import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ticketStatusBadge, priorityBadge } from "@/components/ui/Badge";
import Link from "next/link";

export const metadata = { title: "Support — Ferrion Portal" };

export default async function TicketsPage() {
  const session = await getSession();
  const t = getT().dashboard;
  const tickets = await prisma.supportTicket.findMany({
    where: { customerId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t.support}</h1>
        <Link href="/dashboard/tickets/new" className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-4 py-2 text-xs font-bold tracking-widest uppercase">
          {t.newTicket}
        </Link>
      </div>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{t.subject}</th>
              <th className="px-6 py-3 font-medium">{t.priority}</th>
              <th className="px-6 py-3 font-medium">{t.status}</th>
              <th className="px-6 py-3 font-medium">{t.messages}</th>
              <th className="px-6 py-3 font-medium">{t.updated}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t2) => (
              <tr key={t2.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-gray-300">{t2.subject}</td>
                <td className="px-6 py-4">{priorityBadge(t2.priority)}</td>
                <td className="px-6 py-4">{ticketStatusBadge(t2.status)}</td>
                <td className="px-6 py-4 text-gray-400">{t2._count.messages}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(t2.updatedAt)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {t.noTickets}{" "}
                  <Link href="/dashboard/tickets/new" className="text-[#c9a84c] hover:underline">{t.createOne}</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
