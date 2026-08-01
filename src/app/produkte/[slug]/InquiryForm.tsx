"use client";

import { useState } from "react";
import { type Locale } from "@/lib/i18n/translations";
import { type ManagedPackage } from "../products-data";
import Spinner from "@/components/ui/Spinner";

const copy = {
  de: {
    eyebrow: "Anfrage",
    headline: "Interesse an {product} Managed Services?",
    sub: "Beschreiben Sie kurz Ihre Umgebung — wir melden uns innerhalb von 24 Stunden mit einem individuellen Vorschlag.",
    name: "Name",
    email: "E-Mail",
    company: "Unternehmen",
    packageLabel: "Gewünschte Servicestufe",
    message: "Nachricht (optional)",
    messagePlaceholder: "z. B. Anzahl Server/VMs, aktuelle Umgebung, gewünschter Starttermin …",
    defaultMessage: (product: string, pkg: string) => `Bitte kontaktieren Sie mich bezüglich ${product} Managed Services (${pkg}).`,
    send: "Anfrage senden →",
    sending: "Wird gesendet …",
    success: "Vielen Dank! Wir melden uns innerhalb von 24 Stunden mit einem individuellen Vorschlag.",
    error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an info@ferrion.at",
  },
  en: {
    eyebrow: "Inquiry",
    headline: "Interested in {product} Managed Services?",
    sub: "Briefly describe your environment — we'll get back to you within 24 hours with a tailored proposal.",
    name: "Name",
    email: "Email",
    company: "Company",
    packageLabel: "Desired service tier",
    message: "Message (optional)",
    messagePlaceholder: "e.g. number of servers/VMs, current environment, desired start date …",
    defaultMessage: (product: string, pkg: string) => `Please contact me regarding ${product} Managed Services (${pkg}).`,
    send: "Send Inquiry →",
    sending: "Sending …",
    success: "Thank you! We will get back to you within 24 hours with a tailored proposal.",
    error: "Something went wrong. Please try again or email us directly at info@ferrion.at",
  },
};

export default function InquiryForm({
  locale,
  productName,
  packages,
  defaultPackageId,
}: {
  locale: Locale;
  productName: string;
  packages: ManagedPackage[];
  defaultPackageId: string;
}) {
  const t = copy[locale];
  const [fields, setFields] = useState({ name: "", email: "", company: "", message: "" });
  const [pkg, setPkg] = useState(defaultPackageId);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function set(key: keyof typeof fields, val: string) {
    setFields((p) => ({ ...p, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const chosenPackage = packages.find((p) => p.id === pkg);
    const packageName = chosenPackage?.name ?? pkg;
    const topic = `Managed Services — ${productName} (${packageName})`;
    const message = fields.message.trim() || t.defaultMessage(productName, packageName);
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, message, topic }),
      });
      if (res.ok || res.status === 503) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-[#111827] border border-[#c9a84c]/30 p-10 text-center">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-white font-bold text-lg mb-2">{t.success}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-white/10 p-8">
      <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-2">{t.eyebrow}</p>
      <h2 className="text-white font-bold text-xl mb-2">{t.headline.replace("{product}", productName)}</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-lg">{t.sub}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">{t.name}</label>
            <input
              type="text"
              required
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">{t.email}</label>
            <input
              type="email"
              required
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">{t.company}</label>
            <input
              type="text"
              value={fields.company}
              onChange={(e) => set("company", e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">{t.packageLabel}</label>
            <select
              value={pkg}
              onChange={(e) => setPkg(e.target.value)}
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.recommended ? "★" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">{t.message}</label>
          <textarea
            rows={4}
            placeholder={t.messagePlaceholder}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none transition-colors resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 px-4 py-3">{t.error}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {status === "sending" && <Spinner />}
          {status === "sending" ? t.sending : t.send}
        </button>
      </form>
    </div>
  );
}
