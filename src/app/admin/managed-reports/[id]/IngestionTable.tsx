"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/managed-reports/reportFormat";
import RawDataViewer from "./RawDataViewer";

type Ingestion = { id: string; receivedAt: string; source: string; fileName: string | null; metricsCount: number };

export default function IngestionTable({ subscriptionId, ingestions }: { subscriptionId: string; ingestions: Ingestion[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [rawViewIngestion, setRawViewIngestion] = useState<Ingestion | null>(null);

  const allSelected = ingestions.length > 0 && selected.size === ingestions.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(ingestions.map((i) => i.id)));
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
    if (!confirm(`${selected.size} Ingestion(s) inkl. aller zugehörigen Kennzahlen endgültig löschen?`)) return;

    setDeleting(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}/ingestions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingestionIds: Array.from(selected) }),
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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-gray-500">
            <th className="py-2 pr-2 font-medium w-6">
              <input type="checkbox" className="accent-[#c9a84c]" checked={allSelected} onChange={toggleAll} aria-label="Alle auswählen" />
            </th>
            <th className="py-2 font-medium">Zeitpunkt</th>
            <th className="py-2 font-medium">Quelle</th>
            <th className="py-2 font-medium">Datei</th>
            <th className="py-2 font-medium">Kennzahlen</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {ingestions.map((ing) => (
            <tr key={ing.id} className="border-b border-white/5">
              <td className="py-2 pr-2">
                <input
                  type="checkbox"
                  className="accent-[#c9a84c]"
                  checked={selected.has(ing.id)}
                  onChange={() => toggleOne(ing.id)}
                  aria-label="Auswählen"
                />
              </td>
              <td className="py-2 text-gray-300">{formatDateTime(new Date(ing.receivedAt))}</td>
              <td className="py-2">
                <Badge variant={ing.source === "MANUAL_UPLOAD" ? "yellow" : "green"}>
                  {ing.source === "MANUAL_UPLOAD" ? "Manueller Upload" : "Collector (Live)"}
                </Badge>
              </td>
              <td className="py-2 text-gray-400">{ing.fileName ?? "—"}</td>
              <td className="py-2 text-gray-400">{ing.metricsCount}</td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  onClick={() => setRawViewIngestion(ing)}
                  className="text-xs text-gray-500 hover:text-[#c9a84c] underline decoration-dotted"
                >
                  Rohdaten anzeigen
                </button>
              </td>
            </tr>
          ))}
          {ingestions.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                Noch keine Daten eingegangen.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {rawViewIngestion && (
        <RawDataViewer
          subscriptionId={subscriptionId}
          ingestionId={rawViewIngestion.id}
          label={formatDateTime(new Date(rawViewIngestion.receivedAt))}
          onClose={() => setRawViewIngestion(null)}
        />
      )}
    </div>
  );
}
