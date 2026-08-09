"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PERIOD_TYPES = [
  { value: "MONTH", label: "Monat" },
  { value: "QUARTER", label: "Quartal" },
  { value: "HALF_YEAR", label: "Halbjahr" },
  { value: "YEAR", label: "Jahr" },
] as const;

type PeriodTypeValue = (typeof PERIOD_TYPES)[number]["value"];

export default function GenerateReportButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [periodType, setPeriodType] = useState<PeriodTypeValue>("QUARTER");
  const [loading, setLoading] = useState<"last" | "current" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(period: "last" | "current") {
    setLoading(period);
    setError(null);
    const res = await fetch(`/api/admin/managed-reports/${subscriptionId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, periodType }),
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
      <div className="flex items-center gap-3">
        <select
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value as PeriodTypeValue)}
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
