import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { quarterLabel } from "@/lib/managed-reports/quarter";
import { PRODUCTS } from "@/app/produkte/products-data";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ adminNotes: z.string().max(2000).optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string; reportId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const report = await prisma.quarterlyReport.findUnique({
    where: { id: params.reportId },
    include: { subscription: { include: { customer: true } } },
  });
  if (!report || report.subscriptionId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.quarterlyReport.update({
    where: { id: params.reportId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      ...(parsed.data.adminNotes !== undefined ? { adminNotes: parsed.data.adminNotes } : {}),
    },
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey !== "re_REPLACE_WITH_YOUR_KEY") {
    const customer = report.subscription.customer;
    const product = PRODUCTS.find((p) => p.slug === report.subscription.productSlug);
    const resend = new Resend(apiKey);
    resend.emails
      .send({
        from: "Ferrion IT Systemhaus <kontakt@ferrion.at>",
        to: [customer.email],
        subject: `Ihr Quartalsbericht ${quarterLabel(report.periodStart)} — ${product?.name ?? report.subscription.productSlug}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0d1117; color: #e5e7eb; margin: 0; padding: 32px; }
  h1 { color: #c9a84c; font-size: 20px; margin-bottom: 8px; }
  .footer { font-size: 11px; color: #6b7280; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
</style></head>
<body>
  <h1>Ferrion IT Systemhaus</h1>
  <p style="color:#9ca3af;font-size:14px">Ihr Quartalsbericht für ${product?.name ?? report.subscription.productSlug} (${quarterLabel(report.periodStart)}) steht ab sofort in Ihrem Kundenportal zum Download bereit.</p>
  <p style="font-size:14px"><a href="${process.env.NEXTAUTH_URL ?? "https://ferrion.at"}/dashboard/reports" style="color:#c9a84c">Zum Kundenportal →</a></p>
  <div class="footer">
    <strong style="color:#c9a84c">Ferrion IT Systemhaus GmbH</strong><br>
    Wien, Österreich · info@ferrion.at · ferrion.at
  </div>
</body>
</html>`,
      })
      .catch((err) => console.error("Failed to send report-published email:", err));
  }

  return NextResponse.json(updated);
}
