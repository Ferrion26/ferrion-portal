import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const policy = await prisma.baselinePolicy.findUnique({ where: { id: params.id } });
  if (!policy) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // onDelete: Cascade auf BaselineSoftwareVersion (siehe schema.prisma).
  await prisma.baselinePolicy.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
