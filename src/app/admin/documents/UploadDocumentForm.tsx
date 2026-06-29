"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Customer = { id: string; name: string | null; email: string; company: string | null };

export default function UploadDocumentForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !customerId) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerId", customerId);
    formData.append("description", description);

    const res = await fetch("/api/documents", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Upload failed.");
      return;
    }

    setSuccess(true);
    setDescription("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
        <select
          required
          className="input"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company ?? c.name ?? c.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
        <input ref={fileRef} type="file" required className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Invoice Q4 2024"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          Document uploaded successfully.
        </p>
      )}

      <button type="submit" disabled={uploading} className="btn-primary">
        {uploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
