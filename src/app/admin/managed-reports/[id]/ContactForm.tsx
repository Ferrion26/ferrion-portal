"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactForm({
  subscriptionId,
  initialName,
  initialRole,
  initialEmail,
  initialPhone,
}: {
  subscriptionId: string;
  initialName: string | null;
  initialRole: string | null;
  initialEmail: string | null;
  initialPhone: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [role, setRole] = useState(initialRole ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/managed-reports/${subscriptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: name.trim() || null,
        contactRole: role.trim() || null,
        contactEmail: email.trim() || null,
        contactPhone: phone.trim() || null,
      }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          maxLength={200}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Rolle (z. B. IT-Leiter)"
          maxLength={200}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail"
          maxLength={200}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon"
          maxLength={100}
          className="bg-[#0d1117] border border-white/10 text-white text-sm px-3 py-2"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-4 py-2 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
      >
        {saving ? "Wird gespeichert…" : "Speichern"}
      </button>
    </div>
  );
}
