"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteReportButton({ subscriptionId, reportId, published }: { subscriptionId: string; reportId: string; published: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const warning = published
      ? "Dieser Bericht wurde bereits veröffentlicht — der Kunde hat ihn möglicherweise schon gesehen oder heruntergeladen. Wirklich endgültig löschen?"
      : "Diesen Berichtsentwurf endgültig löschen?";
    if (!confirm(warning)) return;

    setLoading(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}/reports/${reportId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
      {loading ? "…" : "Löschen"}
    </button>
  );
}
