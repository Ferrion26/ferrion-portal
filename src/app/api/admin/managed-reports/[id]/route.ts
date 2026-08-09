import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  replicationNote: z.string().max(500).nullable(),
});

// Bisher nur für replicationNote gedacht — ein vom Admin gepflegter Freitext,
// um eine Beziehung zu einem anderen System zu dokumentieren (z. B.
// "Snapshots werden von OceanProtect X8000 repliziert"), der im Bericht als
// Hinweiszeile erscheint.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const subscription = await prisma.managedServiceSubscription.update({
    where: { id: params.id },
    data: { replicationNote: parsed.data.replicationNote },
  });

  return NextResponse.json(subscription);
}
