"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { MetricHistoryChart } from "@/components/managed-reports/MetricHistoryChart";
import { formatValue, formatDateTime } from "@/lib/managed-reports/reportFormat";
import type { MetricDefinition } from "@/lib/managed-reports/metrics/types";
import RawDataViewer from "../RawDataViewer";

interface Edit {
  previousValue: number;
  newValue: number;
  reason: string;
  editedByEmail: string;
  editedAt: string;
}

interface Point {
  id: string;
  value: number;
  unit: string | null;
  recordedAt: string;
  edited: boolean;
  lastEditedAt: string | null;
  ingestion: { id: string; source: "COLLECTOR" | "MANUAL_UPLOAD"; receivedAt: string; fileName: string | null };
  edits: Edit[];
}

export default function MetricDetailPanel({
  subscriptionId,
  metricKey,
  definition,
  sectionLabel,
}: {
  subscriptionId: string;
  metricKey: string;
  definition?: MetricDefinition;
  sectionLabel: string;
}) {
  const router = useRouter();
  const [points, setPoints] = useState<Point[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setLoading(true);
    setUnlocked(false);
    setShowRaw(false);
    fetch(`/api/admin/managed-reports/${subscriptionId}/metrics/${encodeURIComponent(metricKey)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPoints(data?.points ?? null))
      .finally(() => setLoading(false));
  }, [subscriptionId, metricKey]);

  if (loading) return <p className="text-gray-500 text-sm">Wird geladen…</p>;
  if (!points || points.length === 0) return <p className="text-gray-500 text-sm">Keine Daten für diese Kennzahl.</p>;

  const format = definition?.format ?? "count";
  const unit = definition?.unit;
  const latest = points[points.length - 1];
  const fmt = (value: number) => formatValue({ format, value, unit }, "de");

  async function handleUnlock() {
    setEditValue(String(latest.value));
    setReason("");
    setUnlocked(true);
  }

  async function handleSave() {
    const parsedValue = Number(editValue.replace(",", "."));
    if (Number.isNaN(parsedValue) || reason.trim().length === 0) return;
    setSaving(true);
    const res = await fetch(`/api/admin/managed-reports/${subscriptionId}/metrics/point/${latest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newValue: parsedValue, reason: reason.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setUnlocked(false);
      router.refresh();
      // Neu laden, damit Edit-Historie/Diagramm sofort den korrigierten Wert zeigen.
      const fresh = await fetch(`/api/admin/managed-reports/${subscriptionId}/metrics/${encodeURIComponent(metricKey)}`);
      if (fresh.ok) setPoints((await fresh.json()).points);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">
          {sectionLabel} {definition?.derived && <span className="ml-2 text-[#c9a84c]">berechnet</span>}
        </p>
        <h3 className="text-lg font-semibold text-white">{definition?.label.de ?? metricKey}</h3>
        {definition?.methodology && <p className="text-xs text-gray-500 mt-1">{definition.methodology.de}</p>}
      </div>

      <div className="border border-white/10 p-4">
        <p className="text-xs text-gray-500 mb-2">
          Aktueller Wert · {formatDateTime(latest.recordedAt)}
          {latest.edited && (
            <>
              {" "}
              <Badge variant="yellow">bearbeitet</Badge>
            </>
          )}
        </p>

        {!unlocked ? (
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-white">{fmt(latest.value)}</p>
            <button
              type="button"
              onClick={handleUnlock}
              className="text-xs text-gray-400 hover:text-[#c9a84c] border border-white/10 px-3 py-1.5"
            >
              🔓 Entsperren
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 w-full"
            />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Begründung für die Korrektur (Pflichtfeld)"
              maxLength={500}
              rows={2}
              className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 w-full"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || reason.trim().length === 0}
                className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
              >
                {saving ? "Wird gespeichert…" : "Speichern"}
              </button>
              <button
                type="button"
                onClick={() => setUnlocked(false)}
                disabled={saving}
                className="text-xs text-gray-400 hover:text-white px-4 py-2"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border border-white/10 p-4">
        <p className="text-xs text-gray-500 mb-2">Ursprung</p>
        <p className="text-sm text-gray-300">
          <Badge variant={latest.ingestion.source === "MANUAL_UPLOAD" ? "yellow" : "green"}>
            {latest.ingestion.source === "MANUAL_UPLOAD" ? "Manueller Upload" : "Collector (Live)"}
          </Badge>{" "}
          · {formatDateTime(latest.ingestion.receivedAt)}
          {latest.ingestion.fileName && <> · {latest.ingestion.fileName}</>}
        </p>
        <button
          type="button"
          onClick={() => setShowRaw(true)}
          className="text-xs text-gray-500 hover:text-[#c9a84c] underline decoration-dotted mt-2"
        >
          Rohdaten dieser Erhebung anzeigen
        </button>
        {showRaw && (
          <RawDataViewer
            subscriptionId={subscriptionId}
            ingestionId={latest.ingestion.id}
            label={formatDateTime(latest.ingestion.receivedAt)}
            onClose={() => setShowRaw(false)}
          />
        )}
      </div>

      {latest.edits.length > 0 && (
        <div className="border border-white/10 p-4">
          <p className="text-xs text-gray-500 mb-2">Bearbeitungshistorie</p>
          <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="py-1 font-medium">Zeitpunkt</th>
                <th className="py-1 font-medium">Vorher</th>
                <th className="py-1 font-medium">Nachher</th>
                <th className="py-1 font-medium">Begründung</th>
                <th className="py-1 font-medium">Admin</th>
              </tr>
            </thead>
            <tbody>
              {latest.edits.map((e, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-1 text-gray-400 whitespace-nowrap">{formatDateTime(e.editedAt)}</td>
                  <td className="py-1 text-gray-400">{fmt(e.previousValue)}</td>
                  <td className="py-1 text-white">{fmt(e.newValue)}</td>
                  <td className="py-1 text-gray-400">{e.reason}</td>
                  <td className="py-1 text-gray-400">{e.editedByEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {points.length > 1 && (
        <div className="border border-white/10 p-4">
          <p className="text-xs text-gray-500 mb-2">Verlauf</p>
          <MetricHistoryChart points={points} format={format} unit={unit} locale="de" />
        </div>
      )}

      <div className="border border-white/10 p-4">
        <p className="text-xs text-gray-500 mb-2">Alle Messwerte ({points.length})</p>
        <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="py-1 font-medium">Zeitpunkt</th>
              <th className="py-1 font-medium">Wert</th>
              <th className="py-1 font-medium">Quelle</th>
              <th className="py-1 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-1 text-gray-400 whitespace-nowrap">{formatDateTime(p.recordedAt)}</td>
                <td className="py-1 text-white">{fmt(p.value)}</td>
                <td className="py-1">
                  <Badge variant={p.ingestion.source === "MANUAL_UPLOAD" ? "yellow" : "green"}>
                    {p.ingestion.source === "MANUAL_UPLOAD" ? "Manuell" : "Collector"}
                  </Badge>
                </td>
                <td className="py-1">{p.edited && <Badge variant="yellow">bearbeitet</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
