import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  password: z.string().min(8).max(200),
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

  const { name, email, company, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Ein Kunde mit dieser E-Mail existiert bereits." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      company,
      phone,
      passwordHash,
      role: "CUSTOMER",
    },
    select: { id: true, name: true, email: true, company: true },
  });

  return NextResponse.json(customer, { status: 201 });
}
