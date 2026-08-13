"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBaselinePolicyButton({ policyId }: { policyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Diese Baseline-Policy inkl. aller Versionen endgültig löschen?")) return;
    setLoading(true);
    await fetch(`/api/admin/baselines/${policyId}`, { method: "DELETE" });
    router.push("/admin/baselines");
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
      {loading ? "…" : "Policy löschen"}
    </button>
  );
}
