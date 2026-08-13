"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/managed-reports/reportFormat";
import { periodLabel, type PeriodType } from "@/lib/managed-reports/quarter";
import ReportDownloadButton from "@/components/managed-reports/ReportDownloadButton";
import PublishButton from "./PublishButton";
import DeleteReportButton from "./DeleteReportButton";

type Report = {
  id: string;
  periodType: PeriodType;
  periodStart: string;
  generatedAt: string;
  status: "DRAFT" | "PUBLISHED";
  additionalSubscriptionIds: string[];
  document: { id: string; name: string } | null;
};

export default function ReportsTable({ subscriptionId, reports }: { subscriptionId: string; reports: Report[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = reports.length > 0 && selected.size === reports.length;
  const selectedHasPublished = reports.some((r) => selected.has(r.id) && r.status === "PUBLISHED");

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(reports.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    const warning = selectedHasPublished
      ? `${selected.size} Bericht(e) endgültig löschen? Mindestens einer davon wurde bereits veröffentlicht — der Kunde hat ihn möglicherweise schon gesehen oder heruntergeladen.`
      : `${selected.size} Berichtsentwurf/-entwürfe endgültig löschen?`;
    if (!confirm(warning)) return;

    setDeleting(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}/reports`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportIds: Array.from(selected) }),
    });
    setDeleting(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center justify-between mb-3 bg-red-500/5 border border-red-500/20 px-3 py-2">
          <p className="text-xs text-gray-300">{selected.size} ausgewählt</p>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 font-medium"
          >
            {deleting ? "…" : "Ausgewählte löschen"}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-gray-500">
            <th className="py-2 pr-2 font-medium w-6">
              <input type="checkbox" className="accent-[#c9a84c]" checked={allSelected} onChange={toggleAll} aria-label="Alle auswählen" />
            </th>
            <th className="py-2 font-medium">Zeitraum</th>
            <th className="py-2 font-medium">Erstellt</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b border-white/5">
              <td className="py-2 pr-2">
                <input
                  type="checkbox"
                  className="accent-[#c9a84c]"
                  checked={selected.has(report.id)}
                  onChange={() => toggleOne(report.id)}
                  aria-label="Auswählen"
                />
              </td>
              <td className="py-2 text-gray-300">
                {periodLabel(report.periodType, new Date(report.periodStart))}
                {report.additionalSubscriptionIds.length > 0 && (
                  <span className="ml-2 text-[10px] text-[#c9a84c] tracking-widest uppercase">
                    kombiniert ({report.additionalSubscriptionIds.length + 1} Produkte)
                  </span>
                )}
              </td>
              <td className="py-2 text-gray-400">{formatDateTime(new Date(report.generatedAt))}</td>
              <td className="py-2">
                <Badge variant={report.status === "PUBLISHED" ? "green" : "yellow"}>
                  {report.status === "PUBLISHED" ? "Veröffentlicht" : "Entwurf"}
                </Badge>
              </td>
              <td className="py-2 text-right space-x-4">
                <Link href={`/dashboard/reports/${report.id}`} className="text-sm text-[#c9a84c] hover:text-[#e0bc5a] font-medium">
                  Anzeigen →
                </Link>
                {report.document && <ReportDownloadButton documentId={report.document.id} fileName={report.document.name} />}
                {report.status === "DRAFT" && <PublishButton subscriptionId={subscriptionId} reportId={report.id} />}
                <DeleteReportButton subscriptionId={subscriptionId} reportId={report.id} published={report.status === "PUBLISHED"} />
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                Noch kein Bericht erstellt.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
