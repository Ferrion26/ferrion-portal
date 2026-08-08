"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishButton({ subscriptionId, reportId }: { subscriptionId: string; reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Bericht veröffentlichen? Der Kunde erhält danach eine E-Mail und Zugriff im Portal.")) return;
    setLoading(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}/reports/${reportId}/publish`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-[#c9a84c] hover:text-[#e0bc5a] font-bold tracking-widest uppercase disabled:opacity-50"
    >
      {loading ? "…" : "Veröffentlichen"}
    </button>
  );
}
