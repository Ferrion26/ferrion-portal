import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateQuarterlyReport } from "@/lib/managed-reports/generateReportPdf";
import { getMostRecentCompletedQuarter } from "@/lib/managed-reports/quarter";

export const dynamic = "force-dynamic";

// Erzeugt einen QuarterlyReport als DRAFT für das zuletzt abgeschlossene
// Quartal. Der Admin prüft/veröffentlicht den Bericht danach separat
// (POST .../reports/[reportId]/publish).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { periodStart, periodEnd } = getMostRecentCompletedQuarter();

  try {
    const report = await generateQuarterlyReport(params.id, periodStart, periodEnd);
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error("Report generation failed:", err);
    const message = err instanceof Error ? err.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
