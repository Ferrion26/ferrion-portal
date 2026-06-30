"use client";

import { useState } from "react";
import { type Locale } from "@/lib/i18n/translations";

const copy = {
  de: {
    eyebrow: "Kontakt",
    headline: "Sprechen Sie mit uns.",
    sub: "Kein Call-Center, keine Warteschlange. Sie erreichen direkt das Ferrion-Team.",
    form: {
      name: "Name",
      email: "E-Mail",
      company: "Unternehmen",
      topic: "Thema",
      topics: ["Storage & Infrastruktur", "Backup & Security", "AI-Infrastruktur", "Managed Services", "NIS2-Compliance", "Sonstiges"],
      message: "Nachricht",
      send: "Nachricht senden →",
      sending: "Wird gesendet …",
      success: "Vielen Dank! Wir melden uns innerhalb von 24 Stunden.",
      error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an info@ferrion.at",
    },
    info: [
      { icon: "✉", label: "E-Mail", value: "info@ferrion.at", href: "mailto:info@ferrion.at" },
      { icon: "📍", label: "Standort", value: "Wien, Österreich", href: null },
      { icon: "🕐", label: "Erreichbarkeit", value: "Mo–Fr, 08:00–18:00", href: null },
    ],
    response: "Antwortzeit",
    responseValue: "< 24 Stunden",
  },
  en: {
    eyebrow: "Contact",
    headline: "Talk to us.",
    sub: "No call centre, no queue. You reach the Ferrion team directly.",
    form: {
      name: "Name",
      email: "Email",
      company: "Company",
      topic: "Topic",
      topics: ["Storage & Infrastructure", "Backup & Security", "AI Infrastructure", "Managed Services", "NIS2 Compliance", "Other"],
      message: "Message",
      send: "Send Message →",
      sending: "Sending …",
      success: "Thank you! We will get back to you within 24 hours.",
      error: "Something went wrong. Please try again or email us directly at info@ferrion.at",
    },
    info: [
      { icon: "✉", label: "Email", value: "info@ferrion.at", href: "mailto:info@ferrion.at" },
      { icon: "📍", label: "Location", value: "Vienna, Austria", href: null },
      { icon: "🕐", label: "Availability", value: "Mon–Fri, 08:00–18:00", href: null },
    ],
    response: "Response time",
    responseValue: "< 24 hours",
  },
};

export default function KontaktClient({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const f = t.form;

  const [fields, setFields] = useState({ name: "", email: "", company: "", topic: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function set(key: string, val: string) {
    setFields((p) => ({ ...p, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      // 503 = email not configured yet (dev/staging) — treat as success so the
      // user still gets feedback; the submission is logged server-side.
      if (res.ok || res.status === 503) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-[#c9a84c]" />
            {t.eyebrow}
          </p>
          <h1 className="text-5xl font-bold text-white mb-4">{t.headline}</h1>
          <p className="text-gray-400 text-sm max-w-lg">{t.sub}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="bg-[#111827] border border-[#c9a84c]/30 p-10 text-center">
                <div className="text-4xl mb-4">✓</div>
                <p className="text-white font-bold text-lg mb-2">{f.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {(["name", "email", "company"] as const).map((key) => (
                    <div key={key} className={key === "company" ? "sm:col-span-1" : ""}>
                      <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">
                        {f[key]}
                      </label>
                      <input
                        type={key === "email" ? "email" : "text"}
                        required={key !== "company"}
                        value={fields[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">
                      {f.topic}
                    </label>
                    <select
                      value={fields.topic}
                      onChange={(e) => set("topic", e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors"
                    >
                      <option value="">—</option>
                      {f.topics.map((top) => (
                        <option key={top} value={top}>{top}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">
                    {f.message}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={fields.message}
                    onChange={(e) => set("message", e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 text-white text-sm px-4 py-3 focus:border-[#c9a84c] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 px-4 py-3">{f.error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
                >
                  {status === "sending" ? f.sending : f.send}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-6">
            {t.info.map((item) => (
              <div key={item.label} className="bg-[#111827] border border-white/10 p-6 hover:border-[#c9a84c]/20 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white text-sm font-medium hover:text-[#c9a84c] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white text-sm font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Response time highlight */}
            <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-6">
              <p className="text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase mb-2">{t.response}</p>
              <p className="text-white text-2xl font-bold">{t.responseValue}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
