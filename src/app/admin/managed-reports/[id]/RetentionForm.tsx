"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetentionForm({ subscriptionId, initialDays }: { subscriptionId: string; initialDays: number | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initialDays !== null ? String(initialDays) : "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const days = value.trim() === "" ? null : Number(value);
    if (days !== null && (!Number.isInteger(days) || days < 1)) return;

    setSaving(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metricsRetentionDays: days }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Aufbewahrung (Tage)</label>
        <input
          type="number"
          min={1}
          placeholder="unbegrenzt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 w-32"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
      >
        {saving ? "Wird gespeichert…" : "Speichern"}
      </button>
    </div>
  );
}
