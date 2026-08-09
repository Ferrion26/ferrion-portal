import { NextRequest, NextResponse } from "next/server";
import { cleanupOldData } from "@/lib/managed-reports/cleanupOldData";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Von Vercel Cron täglich ausgelöst (siehe vercel.json, "crons"). Löscht nur
// bei Subscriptions mit explizit gesetzter Aufbewahrungsfrist
// (metricsRetentionDays) — ohne gesetzte Frist bleibt alles unbegrenzt
// erhalten, das ist bewusst der sichere Standard.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await cleanupOldData();
  const totals = results.reduce(
    (acc, r) => ({
      metricsDeleted: acc.metricsDeleted + r.metricsDeleted,
      ingestionsDeleted: acc.ingestionsDeleted + r.ingestionsDeleted,
      findingsDeleted: acc.findingsDeleted + r.findingsDeleted,
    }),
    { metricsDeleted: 0, ingestionsDeleted: 0, findingsDeleted: 0 }
  );

  if (totals.metricsDeleted + totals.ingestionsDeleted + totals.findingsDeleted > 0) {
    console.log("cleanup-old-data:", totals, "across", results.length, "subscriptions with a retention policy");
  }

  return NextResponse.json({ subscriptionsWithRetention: results.length, ...totals, results });
}
