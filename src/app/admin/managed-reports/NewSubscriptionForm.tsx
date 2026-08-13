"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Customer = { id: string; name: string | null; email: string; company: string | null };
type Product = { slug: string; name: string; vendor: string };

const PACKAGES = ["MONITOR", "OPERATE", "COMPLETE"] as const;
const PERIOD_TYPES = [
  { value: "MONTH", label: "Monat" },
  { value: "QUARTER", label: "Quartal" },
  { value: "HALF_YEAR", label: "Halbjahr" },
  { value: "YEAR", label: "Jahr" },
] as const;

export default function NewSubscriptionForm({
  customers,
  products,
  fixedCustomerId,
}: {
  customers?: Customer[];
  products: Product[];
  // Von der Kunden-Detailseite gesetzt — dort ist der Kunde bereits durch
  // die Navigation festgelegt, eine Dropdown-Auswahl wäre redundant.
  fixedCustomerId?: string;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(fixedCustomerId ?? "");
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [packageId, setPackageId] = useState<(typeof PACKAGES)[number]>("OPERATE");
  const [defaultPeriodType, setDefaultPeriodType] = useState<(typeof PERIOD_TYPES)[number]["value"]>("QUARTER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !productSlug) return;

    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/managed-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, productSlug, packageId, defaultPeriodType }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Anlegen fehlgeschlagen.");
      return;
    }

    if (!fixedCustomerId) setCustomerId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
      {!fixedCustomerId && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Kunde</label>
          <select
            required
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[220px]"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Kunde wählen…</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company ?? c.name ?? c.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Produkt</label>
        <select
          required
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[200px]"
          value={productSlug}
          onChange={(e) => setProductSlug(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.vendor} {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Servicestufe</label>
        <select
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value as (typeof PACKAGES)[number])}
        >
          {PACKAGES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Standard-Berichtszyklus</label>
        <select
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
          value={defaultPeriodType}
          onChange={(e) => setDefaultPeriodType(e.target.value as (typeof PERIOD_TYPES)[number]["value"])}
        >
          {PERIOD_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
      >
        {saving ? "Wird angelegt…" : "Anlegen"}
      </button>

      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
