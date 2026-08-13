"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import BaselineVersionForm from "./BaselineVersionForm";

type FeatureRow = { title: string; description?: string };
type IssueRow = { ticketNumber?: string; title: string; description?: string; severity?: string; solution?: string };

type Version = {
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

export default function BaselineVersionsTable({ policyId, versions }: { policyId: string; versions: Version[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Version | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(versionId: string) {
    if (!confirm("Diese Version endgültig löschen?")) return;
    setDeleting(versionId);
    await fetch(`/api/admin/baselines/${policyId}/versions/${versionId}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Versionen</h2>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#e0bc5a] transition-colors"
        >
          Version hinzufügen
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="py-2 font-medium">Version</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Veröffentlicht</th>
              <th className="py-2 font-medium">Empfohlen</th>
              <th className="py-2 font-medium">Features / Fixes</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id} className="border-b border-white/5 align-top">
                <td className="py-2 text-white font-medium">
                  {v.versionNumber}
                  {v.description && <p className="text-gray-500 text-xs mt-0.5 font-normal">{v.description}</p>}
                </td>
                <td className="py-2 text-gray-400">{v.status}</td>
                <td className="py-2 text-gray-400 whitespace-nowrap">{v.publicationDate ? formatDate(new Date(v.publicationDate)) : "—"}</td>
                <td className="py-2">{v.recommended && <Badge variant="green">Empfohlen</Badge>}</td>
                <td className="py-2 text-gray-400 text-xs">
                  {v.newFeatures.length > 0 && <span className="mr-2">{v.newFeatures.length} neu</span>}
                  {v.modifiedFeatures.length > 0 && <span className="mr-2">{v.modifiedFeatures.length} geändert</span>}
                  {v.resolvedIssues.length > 0 && <span>{v.resolvedIssues.length} Fixes</span>}
                  {v.newFeatures.length === 0 && v.modifiedFeatures.length === 0 && v.resolvedIssues.length === 0 && "—"}
                </td>
                <td className="py-2 text-right whitespace-nowrap space-x-3">
                  <button type="button" onClick={() => setEditing(v)} className="text-xs text-gray-400 hover:text-white">
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    disabled={deleting === v.id}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
            {versions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  Noch keine Version erfasst.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <BaselineVersionForm
          policyId={policyId}
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
