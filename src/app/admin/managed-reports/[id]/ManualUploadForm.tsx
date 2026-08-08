"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type UploadResult = { fileName: string; ok: boolean; metricsStored?: number; error?: string };

export default function ManualUploadForm({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;

    setError(null);
    setResults(null);
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    const res = await fetch(`/api/admin/managed-reports/${subscriptionId}/manual-upload`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload fehlgeschlagen.");
      return;
    }

    const data = await res.json();
    setResults(data.results);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Für Standorte ohne direkten Netzwerkweg zur Ingestion-API (z. B. air-gapped Umgebungen): Collector dort mit{" "}
        <code className="text-gray-400">--export-dir</code> laufen lassen, die erzeugten JSON-Dateien hier hochladen.
      </p>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Export-Dateien (.json)</label>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            multiple
            className="text-sm text-gray-300 file:mr-3 file:bg-white/10 file:border-0 file:text-white file:text-xs file:px-3 file:py-2"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {uploading ? "Wird hochgeladen…" : "Hochladen"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      {results && (
        <ul className="mt-3 space-y-1 text-sm">
          {results.map((r) => (
            <li key={r.fileName} className={r.ok ? "text-green-400" : "text-red-400"}>
              {r.fileName}: {r.ok ? `${r.metricsStored} Kennzahlen gespeichert` : r.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
