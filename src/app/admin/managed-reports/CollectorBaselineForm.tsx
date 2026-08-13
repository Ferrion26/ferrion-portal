"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NO_BASELINE = "";

export default function CollectorBaselineForm({
  initialMinVersion,
  knownVersions,
}: {
  initialMinVersion: string | null;
  knownVersions: string[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialMinVersion ?? NO_BASELINE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/managed-reports/settings/collector-baseline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minVersion: value === NO_BASELINE ? null : value }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Speichern fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Mindest-Collector-Version</label>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 w-56"
        >
          <option value={NO_BASELINE}>keine Baseline</option>
          {knownVersions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
      >
        {saving ? "Wird gespeichert…" : "Speichern"}
      </button>
      {error && <p className="text-xs text-red-400 pb-2">{error}</p>}
    </div>
  );
}
