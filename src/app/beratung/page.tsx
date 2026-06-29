"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Answers = Record<string, string | string[]>;

/* ── Step definitions ───────────────────────────────────────────────────── */
const STEPS = [
  {
    id: "topic",
    title: "Womit können wir Ihnen helfen?",
    subtitle: "Wählen Sie das Thema, das am besten zu Ihrem Bedarf passt.",
    type: "cards" as const,
    field: "topic",
    options: [
      { value: "storage", icon: "🗄", label: "Storage & Infrastruktur", desc: "Server, SAN, All-Flash, Scale-Out" },
      { value: "backup", icon: "🛡", label: "Backup & Security", desc: "Datensicherung, Recovery, NIS2" },
      { value: "managed", icon: "⚙", label: "Managed Services", desc: "Proaktiver Betrieb & Monitoring" },
      { value: "cloud", icon: "☁", label: "Cloud & Virtualisierung", desc: "Hybrid Cloud, VMware, FusionCompute" },
      { value: "ai", icon: "🤖", label: "AI-Infrastruktur", desc: "GPU Cluster, NVIDIA, AI Storage" },
      { value: "database", icon: "💾", label: "Datenbank-Services", desc: "Migration, Betrieb, Lizenzberatung" },
      { value: "general", icon: "💬", label: "Allgemeine Beratung", desc: "Ich bin noch nicht sicher" },
    ],
  },
  {
    id: "detail",
    title: "Etwas genauer bitte",
    subtitle: "Welcher Aspekt ist für Sie am relevantesten?",
    type: "cards" as const,
    field: "detail",
    dependsOn: "topic",
    conditionalOptions: {
      storage: [
        { value: "new_storage", icon: "🆕", label: "Neubeschaffung", desc: "Neues Storage-System evaluieren & beschaffen" },
        { value: "expand", icon: "📈", label: "Kapazitätserweiterung", desc: "Bestehendes System erweitern" },
        { value: "migration", icon: "🔄", label: "Migration", desc: "Daten auf neue Plattform migrieren" },
        { value: "performance", icon: "⚡", label: "Performance-Optimierung", desc: "Engpässe analysieren & beheben" },
      ],
      backup: [
        { value: "new_backup", icon: "🆕", label: "Neue Backup-Lösung", desc: "Strategie & Lösung neu aufbauen" },
        { value: "nis2", icon: "📋", label: "NIS2-Compliance", desc: "Anforderungen prüfen & erfüllen" },
        { value: "dr", icon: "🏛", label: "Disaster Recovery", desc: "DR-Konzept & Umsetzung" },
        { value: "audit", icon: "🔍", label: "Backup-Audit", desc: "Bestehende Lösung überprüfen" },
      ],
      managed: [
        { value: "monitoring", icon: "📊", label: "Monitoring & Alerting", desc: "24/7 Überwachung der Infrastruktur" },
        { value: "operations", icon: "🔧", label: "Betrieb & Wartung", desc: "Laufender Betrieb auslagern" },
        { value: "renewals", icon: "📅", label: "Renewals & Lizenzen", desc: "Support-Verträge verwalten" },
        { value: "full", icon: "🌐", label: "Full Managed Services", desc: "Komplette IT-Verantwortung übergeben" },
      ],
      cloud: [
        { value: "virtualization", icon: "🖥", label: "Virtualisierung", desc: "VMware, Hyper-V, FusionCompute" },
        { value: "hybrid", icon: "☁", label: "Hybrid Cloud", desc: "On-Prem & Cloud verbinden" },
        { value: "migration_cloud", icon: "🔄", label: "Cloud-Migration", desc: "Workloads in die Cloud verlagern" },
        { value: "private", icon: "🔒", label: "Private Cloud", desc: "Eigene Cloud-Umgebung aufbauen" },
      ],
      ai: [
        { value: "gpu", icon: "🖥", label: "GPU Server / Cluster", desc: "NVIDIA-Infrastruktur für AI-Workloads" },
        { value: "ai_storage", icon: "💾", label: "AI Storage", desc: "Hochperformanter Storage für AI/ML" },
        { value: "ai_platform", icon: "🤖", label: "AI-Plattform", desc: "Private AI Cluster, Kubernetes" },
        { value: "ai_dr", icon: "🛡", label: "AI Backup & DR", desc: "Schutz von AI-Daten & Modellen" },
      ],
      database: [
        { value: "db_migration", icon: "🔄", label: "DB-Migration", desc: "Auf neue Plattform oder Version migrieren" },
        { value: "db_managed", icon: "⚙", label: "Managed Database", desc: "Datenbankbetrieb auslagern" },
        { value: "db_license", icon: "📋", label: "Lizenzberatung", desc: "Lizenzkosten optimieren" },
        { value: "db_performance", icon: "⚡", label: "Performance-Tuning", desc: "Datenbankperformance verbessern" },
      ],
      general: [
        { value: "assessment", icon: "🔍", label: "IT-Assessment", desc: "Bestandsaufnahme der aktuellen Infrastruktur" },
        { value: "strategy", icon: "🗺", label: "IT-Strategie", desc: "Roadmap für die nächsten 1–3 Jahre" },
        { value: "vendor", icon: "🤝", label: "Herstellerauswahl", desc: "Richtige Technologie für mein Unternehmen" },
        { value: "other", icon: "💬", label: "Sonstiges", desc: "Ich beschreibe es selbst" },
      ],
    } as Record<string, { value: string; icon: string; label: string; desc: string }[]>,
  },
  {
    id: "size",
    title: "Wie groß ist Ihr Unternehmen?",
    subtitle: "Damit wir die passende Lösung dimensionieren können.",
    type: "cards" as const,
    field: "size",
    options: [
      { value: "small", icon: "🏢", label: "1–50 Mitarbeitende", desc: "KMU / Kleinunternehmen" },
      { value: "medium", icon: "🏬", label: "51–250 Mitarbeitende", desc: "Mittleres Unternehmen" },
      { value: "large", icon: "🏭", label: "251–1.000 Mitarbeitende", desc: "Großunternehmen" },
      { value: "enterprise", icon: "🌐", label: "1.000+ Mitarbeitende", desc: "Enterprise / Konzern" },
    ],
  },
  {
    id: "timeline",
    title: "Wie dringend ist Ihr Bedarf?",
    subtitle: "So können wir Ihre Anfrage optimal priorisieren.",
    type: "cards" as const,
    field: "timeline",
    options: [
      { value: "urgent", icon: "🔥", label: "Sofort / Dringend", desc: "Innerhalb der nächsten 4 Wochen" },
      { value: "soon", icon: "📅", label: "Kurzfristig", desc: "In den nächsten 1–3 Monaten" },
      { value: "planned", icon: "🗓", label: "Mittelfristig", desc: "In den nächsten 3–6 Monaten" },
      { value: "exploring", icon: "🔭", label: "Langfristig", desc: "Orientierung & Planung für die Zukunft" },
    ],
  },
  {
    id: "contact",
    title: "Wie dürfen wir Sie erreichen?",
    subtitle: "Ihre Daten werden ausschließlich zur Kontaktaufnahme verwendet.",
    type: "form" as const,
    field: "contact",
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Vor- und Nachname", required: true },
      { name: "company", label: "Unternehmen", type: "text", placeholder: "Firmenname", required: true },
      { name: "email", label: "E-Mail", type: "email", placeholder: "ihre@email.at", required: true },
      { name: "phone", label: "Telefon", type: "tel", placeholder: "+43 …", required: false },
      { name: "message", label: "Zusätzliche Informationen", type: "textarea", placeholder: "Was sollen wir über Ihren Bedarf wissen?", required: false },
    ],
  },
];

const TOPIC_LABELS: Record<string, string> = {
  storage: "Storage & Infrastruktur", backup: "Backup & Security", managed: "Managed Services",
  cloud: "Cloud & Virtualisierung", ai: "AI-Infrastruktur", database: "Datenbank-Services", general: "Allgemeine Beratung",
};

const SIZE_LABELS: Record<string, string> = {
  small: "1–50 MA", medium: "51–250 MA", large: "251–1.000 MA", enterprise: "1.000+ MA",
};

const TIMELINE_LABELS: Record<string, string> = {
  urgent: "Sofort", soon: "Kurzfristig", planned: "Mittelfristig", exploring: "Langfristig",
};

/* ── Component ──────────────────────────────────────────────────────────── */
export default function BeratungPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  function selectCard(field: string, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => setStep((s) => s + 1), 250);
  }

  function getOptions() {
    if (currentStep.type !== "cards") return [];
    if ("conditionalOptions" in currentStep && currentStep.conditionalOptions) {
      const topic = answers["topic"] as string;
      return currentStep.conditionalOptions[topic] ?? [];
    }
    return currentStep.options ?? [];
  }

  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/beratung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, formData }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.error === "Email not configured") {
          // Dev fallback: still show success screen without email
          setSubmitted(true);
          return;
        }
        throw new Error(json.error ?? "Unbekannter Fehler");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an info@ferrion.at.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ───────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <PageShell>
        <div className="text-center max-w-lg mx-auto">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">Vielen Dank!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Ihre Anfrage ist bei uns eingegangen. Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.
          </p>
          <div className="bg-[#111827] border border-white/10 p-5 text-left mb-8 space-y-2">
            {answers.topic && <SummaryRow label="Thema" value={TOPIC_LABELS[answers.topic as string] ?? answers.topic as string} />}
            {answers.size && <SummaryRow label="Unternehmensgröße" value={SIZE_LABELS[answers.size as string] ?? ""} />}
            {answers.timeline && <SummaryRow label="Zeitrahmen" value={TIMELINE_LABELS[answers.timeline as string] ?? ""} />}
            {formData.name && <SummaryRow label="Name" value={formData.name} />}
            {formData.email && <SummaryRow label="E-Mail" value={formData.email} />}
          </div>
          <Link href="/" className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase">
            ← Zurück zur Homepage
          </Link>
        </div>
      </PageShell>
    );
  }

  /* ── Wizard ───────────────────────────────────────────────────────────── */
  return (
    <PageShell>
      {/* Progress bar */}
      <div className="w-full bg-white/5 h-0.5 mb-10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c9a84c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          Schritt {step + 1} von {STEPS.length}
        </span>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="ml-auto text-xs text-gray-500 hover:text-[#c9a84c] transition-colors"
          >
            ← Zurück
          </button>
        )}
      </div>

      {/* Summary chips */}
      {step > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {answers.topic && (
            <Chip label={TOPIC_LABELS[answers.topic as string] ?? answers.topic as string} onRemove={() => { setAnswers({}); setStep(0); }} />
          )}
          {answers.detail && step > 1 && (
            <Chip label={answers.detail as string} onRemove={() => { setAnswers((p) => { const n = { ...p }; delete n.detail; return n; }); setStep(1); }} />
          )}
          {answers.size && step > 2 && (
            <Chip label={SIZE_LABELS[answers.size as string]} onRemove={() => { setAnswers((p) => { const n = { ...p }; delete n.size; return n; }); setStep(2); }} />
          )}
          {answers.timeline && step > 3 && (
            <Chip label={TIMELINE_LABELS[answers.timeline as string]} onRemove={() => { setAnswers((p) => { const n = { ...p }; delete n.timeline; return n; }); setStep(3); }} />
          )}
        </div>
      )}

      {/* Heading */}
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{currentStep.title}</h1>
      <p className="text-gray-400 text-sm mb-10">{currentStep.subtitle}</p>

      {/* Cards step */}
      {currentStep.type === "cards" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getOptions().map((opt) => {
            const selected = answers[currentStep.field] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectCard(currentStep.field, opt.value)}
                className={`group text-left p-5 border transition-all duration-150 ${
                  selected
                    ? "border-[#c9a84c] bg-[#c9a84c]/10"
                    : "border-white/10 bg-[#111827] hover:border-[#c9a84c]/50 hover:bg-[#111827]"
                }`}
              >
                <div className="text-2xl mb-3">{opt.icon}</div>
                <p className={`font-bold text-sm mb-1 transition-colors ${selected ? "text-[#c9a84c]" : "text-white group-hover:text-[#c9a84c]"}`}>
                  {opt.label}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Contact form step */}
      {currentStep.type === "form" && (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          {"fields" in currentStep && currentStep.fields?.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
                {field.label}{field.required && <span className="text-[#c9a84c]"> *</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none"
                />
              )}
            </div>
          ))}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a84c] text-black font-bold text-xs tracking-widest uppercase py-3.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
            >
              {loading ? "Wird gesendet …" : "Anfrage absenden →"}
            </button>
            {submitError && (
              <p className="text-red-400 text-xs mt-3 text-center">{submitError}</p>
            )}
            <p className="text-gray-600 text-[10px] mt-3 text-center">
              Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.
            </p>
          </div>
        </form>
      )}
    </PageShell>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <header className="border-b border-white/10 h-16 flex items-center px-6 shrink-0">
        <Link href="/">
          <img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" />
        </Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Beratung anfragen</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Abbrechen
        </Link>
      </header>

      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </div>

      <footer className="border-t border-white/10 py-4 px-6 flex items-center justify-between shrink-0">
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Ferrion IT Systemhaus</p>
        <p className="text-gray-600 text-xs">info@ferrion.at · Wien, Österreich</p>
      </footer>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase px-3 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors text-xs leading-none">×</button>
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-medium">{value}</span>
    </div>
  );
}
