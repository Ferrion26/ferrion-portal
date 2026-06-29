import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ticketStatusBadge, priorityBadge } from "@/components/ui/Badge";
import Link from "next/link";

export const metadata = { title: "Tickets — Admin" };

export default async function AdminTicketsPage() {
  const t = getT();
  const at = t.admin;
  const dt = t.dashboard;

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      customer: { select: { name: true, email: true, company: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{at.sidebar.tickets}</h1>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{dt.subject}</th>
              <th className="px-6 py-3 font-medium">{at.customers}</th>
              <th className="px-6 py-3 font-medium">{dt.priority}</th>
              <th className="px-6 py-3 font-medium">{dt.status}</th>
              <th className="px-6 py-3 font-medium">{dt.messages}</th>
              <th className="px-6 py-3 font-medium">{dt.updated}</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((tk) => (
              <tr key={tk.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-gray-300">{tk.subject}</td>
                <td className="px-6 py-4 text-gray-400">{tk.customer.company ?? tk.customer.name ?? tk.customer.email}</td>
                <td className="px-6 py-4">{priorityBadge(tk.priority)}</td>
                <td className="px-6 py-4">{ticketStatusBadge(tk.status)}</td>
                <td className="px-6 py-4 text-gray-400">{tk._count.messages}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(tk.updatedAt)}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/tickets/${tk.id}`} className="text-sm text-[#c9a84c] hover:underline">{at.open}</Link>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-6 text-center text-gray-500">{at.noTickets}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
