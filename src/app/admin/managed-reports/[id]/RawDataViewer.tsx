"use client";

import { useEffect, useState } from "react";
import { JsonTree } from "@/components/ui/JsonTree";

// Modal, das den vollständigen Rohdaten-Payload einer einzelnen Ingestion
// zeigt (inkl. meta.rawEndpoints) — lädt bei jedem Öffnen frisch über die
// bestehende GET .../ingestions/[ingestionId]-Route, unverändert seit dem
// bisherigen, auf die jeweils neueste Erhebung beschränkten Dump in
// MetricDetailPanel.tsx. Hier frei für jede historische Ingestion nutzbar.
export default function RawDataViewer({
  subscriptionId,
  ingestionId,
  label,
  onClose,
}: {
  subscriptionId: string;
  ingestionId: string;
  label?: string;
  onClose: () => void;
}) {
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPayload(null);
    fetch(`/api/admin/managed-reports/${subscriptionId}/ingestions/${ingestionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setPayload(data?.payload ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subscriptionId, ingestionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <div
        className="bg-[#111827] border border-white/10 w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div>
            <p className="text-sm font-semibold text-white">Rohdaten{label ? ` — ${label}` : ""}</p>
            <p className="text-xs text-gray-500 mt-0.5">Vollständiger Ingestion-Payload, inkl. Rohantworten der abgefragten REST-Endpunkte.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none px-2">
            ×
          </button>
        </div>
        <div className="px-4 py-3 border-b border-white/10 shrink-0">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtern (Feldname oder Wert)…"
            className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
          />
        </div>
        <div className="overflow-auto px-4 py-3 flex-1">
          {loading ? (
            <p className="text-gray-500 text-sm">Wird geladen…</p>
          ) : payload === null ? (
            <p className="text-gray-500 text-sm">Keine Rohdaten gefunden.</p>
          ) : (
            <JsonTree data={payload} filter={filter} />
          )}
        </div>
      </div>
    </div>
  );
}
