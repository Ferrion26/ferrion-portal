"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export default function StatusUpdateForm({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setLoading(true);
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">Status:</span>
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={loading || s === status}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              s === status
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
