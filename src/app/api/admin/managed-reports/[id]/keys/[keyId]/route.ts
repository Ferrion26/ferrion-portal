import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string; keyId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = await prisma.collectorApiKey.findUnique({ where: { id: params.keyId } });
  if (!apiKey || apiKey.subscriptionId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.collectorApiKey.update({ where: { id: params.keyId }, data: { revokedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
