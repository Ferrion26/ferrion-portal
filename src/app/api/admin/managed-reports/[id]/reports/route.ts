import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteReportById } from "@/lib/managed-reports/deleteReport";

export const dynamic = "force-dynamic";

// Sammel-Löschen mehrerer Berichte auf einmal (Checkbox-Mehrfachauswahl im
// Admin-Bereich) — nutzt dieselbe Lösch-Logik wie die Einzel-Route
// ([reportId]/route.ts), nur je ausgewählter ID nacheinander aufgerufen.
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const reportIds: unknown = body?.reportIds;
  if (!Array.isArray(reportIds) || reportIds.length === 0 || !reportIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "reportIds fehlt oder ist leer" }, { status: 400 });
  }

  let deletedCount = 0;
  for (const reportId of reportIds) {
    const result = await deleteReportById(reportId, params.id);
    if (result === "deleted") deletedCount += 1;
  }

  return NextResponse.json({ ok: true, deletedCount });
}
