import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENTS_BUCKET } from "@/lib/supabase";

// Gemeinsame Lösch-Logik für einen Bericht — von der Einzel-Lösch-Route und
// der Sammel-Lösch-Route genutzt, damit die Storage-Aufräum-Logik nicht
// zweimal gepflegt werden muss.
export async function deleteReportById(reportId: string, subscriptionId: string): Promise<"deleted" | "not_found"> {
  const report = await prisma.quarterlyReport.findUnique({
    where: { id: reportId },
    include: { document: true },
  });
  if (!report || report.subscriptionId !== subscriptionId) {
    return "not_found";
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
  return "deleted";
}
