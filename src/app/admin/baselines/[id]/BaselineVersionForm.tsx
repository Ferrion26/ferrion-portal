"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FeatureRow = { title: string; description?: string };
type IssueRow = { ticketNumber?: string; title: string; description?: string; severity?: string; solution?: string };

type VersionInput = {
  id: string;
  versionNumber: string;
  description: string | null;
  status: string;
  publicationDate: string | null;
  recommended: boolean;
  newFeatures: FeatureRow[];
  modifiedFeatures: FeatureRow[];
  resolvedIssues: IssueRow[];
  sourceDocument: string | null;
};

function FeatureRowsEditor({
  title,
  rows,
  setRows,
}: {
  title: string;
  rows: FeatureRow[];
  setRows: (rows: FeatureRow[]) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-2">{title}</p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <input
                className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-2 py-1.5"
                placeholder="Titel"
                value={row.title}
                onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))}
              />
              <textarea
                className="w-full bg-[#0d1117] border border-white/10 text-white text-xs px-2 py-1.5"
                placeholder="Beschreibung (optional)"
                rows={2}
                value={row.description ?? ""}
                onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))}
              />
            </div>
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="text-gray-500 hover:text-red-400 text-xs px-1 py-1.5"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, { title: "" }])}
        className="text-xs text-[#c9a84c] hover:text-[#e0bc5a] mt-2"
      >
        + Zeile
      </button>
    </div>
  );
}

function IssueRowsEditor({ rows, setRows }: { rows: IssueRow[]; setRows: (rows: IssueRow[]) => void }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 mb-2">Resolved Issues (Bugfixes)</p>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="border border-white/10 p-2 space-y-1.5">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#0d1117] border border-white/10 text-white text-sm px-2 py-1.5"
                placeholder="Titel"
                value={row.title}
                onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, title: e.target.value } : r)))}
              />
              <input
                className="w-32 bg-[#0d1117] border border-white/10 text-white text-sm px-2 py-1.5"
                placeholder="Ticket-Nr."
                value={row.ticketNumber ?? ""}
                onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, ticketNumber: e.target.value } : r)))}
              />
              <input
                className="w-28 bg-[#0d1117] border border-white/10 text-white text-sm px-2 py-1.5"
                placeholder="Schweregrad"
                value={row.severity ?? ""}
                onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, severity: e.target.value } : r)))}
              />
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="text-gray-500 hover:text-red-400 text-xs px-1"
              >
                ×
              </button>
            </div>
            <textarea
              className="w-full bg-[#0d1117] border border-white/10 text-white text-xs px-2 py-1.5"
              placeholder="Beschreibung (optional)"
              rows={2}
              value={row.description ?? ""}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))}
            />
            <input
              className="w-full bg-[#0d1117] border border-white/10 text-white text-xs px-2 py-1.5"
              placeholder="Lösung (optional)"
              value={row.solution ?? ""}
              onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, solution: e.target.value } : r)))}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, { title: "" }])}
        className="text-xs text-[#c9a84c] hover:text-[#e0bc5a] mt-2"
      >
        + Zeile
      </button>
    </div>
  );
}

export default function BaselineVersionForm({
  policyId,
  initial,
  onClose,
}: {
  policyId: string;
  initial: VersionInput | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [versionNumber, setVersionNumber] = useState(initial?.versionNumber ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Valid");
  const [publicationDate, setPublicationDate] = useState(initial?.publicationDate?.slice(0, 10) ?? "");
  const [recommended, setRecommended] = useState(initial?.recommended ?? false);
  const [sourceDocument, setSourceDocument] = useState(initial?.sourceDocument ?? "");
  const [newFeatures, setNewFeatures] = useState<FeatureRow[]>(initial?.newFeatures ?? []);
  const [modifiedFeatures, setModifiedFeatures] = useState<FeatureRow[]>(initial?.modifiedFeatures ?? []);
  const [resolvedIssues, setResolvedIssues] = useState<IssueRow[]>(initial?.resolvedIssues ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cleanRows<T extends { title: string }>(rows: T[]) {
    return rows.filter((r) => r.title.trim().length > 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!versionNumber.trim()) return;
    setError(null);
    setSaving(true);

    const body = {
      versionNumber: versionNumber.trim(),
      description: description.trim() || undefined,
      status: status.trim() || "Valid",
      publicationDate: publicationDate || undefined,
      recommended,
      newFeatures: cleanRows(newFeatures),
      modifiedFeatures: cleanRows(modifiedFeatures),
      resolvedIssues: cleanRows(resolvedIssues),
      sourceDocument: sourceDocument.trim() || undefined,
    };

    const url = initial
      ? `/api/admin/baselines/${policyId}/versions/${initial.id}`
      : `/api/admin/baselines/${policyId}/versions`;
    const res = await fetch(url, {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Speichern fehlgeschlagen.");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={onClose}>
      <div
        className="bg-[#111827] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <p className="text-sm font-semibold text-white">{initial ? "Version bearbeiten" : "Version hinzufügen"}</p>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none px-2">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Versionsnummer</label>
              <input
                required
                className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
                placeholder="z. B. OceanStor Series V700R001C10SPH128"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <input
                className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Veröffentlichungsdatum</label>
              <input
                type="date"
                className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" className="accent-[#c9a84c]" checked={recommended} onChange={(e) => setRecommended(e.target.checked)} />
                Empfohlen
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Beschreibung (optional)</label>
            <input
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Quelldokument (Zitat, optional)</label>
            <input
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
              placeholder="z. B. OceanStor V700R001C30 Release Notes, Issue 01, 2026-06-30"
              value={sourceDocument}
              onChange={(e) => setSourceDocument(e.target.value)}
            />
          </div>

          <FeatureRowsEditor title="New Features" rows={newFeatures} setRows={setNewFeatures} />
          <FeatureRowsEditor title="Modified Features" rows={modifiedFeatures} setRows={setModifiedFeatures} />
          <IssueRowsEditor rows={resolvedIssues} setRows={setResolvedIssues} />

          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
        <div className="flex gap-2 px-5 py-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
          >
            {saving ? "Wird gespeichert…" : "Speichern"}
          </button>
          <button type="button" onClick={onClose} disabled={saving} className="text-xs text-gray-400 hover:text-white px-4 py-2.5">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
