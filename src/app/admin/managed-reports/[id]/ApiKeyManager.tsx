"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

type ApiKey = { id: string; label: string; lastSeenAt: string | null; revokedAt: string | null; createdAt: string };

export default function ApiKeyManager({ subscriptionId, apiKeys }: { subscriptionId: string; apiKeys: ApiKey[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    setError(null);
    const res = await fetch(`/api/admin/managed-reports/${subscriptionId}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erstellen fehlgeschlagen.");
      return;
    }

    const data = await res.json();
    setNewKey(data.rawKey);
    setLabel("");
    router.refresh();
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Diesen API-Key wirklich widerrufen? Der Collector kann danach keine Daten mehr senden.")) return;
    await fetch(`/api/admin/managed-reports/${subscriptionId}/keys/${keyId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {newKey && (
        <div className="mb-4 border border-[#c9a84c]/40 bg-[#c9a84c]/5 p-4">
          <p className="text-xs text-[#c9a84c] font-bold tracking-widest uppercase mb-2">
            Key erstellt — jetzt kopieren, wird danach nicht mehr angezeigt
          </p>
          <code className="block text-sm text-white bg-[#0d1117] border border-white/10 px-3 py-2 break-all select-all">
            {newKey}
          </code>
          <button onClick={() => setNewKey(null)} className="text-xs text-gray-500 hover:text-gray-300 mt-2">
            Schließen
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Bezeichnung</label>
          <input
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[220px]"
            placeholder="z. B. Collector Standort Wien"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {creating ? "…" : "Key erstellen"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-gray-500">
            <th className="py-2 font-medium">Bezeichnung</th>
            <th className="py-2 font-medium">Zuletzt gesehen</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((k) => (
            <tr key={k.id} className="border-b border-white/5">
              <td className="py-2 text-gray-300">{k.label}</td>
              <td className="py-2 text-gray-400">{k.lastSeenAt ? formatDate(new Date(k.lastSeenAt)) : "Nie"}</td>
              <td className="py-2 text-gray-400">{k.revokedAt ? "Widerrufen" : "Aktiv"}</td>
              <td className="py-2 text-right">
                {!k.revokedAt && (
                  <button onClick={() => handleRevoke(k.id)} className="text-xs text-red-400 hover:text-red-300">
                    Widerrufen
                  </button>
                )}
              </td>
            </tr>
          ))}
          {apiKeys.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                Noch keine API-Keys.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
