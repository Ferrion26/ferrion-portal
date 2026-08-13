"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/managed-reports/reportFormat";

const KIND_LABEL: Record<string, string> = {
  ALARM: "Alarm",
  COMPONENT_FAULT: "Komponentenfehler",
};

type Finding = {
  id: string;
  kind: string;
  category: string;
  title: string;
  description: string;
  suggestion: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgedByEmail: string | null;
  acknowledgedComment: string | null;
};

export default function FindingsTable({ subscriptionId, findings }: { subscriptionId: string; findings: Finding[] }) {
  const router = useRouter();
  const [openCommentFor, setOpenCommentFor] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAcknowledge(findingId: string) {
    if (!comment.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}/findings/${findingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: comment.trim() }),
    });
    setSaving(false);
    setOpenCommentFor(null);
    setComment("");
    router.refresh();
  }

  async function handleRevoke(findingId: string) {
    if (!confirm("Bestätigung wirklich zurückziehen? Der Kommentar geht dabei verloren.")) return;
    setSaving(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}/findings/${findingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-gray-500">
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Art</th>
            <th className="py-2 font-medium">Kategorie</th>
            <th className="py-2 font-medium">Titel</th>
            <th className="py-2 font-medium">Beschreibung</th>
            <th className="py-2 font-medium">Zuerst gesehen</th>
            <th className="py-2 font-medium">Zuletzt gesehen</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f) => {
            const isResolved = !!f.resolvedAt;
            const isAcknowledged = !isResolved && !!f.acknowledgedAt;
            const needsReview = !isResolved && !f.acknowledgedAt;

            return (
              <tr key={f.id} className="border-b border-white/5 align-top">
                <td className="py-2">
                  {isResolved ? (
                    <Badge variant="green">Behoben</Badge>
                  ) : isAcknowledged ? (
                    <Badge variant="blue">Bestätigt</Badge>
                  ) : (
                    <Badge variant="yellow">Aktiv</Badge>
                  )}
                </td>
                <td className="py-2 text-gray-400">{KIND_LABEL[f.kind] ?? f.kind}</td>
                <td className="py-2 text-gray-400">{f.category}</td>
                <td className="py-2 text-white font-medium">{f.title}</td>
                <td className="py-2 text-gray-400 max-w-sm">
                  {f.description}
                  {f.suggestion && <p className="text-gray-500 text-xs mt-1">{f.suggestion}</p>}
                  {isAcknowledged && (
                    <div className="mt-2 border-l-2 border-[#c9a84c]/40 pl-2">
                      <p className="text-gray-300 text-xs">{f.acknowledgedComment}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">
                        bestätigt von {f.acknowledgedByEmail} am {formatDateTime(f.acknowledgedAt!)}
                      </p>
                    </div>
                  )}
                </td>
                <td className="py-2 text-gray-400 whitespace-nowrap">{formatDateTime(f.firstSeenAt)}</td>
                <td className="py-2 text-gray-400 whitespace-nowrap">{formatDateTime(f.lastSeenAt)}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  {needsReview && openCommentFor !== f.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCommentFor(f.id);
                        setComment("");
                      }}
                      className="text-xs text-[#c9a84c] hover:text-[#e0bc5a]"
                    >
                      Bestätigen
                    </button>
                  )}
                  {isAcknowledged && (
                    <button type="button" onClick={() => handleRevoke(f.id)} disabled={saving} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                      Zurückziehen
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {findings.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-gray-500">
                Keine Einträge in dieser Ansicht.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {openCommentFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setOpenCommentFor(null)}>
          <div className="bg-[#111827] border border-white/10 w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white mb-1">Punkt bestätigen</p>
            <p className="text-xs text-gray-500 mb-3">
              Der Kommentar erscheint im nächsten neu erstellten Bericht bei diesem Punkt und bleibt bestehen, solange er
              durchgehend gemeldet wird.
            </p>
            <textarea
              autoFocus
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="z. B. „Rückstellmuster bekannt, Ersatzteil bereits bestellt.“"
              maxLength={1000}
              rows={4}
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleAcknowledge(openCommentFor)}
                disabled={saving || !comment.trim()}
                className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
              >
                {saving ? "Wird gespeichert…" : "Bestätigen"}
              </button>
              <button type="button" onClick={() => setOpenCommentFor(null)} disabled={saving} className="text-xs text-gray-400 hover:text-white px-4 py-2">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
