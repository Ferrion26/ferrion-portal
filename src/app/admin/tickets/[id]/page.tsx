import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ticketStatusBadge, priorityBadge } from "@/components/ui/Badge";
import TicketReplyForm from "./TicketReplyForm";
import StatusUpdateForm from "./StatusUpdateForm";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { name: true, email: true, company: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, email: true, role: true } } },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
        <div className="flex items-center gap-3 mt-2">
          {ticketStatusBadge(ticket.status)}
          {priorityBadge(ticket.priority)}
          <span className="text-sm text-gray-400">
            {ticket.customer.company ?? ticket.customer.email}
          </span>
        </div>
      </div>

      <StatusUpdateForm ticketId={ticket.id} currentStatus={ticket.status} />

      <div className="card divide-y divide-gray-100">
        {ticket.messages.map((msg) => (
          <div key={msg.id} className="px-6 py-4">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm font-medium ${
                  msg.author.role === "ADMIN" ? "text-brand-700" : "text-gray-800"
                }`}
              >
                {msg.author.name ?? msg.author.email}
                {msg.author.role === "ADMIN" && (
                  <span className="ml-2 text-xs text-brand-500">(Admin)</span>
                )}
              </span>
              <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.body}</p>
          </div>
        ))}
        {ticket.messages.length === 0 && (
          <p className="px-6 py-4 text-sm text-gray-400">No messages yet.</p>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Reply</h2>
        <TicketReplyForm ticketId={ticket.id} />
      </div>
    </div>
  );
}
