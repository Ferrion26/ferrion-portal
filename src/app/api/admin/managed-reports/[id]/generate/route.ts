import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateQuarterlyReport, generateCombinedReport } from "@/lib/managed-reports/generateReportPdf";
import { getMostRecentCompletedPeriod, getCurrentPeriod, PeriodType } from "@/lib/managed-reports/quarter";

export const dynamic = "force-dynamic";

const VALID_PERIOD_TYPES: PeriodType[] = ["MONTH", "QUARTER", "HALF_YEAR", "YEAR"];

// Erzeugt einen Bericht als DRAFT für den gewählten Zeitraumtyp (Monat/
// Quartal/Halbjahr/Jahr, Standard: Quartal). Standardmäßig für den zuletzt
// abgeschlossenen Zeitraum (period: "last", auch vom Cron verwendet).
// period: "current" erzeugt stattdessen einen Vorschau-Bericht für den
// laufenden, noch nicht abgeschlossenen Zeitraum — z. B. um einen frisch
// eingerichteten Collector zu testen, bevor der erste volle Zeitraum um ist.
// additionalSubscriptionIds (optional) kombiniert weitere Subscriptions
// desselben Kunden in einem PDF mit getrennten Abschnitten pro Produkt.
// Der Admin prüft/veröffentlicht den Bericht danach separat
// (POST .../reports/[reportId]/publish).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const period = body.period === "current" ? "current" : "last";
  const periodType: PeriodType = VALID_PERIOD_TYPES.includes(body.periodType) ? body.periodType : "QUARTER";
  const additionalSubscriptionIds: string[] = Array.isArray(body.additionalSubscriptionIds)
    ? body.additionalSubscriptionIds.filter((id: unknown) => typeof id === "string")
    : [];
  const { periodStart, periodEnd } = period === "current" ? getCurrentPeriod(periodType) : getMostRecentCompletedPeriod(periodType);

  try {
    const report =
      additionalSubscriptionIds.length > 0
        ? await generateCombinedReport([params.id, ...additionalSubscriptionIds], periodStart, periodEnd, periodType)
        : await generateQuarterlyReport(params.id, periodStart, periodEnd, periodType);
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error("Report generation failed:", err);
    const message = err instanceof Error ? err.message : "Report generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
