"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PeriodType } from "@/lib/managed-reports/quarter";

const PERIOD_TYPES: { value: PeriodType; label: string }[] = [
  { value: "MONTH", label: "Monat" },
  { value: "QUARTER", label: "Quartal" },
  { value: "HALF_YEAR", label: "Halbjahr" },
  { value: "YEAR", label: "Jahr" },
];

export interface SiblingSubscription {
  id: string;
  label: string;
}

export default function GenerateReportButton({
  subscriptionId,
  defaultPeriodType,
  siblings = [],
}: {
  subscriptionId: string;
  defaultPeriodType?: PeriodType;
  siblings?: SiblingSubscription[];
}) {
  const router = useRouter();
  const [periodType, setPeriodType] = useState<PeriodType>(defaultPeriodType ?? "QUARTER");
  const [selectedSiblings, setSelectedSiblings] = useState<string[]>([]);
  const [loading, setLoading] = useState<"last" | "current" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSibling(id: string) {
    setSelectedSiblings((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleClick(period: "last" | "current") {
    setLoading(period);
    setError(null);
    const res = await fetch(`/api/admin/managed-reports/${subscriptionId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, periodType, additionalSubscriptionIds: selectedSiblings }),
    });
    setLoading(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erstellung fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {siblings.length > 0 && (
        <div className="flex flex-col items-end gap-1.5 mb-1">
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">Weitere Produkte kombinieren</p>
          <div className="flex flex-wrap justify-end gap-3">
            {siblings.map((s) => (
              <label key={s.id} className="flex items-center gap-1.5 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedSiblings.includes(s.id)}
                  onChange={() => toggleSibling(s.id)}
                  className="accent-[#c9a84c]"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <select
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value as PeriodType)}
          className="bg-[#0d1117] border border-white/10 text-white text-xs px-3 py-2.5"
        >
          {PERIOD_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleClick("last")}
          disabled={loading !== null}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {loading === "last" ? "Wird erstellt…" : "Letzten abgeschlossenen Zeitraum erstellen"}
        </button>
        <button
          onClick={() => handleClick("current")}
          disabled={loading !== null}
          title="Vorschau für den laufenden, noch nicht abgeschlossenen Zeitraum — z. B. um einen frisch eingerichteten Collector zu testen."
          className="border border-white/20 text-gray-300 text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors disabled:opacity-50"
        >
          {loading === "current" ? "Wird erstellt…" : "Vorschau für laufenden Zeitraum"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
