"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to send reply.");
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        required
        rows={4}
        className="input resize-none"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply…"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Sending…" : "Send Reply"}
      </button>
    </form>
  );
}
