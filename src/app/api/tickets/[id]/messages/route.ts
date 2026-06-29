import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ body: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin or the ticket owner can reply
  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN" && ticket.customerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const message = await prisma.ticketMessage.create({
    data: {
      body: parsed.data.body,
      ticketId: params.id,
      authorId: session.user.id,
    },
  });

  // Re-open if customer replies to a resolved ticket
  if (session.user.role === "CUSTOMER" && ticket.status === "RESOLVED") {
    await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: "OPEN" },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
