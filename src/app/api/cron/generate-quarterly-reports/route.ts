import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuarterlyReport } from "@/lib/managed-reports/generateReportPdf";
import { getMostRecentCompletedQuarter } from "@/lib/managed-reports/quarter";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Von Vercel Cron ausgelöst (siehe vercel.json, "crons"), am 1. Tag nach
// Quartalsende. Erzeugt für jede aktive Subscription einen DRAFT-Bericht —
// **kein** Auto-Publish, der Admin prüft und veröffentlicht jeden Bericht
// manuell unter /admin/managed-reports, da die Collector-Datenqualität
// variieren kann.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { periodStart, periodEnd } = getMostRecentCompletedQuarter();
  const subscriptions = await prisma.managedServiceSubscription.findMany({ where: { active: true } });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const existing = await prisma.quarterlyReport.findFirst({
        where: { subscriptionId: sub.id, periodStart, periodEnd },
      });
      if (existing) return { subscriptionId: sub.id, skipped: true };

      const report = await generateQuarterlyReport(sub.id, periodStart, periodEnd);
      return { subscriptionId: sub.id, reportId: report.id };
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .map((r, i) => ({ r, subscriptionId: subscriptions[i].id }))
    .filter(({ r }) => r.status === "rejected")
    .map(({ r, subscriptionId }) => ({
      subscriptionId,
      error: r.status === "rejected" ? String(r.reason) : undefined,
    }));

  if (failed.length > 0) {
    console.error("generate-quarterly-reports: failures", failed);
  }

  return NextResponse.json({ periodStart, periodEnd, total: subscriptions.length, succeeded, failed });
}
