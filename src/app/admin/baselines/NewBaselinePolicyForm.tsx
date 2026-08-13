"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBaselinePolicyForm({ products }: { products: { slug: string; label: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !productSlug) return;
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/baselines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined, productSlug }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Anlegen fehlgeschlagen.");
      return;
    }

    setName("");
    setDescription("");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
          <input
            required
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[220px]"
            placeholder="z. B. OceanStor Firmware-Baseline"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Produkt</label>
          <select
            required
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[220px]"
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Beschreibung (optional)</label>
          <input
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[260px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {saving ? "Wird angelegt…" : "Policy anlegen"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}
