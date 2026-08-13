import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteReportById } from "@/lib/managed-reports/deleteReport";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string; reportId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await deleteReportById(params.reportId, params.id);
  if (result === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
