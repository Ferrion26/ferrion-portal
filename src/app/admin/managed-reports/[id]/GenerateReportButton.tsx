"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateReportButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/managed-reports/${subscriptionId}/generate`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erstellung fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
      >
        {loading ? "Wird erstellt…" : "Bericht für letztes Quartal erstellen"}
      </button>
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}
