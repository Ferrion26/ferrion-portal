import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateQuarterlyReport } from "@/lib/managed-reports/generateReportPdf";
import { getMostRecentCompletedQuarter, getCurrentQuarter } from "@/lib/managed-reports/quarter";

export const dynamic = "force-dynamic";

// Erzeugt einen QuarterlyReport als DRAFT. Standardmäßig für das zuletzt
// abgeschlossene Quartal (period: "last", auch vom Cron verwendet).
// period: "current" erzeugt stattdessen einen Vorschau-Bericht für das
// laufende, noch nicht abgeschlossene Quartal — z. B. um einen frisch
// eingerichteten Collector zu testen, bevor das erste volle Quartal um ist.
// Der Admin prüft/veröffentlicht den Bericht danach separat
// (POST .../reports/[reportId]/publish).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const period = body.period === "current" ? "current" : "last";
  const { periodStart, periodEnd } = period === "current" ? getCurrentQuarter() : getMostRecentCompletedQuarter();

  try {
    const report = await generateQuarterlyReport(params.id, periodStart, periodEnd);
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error("Report generation failed:", err);
    const message = err instanceof Error ? err.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
