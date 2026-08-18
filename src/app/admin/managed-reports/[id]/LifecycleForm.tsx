"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS: { value: "ACTIVE" | "PHASING_OUT" | "END_OF_LIFE" | ""; label: string }[] = [
  { value: "", label: "— nicht gesetzt —" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "PHASING_OUT", label: "Auslaufend" },
  { value: "END_OF_LIFE", label: "End-of-Life" },
];

// Datum als YYYY-MM-DD fürs <input type="date"> — toISOString() liefert
// den vollen Zeitstempel, das date-Input braucht aber nur den Datumsteil.
function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export default function LifecycleForm({
  subscriptionId,
  initialStatus,
  initialEndDate,
}: {
  subscriptionId: string;
  initialStatus: "ACTIVE" | "PHASING_OUT" | "END_OF_LIFE" | null;
  initialEndDate: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus ?? "");
  const [endDate, setEndDate] = useState(toDateInputValue(initialEndDate));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lifecycleStatus: status || null,
        lifecycleEndDate: endDate || null,
      }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as typeof status)}
        className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
      >
        {saving ? "Wird gespeichert…" : "Speichern"}
      </button>
    </div>
  );
}
