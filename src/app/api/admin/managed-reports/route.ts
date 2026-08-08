import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  customerId: z.string().min(1),
  productSlug: z.string().min(1),
  packageId: z.enum(["MONITOR", "OPERATE", "COMPLETE"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const subscription = await prisma.managedServiceSubscription.create({
    data: parsed.data,
  });

  return NextResponse.json(subscription, { status: 201 });
}
