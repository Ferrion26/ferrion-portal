"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  key: string;
  file: File;
  fileName: string;
  detectedSerialNumber: string | null;
  parseError: string | null;
  subscriptionId: string | null;
  matchType: "auto" | "manual" | "none";
};

type UploadResult = { fileName: string; ok: boolean; metricsStored?: number; error?: string };

export default function BatchUploadForm({
  customerId,
  subscriptions,
}: {
  customerId: string;
  subscriptions: { id: string; label: string; deviceSerialNumber: string | null }[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResult[] | null>(null);

  async function handleFilesSelected(fileList: FileList) {
    setResults(null);
    setBatchError(null);
    const newRows: Row[] = [];
    for (const file of Array.from(fileList)) {
      let detectedSerialNumber: string | null = null;
      let parseError: string | null = null;
      try {
        const json = JSON.parse(await file.text());
        const sn = json?.meta?.deviceSerialNumber;
        detectedSerialNumber = typeof sn === "string" && sn.length > 0 ? sn : null;
      } catch {
        parseError = "Ungültiges JSON — Datei wird übersprungen.";
      }
      // Nur eindeutige Treffer automatisch zuordnen — teilen sich zwei
      // Subscriptions ausnahmsweise dieselbe SN, lieber manuell entscheiden
      // lassen statt zu raten.
      const matches = detectedSerialNumber ? subscriptions.filter((s) => s.deviceSerialNumber === detectedSerialNumber) : [];
      const subscriptionId = matches.length === 1 ? matches[0].id : null;
      newRows.push({
        key: `${file.name}_${file.lastModified}_${Math.random().toString(36).slice(2)}`,
        file,
        fileName: file.name,
        detectedSerialNumber,
        parseError,
        subscriptionId,
        matchType: subscriptionId ? "auto" : "none",
      });
    }
    setRows((prev) => [...prev, ...newRows]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function updateSubscription(key: string, subscriptionId: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, subscriptionId: subscriptionId || null, matchType: "manual" } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function resetAll() {
    setRows([]);
    setResults(null);
    setBatchError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const assignable = rows.filter((r) => !r.parseError);
  const readyToConfirm = assignable.length > 0 && assignable.every((r) => r.subscriptionId);

  async function handleConfirm() {
    setSubmitting(true);
    setBatchError(null);
    const formData = new FormData();
    for (const row of assignable) {
      if (!row.subscriptionId) continue;
      formData.append("files", row.file);
      formData.append("subscriptionIds", row.subscriptionId);
    }

    const res = await fetch(`/api/admin/managed-reports/customers/${customerId}/manual-upload-batch`, {
      method: "POST",
      body: formData,
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setBatchError(data.error ?? "Upload fehlgeschlagen.");
      return;
    }

    const data = await res.json();
    setResults(data.results);
    setRows([]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Für Standorte ohne direkten Netzwerkweg zur Ingestion-API (z. B. air-gapped Umgebungen): Collector dort mit --export-dir laufen lassen, die erzeugten
        JSON-Dateien hier hochladen — mehrere Dateien und mehrere Geräte dieses Kunden in einem Vorgang. Die Zuordnung zum jeweiligen Produkt erfolgt anhand
        der im Export enthaltenen Seriennummer; ist keine eindeutige Zuordnung möglich, kannst du sie unten manuell auswählen.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        multiple
        onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/20"
      />

      {rows.length > 0 && (
        <div className="border border-white/10">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="px-4 py-2 font-medium">Datei</th>
                <th className="px-4 py-2 font-medium">Erkannte SN</th>
                <th className="px-4 py-2 font-medium">Zugeordnetes Produkt</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-white/5">
                  <td className="px-4 py-2 text-gray-300">{row.fileName}</td>
                  <td className="px-4 py-2 text-gray-400">{row.detectedSerialNumber ?? "—"}</td>
                  <td className="px-4 py-2">
                    {row.parseError ? (
                      <span className="text-red-400 text-xs">{row.parseError}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={row.subscriptionId ?? ""}
                          onChange={(e) => updateSubscription(row.key, e.target.value)}
                          className="bg-[#0d1117] border border-white/10 text-white text-xs px-2 py-1.5"
                        >
                          <option value="">— auswählen —</option>
                          {subscriptions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        {row.matchType === "auto" && <span className="text-[10px] text-green-400 uppercase tracking-widest">Automatisch erkannt</span>}
                        {row.matchType === "none" && !row.subscriptionId && (
                          <span className="text-[10px] text-amber-400 uppercase tracking-widest">Bitte zuordnen</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button type="button" onClick={() => removeRow(row.key)} className="text-gray-500 hover:text-red-400 text-xs">
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="flex items-center gap-3 p-4">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!readyToConfirm || submitting}
              className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
            >
              {submitting ? "Wird hochgeladen…" : "Bestätigen"}
            </button>
            <button
              type="button"
              onClick={resetAll}
              disabled={submitting}
              className="text-xs font-bold tracking-widest uppercase px-5 py-2.5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50"
            >
              Abbrechen
            </button>
            {!readyToConfirm && assignable.length > 0 && (
              <span className="text-xs text-gray-500">Jeder Datei muss ein Produkt zugeordnet sein, bevor bestätigt werden kann.</span>
            )}
          </div>
        </div>
      )}

      {batchError && <p className="text-sm text-red-400">{batchError}</p>}

      {results && (
        <div className="space-y-1">
          {results.map((r, i) => (
            <p key={i} className={`text-sm ${r.ok ? "text-green-400" : "text-red-400"}`}>
              {r.fileName}: {r.ok ? `${r.metricsStored} Kennzahlen gespeichert` : r.error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
