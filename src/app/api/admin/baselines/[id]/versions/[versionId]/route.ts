import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateBaselineVersionSchema } from "@/lib/managed-reports/baselineSchema";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string; versionId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const version = await prisma.baselineSoftwareVersion.findUnique({ where: { id: params.versionId } });
  if (!version || version.policyId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateBaselineVersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { publicationDate, ...rest } = parsed.data;

  if (rest.versionNumber && rest.versionNumber !== version.versionNumber) {
    const clash = await prisma.baselineSoftwareVersion.findUnique({
      where: { policyId_versionNumber: { policyId: params.id, versionNumber: rest.versionNumber } },
    });
    if (clash) {
      return NextResponse.json({ error: "Diese Versionsnummer existiert bereits in dieser Policy." }, { status: 409 });
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (rest.recommended) {
      await tx.baselineSoftwareVersion.updateMany({
        where: { policyId: params.id, recommended: true, id: { not: version.id } },
        data: { recommended: false },
      });
    }
    return tx.baselineSoftwareVersion.update({
      where: { id: version.id },
      data: { ...rest, ...(publicationDate !== undefined ? { publicationDate: publicationDate ? new Date(publicationDate) : null } : {}) },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string; versionId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const version = await prisma.baselineSoftwareVersion.findUnique({ where: { id: params.versionId } });
  if (!version || version.policyId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.baselineSoftwareVersion.delete({ where: { id: version.id } });
  return NextResponse.json({ ok: true });
}
