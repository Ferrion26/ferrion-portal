import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { periodLabel } from "@/lib/managed-reports/quarter";
import { ReportDashboardView } from "@/components/managed-reports/ReportDashboardView";
import type { ProductReportData } from "@/lib/managed-reports/pdf/ReportDocument";

export const metadata = { title: "Bericht — Ferrion Portal" };

export default async function ReportDashboardPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { product?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const report = await prisma.quarterlyReport.findUnique({
    where: { id: params.id },
    include: { subscription: { include: { customer: true } }, document: true },
  });
  if (!report) notFound();

  const isOwner = report.subscription.customerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) notFound();
  // Kunden sehen nur veröffentlichte Berichte — Entwürfe sind admin-only,
  // auch wenn sie versehentlich die ID erraten/aufrufen.
  if (!isAdmin && report.status !== "PUBLISHED") notFound();

  const products = report.summary as unknown as ProductReportData[];
  if (!Array.isArray(products) || products.length === 0) notFound();

  const activeIndex = Math.min(Math.max(Number(searchParams.product ?? 0) || 0, 0), products.length - 1);
  const customerCompany = report.subscription.customer.company || report.subscription.customer.name || report.subscription.customer.email;

  return (
    <ReportDashboardView
      locale="de"
      customerCompany={customerCompany}
      periodLabel={periodLabel(report.periodType, report.periodStart)}
      generatedAt={report.generatedAt}
      products={products}
      activeIndex={activeIndex}
      basePath={`/dashboard/reports/${report.id}`}
      documentId={report.document?.id}
      documentFileName={report.document?.name}
    />
  );
}
