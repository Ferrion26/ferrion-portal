import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMetricKeySummary } from "@/lib/managed-reports/metricBrowser";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = await getMetricKeySummary(params.id);
  return NextResponse.json(summary);
}
