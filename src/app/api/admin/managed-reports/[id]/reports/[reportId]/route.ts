import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENTS_BUCKET } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string; reportId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const report = await prisma.quarterlyReport.findUnique({
    where: { id: params.reportId },
    include: { document: true },
  });
  if (!report || report.subscriptionId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (report.document) {
    const supabase = createAdminClient();
    const { error: storageError } = await supabase.storage.from(DOCUMENTS_BUCKET).remove([report.document.storagePath]);
    if (storageError) {
      // Nicht blockierend — verwaiste Storage-Datei ist unschön, aber kein
      // Grund, das Löschen des Berichts in der DB zu verhindern.
      console.error("Konnte PDF nicht aus Storage entfernen:", storageError);
    }
    await prisma.document.delete({ where: { id: report.document.id } });
  }

  await prisma.quarterlyReport.delete({ where: { id: report.id } });

  return NextResponse.json({ ok: true });
}
