import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/managed-reports/apiKey";

export const dynamic = "force-dynamic";

const createSchema = z.object({ label: z.string().min(1).max(100) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const subscription = await prisma.managedServiceSubscription.findUnique({ where: { id: params.id } });
  if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { raw, hash } = generateApiKey();
  const apiKey = await prisma.collectorApiKey.create({
    data: { subscriptionId: params.id, label: parsed.data.label, keyHash: hash },
  });

  // The raw key is only ever returned here — it is not recoverable afterwards.
  return NextResponse.json({ id: apiKey.id, label: apiKey.label, rawKey: raw }, { status: 201 });
}
