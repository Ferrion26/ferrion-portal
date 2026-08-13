import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBaselineVersionSchema } from "@/lib/managed-reports/baselineSchema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const policy = await prisma.baselinePolicy.findUnique({ where: { id: params.id } });
  if (!policy) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createBaselineVersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { publicationDate, ...rest } = parsed.data;

  const existing = await prisma.baselineSoftwareVersion.findUnique({
    where: { policyId_versionNumber: { policyId: params.id, versionNumber: rest.versionNumber } },
  });
  if (existing) {
    return NextResponse.json({ error: "Diese Versionsnummer existiert bereits in dieser Policy." }, { status: 409 });
  }

  const version = await prisma.$transaction(async (tx) => {
    // Nur eine Version je Policy darf "empfohlen" sein.
    if (rest.recommended) {
      await tx.baselineSoftwareVersion.updateMany({
        where: { policyId: params.id, recommended: true },
        data: { recommended: false },
      });
    }
    return tx.baselineSoftwareVersion.create({
      data: { ...rest, policyId: params.id, publicationDate: publicationDate ? new Date(publicationDate) : undefined },
    });
  });
  return NextResponse.json(version, { status: 201 });
}
