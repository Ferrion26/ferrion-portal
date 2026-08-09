"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CollectorBaselineForm({ initialMinVersion }: { initialMinVersion: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initialMinVersion ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = value.trim();
    if (trimmed !== "" && !/^\d+\.\d+\.\d+$/.test(trimmed)) {
      setError("Format: MAJOR.MINOR.PATCH, z. B. 1.2.0");
      return;
    }
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/managed-reports/settings/collector-baseline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minVersion: trimmed === "" ? null : trimmed }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Speichern fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Mindest-Collector-Version</label>
        <input
          type="text"
          placeholder="keine Baseline"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 w-40"
        />
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
