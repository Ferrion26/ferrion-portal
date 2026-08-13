"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function generatePassword() {
  return crypto.getRandomValues(new Uint32Array(3)).join("-");
}

export default function NewCustomerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, company: company || undefined, phone: phone || undefined, password }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Anlegen fehlgeschlagen.");
      return;
    }

    setCreated({ email, password });
    setName("");
    setEmail("");
    setCompany("");
    setPhone("");
    setPassword(generatePassword());
    router.refresh();
  }

  return (
    <div>
      {created && (
        <div className="mb-4 border border-[#c9a84c]/40 bg-[#c9a84c]/5 p-4">
          <p className="text-xs text-[#c9a84c] font-bold tracking-widest uppercase mb-2">
            Kunde angelegt — Zugangsdaten jetzt weitergeben
          </p>
          <p className="text-sm text-gray-300">
            E-Mail: <span className="text-white">{created.email}</span> · Initial-Passwort:{" "}
            <code className="text-white bg-[#0d1117] border border-white/10 px-2 py-0.5">{created.password}</code>
          </p>
          <button onClick={() => setCreated(null)} className="text-xs text-gray-500 hover:text-gray-300 mt-2">
            Schließen
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
          <input
            required
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[180px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">E-Mail</label>
          <input
            required
            type="email"
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[220px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Unternehmen</label>
          <input
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[200px]"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Telefon</label>
          <input
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[150px]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Initial-Passwort</label>
          <input
            required
            className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2 min-w-[160px]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {saving ? "Wird angelegt…" : "Kunde anlegen"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}
