"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplicationNoteForm({ subscriptionId, initialValue }: { subscriptionId: string; initialValue: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replicationNote: value.trim() || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="z. B. „Snapshots dieses Systems werden von OceanProtect X8000 repliziert.“ — erscheint als Hinweis im Bericht."
        rows={2}
        className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 w-full resize-none"
        maxLength={500}
      />
      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {saving ? "Wird gespeichert…" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
