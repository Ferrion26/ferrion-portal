"use client";

import { useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";

type Answers = Record<string, string | string[]>;

/* ── Bilingual UI strings ───────────────────────────────────────────────── */
const UI = {
  de: {
    header: "Beratung anfragen",
    cancel: "Abbrechen",
    step: (n: number, total: number) => `Schritt ${n} von ${total}`,
    back: "← Zurück",
    submit: "Anfrage absenden →",
    submitting: "Wird gesendet …",
    privacy: "Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.",
    successTitle: "Vielen Dank!",
    successDesc: "Ihre Anfrage ist bei uns eingegangen. Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.",
    successBack: "← Zurück zur Homepage",
    errorMsg: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an info@ferrion.at.",
    summaryTopic: "Thema",
    summarySize: "Unternehmensgröße",
    summaryTimeline: "Zeitrahmen",
    summaryName: "Name",
    summaryEmail: "E-Mail",
  },
  en: {
    header: "Request Consultation",
    cancel: "Cancel",
    step: (n: number, total: number) => `Step ${n} of ${total}`,
    back: "← Back",
    submit: "Submit Request →",
    submitting: "Sending …",
    privacy: "Your data is treated confidentially and will not be shared with third parties.",
    successTitle: "Thank you!",
    successDesc: "Your request has been received. We typically get back to you within 24 hours.",
    successBack: "← Back to Homepage",
    errorMsg: "Your request could not be sent. Please try again or write to us directly at info@ferrion.at.",
    summaryTopic: "Topic",
    summarySize: "Company Size",
    summaryTimeline: "Timeline",
    summaryName: "Name",
    summaryEmail: "Email",
  },
};

/* ── Steps ──────────────────────────────────────────────────────────────── */
const STEPS_CONTENT = {
  de: {
    topic: {
      title: "Womit können wir Ihnen helfen?",
      subtitle: "Wählen Sie das Thema, das am besten zu Ihrem Bedarf passt.",
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
    detail: {
      title: "Etwas genauer bitte",
      subtitle: "Welcher Aspekt ist für Sie am relevantesten?",
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
          { value: "operations", icon: "🔧", label: "Betrieb & Wartung", desc: "Laufenden Betrieb auslagern" },
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
    size: {
      title: "Wie groß ist Ihr Unternehmen?",
      subtitle: "Damit wir die passende Lösung dimensionieren können.",
      options: [
        { value: "small", icon: "🏢", label: "1–50 Mitarbeitende", desc: "KMU / Kleinunternehmen" },
        { value: "medium", icon: "🏬", label: "51–250 Mitarbeitende", desc: "Mittleres Unternehmen" },
        { value: "large", icon: "🏭", label: "251–1.000 Mitarbeitende", desc: "Großunternehmen" },
        { value: "enterprise", icon: "🌐", label: "1.000+ Mitarbeitende", desc: "Enterprise / Konzern" },
      ],
    },
    timeline: {
      title: "Wie dringend ist Ihr Bedarf?",
      subtitle: "So können wir Ihre Anfrage optimal priorisieren.",
      options: [
        { value: "urgent", icon: "🔥", label: "Sofort / Dringend", desc: "Innerhalb der nächsten 4 Wochen" },
        { value: "soon", icon: "📅", label: "Kurzfristig", desc: "In den nächsten 1–3 Monaten" },
        { value: "planned", icon: "🗓", label: "Mittelfristig", desc: "In den nächsten 3–6 Monaten" },
        { value: "exploring", icon: "🔭", label: "Langfristig", desc: "Orientierung & Planung für die Zukunft" },
      ],
    },
    contact: {
      title: "Wie dürfen wir Sie erreichen?",
      subtitle: "Ihre Daten werden ausschließlich zur Kontaktaufnahme verwendet.",
      fields: [
        { name: "name", label: "Name", type: "text", placeholder: "Vor- und Nachname", required: true },
        { name: "company", label: "Unternehmen", type: "text", placeholder: "Firmenname", required: true },
        { name: "email", label: "E-Mail", type: "email", placeholder: "ihre@email.at", required: true },
        { name: "phone", label: "Telefon", type: "tel", placeholder: "+43 …", required: false },
        { name: "message", label: "Zusätzliche Informationen", type: "textarea", placeholder: "Was sollen wir über Ihren Bedarf wissen?", required: false },
      ],
    },
    topicLabels: { storage: "Storage & Infrastruktur", backup: "Backup & Security", managed: "Managed Services", cloud: "Cloud & Virtualisierung", ai: "AI-Infrastruktur", database: "Datenbank-Services", general: "Allgemeine Beratung" } as Record<string, string>,
    sizeLabels: { small: "1–50 MA", medium: "51–250 MA", large: "251–1.000 MA", enterprise: "1.000+ MA" } as Record<string, string>,
    timelineLabels: { urgent: "Sofort", soon: "Kurzfristig", planned: "Mittelfristig", exploring: "Langfristig" } as Record<string, string>,
  },
  en: {
    topic: {
      title: "How can we help you?",
      subtitle: "Select the topic that best matches your needs.",
      options: [
        { value: "storage", icon: "🗄", label: "Storage & Infrastructure", desc: "Servers, SAN, All-Flash, Scale-Out" },
        { value: "backup", icon: "🛡", label: "Backup & Security", desc: "Data protection, recovery, NIS2" },
        { value: "managed", icon: "⚙", label: "Managed Services", desc: "Proactive operations & monitoring" },
        { value: "cloud", icon: "☁", label: "Cloud & Virtualisation", desc: "Hybrid Cloud, VMware, FusionCompute" },
        { value: "ai", icon: "🤖", label: "AI Infrastructure", desc: "GPU clusters, NVIDIA, AI storage" },
        { value: "database", icon: "💾", label: "Database Services", desc: "Migration, operations, licence consulting" },
        { value: "general", icon: "💬", label: "General Consulting", desc: "I'm not sure yet" },
      ],
    },
    detail: {
      title: "A bit more detail",
      subtitle: "Which aspect is most relevant to you?",
      conditionalOptions: {
        storage: [
          { value: "new_storage", icon: "🆕", label: "New Procurement", desc: "Evaluate & procure a new storage system" },
          { value: "expand", icon: "📈", label: "Capacity Expansion", desc: "Expand an existing system" },
          { value: "migration", icon: "🔄", label: "Migration", desc: "Migrate data to a new platform" },
          { value: "performance", icon: "⚡", label: "Performance Optimisation", desc: "Analyse & resolve bottlenecks" },
        ],
        backup: [
          { value: "new_backup", icon: "🆕", label: "New Backup Solution", desc: "Build a new strategy & solution from scratch" },
          { value: "nis2", icon: "📋", label: "NIS2 Compliance", desc: "Review & fulfil requirements" },
          { value: "dr", icon: "🏛", label: "Disaster Recovery", desc: "DR concept & implementation" },
          { value: "audit", icon: "🔍", label: "Backup Audit", desc: "Review existing solution" },
        ],
        managed: [
          { value: "monitoring", icon: "📊", label: "Monitoring & Alerting", desc: "24/7 infrastructure monitoring" },
          { value: "operations", icon: "🔧", label: "Operations & Maintenance", desc: "Outsource ongoing operations" },
          { value: "renewals", icon: "📅", label: "Renewals & Licences", desc: "Manage support contracts" },
          { value: "full", icon: "🌐", label: "Full Managed Services", desc: "Hand over full IT responsibility" },
        ],
        cloud: [
          { value: "virtualization", icon: "🖥", label: "Virtualisation", desc: "VMware, Hyper-V, FusionCompute" },
          { value: "hybrid", icon: "☁", label: "Hybrid Cloud", desc: "Connect on-prem & cloud" },
          { value: "migration_cloud", icon: "🔄", label: "Cloud Migration", desc: "Move workloads to the cloud" },
          { value: "private", icon: "🔒", label: "Private Cloud", desc: "Build your own cloud environment" },
        ],
        ai: [
          { value: "gpu", icon: "🖥", label: "GPU Servers / Clusters", desc: "NVIDIA infrastructure for AI workloads" },
          { value: "ai_storage", icon: "💾", label: "AI Storage", desc: "High-performance storage for AI/ML" },
          { value: "ai_platform", icon: "🤖", label: "AI Platform", desc: "Private AI clusters, Kubernetes" },
          { value: "ai_dr", icon: "🛡", label: "AI Backup & DR", desc: "Protect AI data & models" },
        ],
        database: [
          { value: "db_migration", icon: "🔄", label: "DB Migration", desc: "Migrate to a new platform or version" },
          { value: "db_managed", icon: "⚙", label: "Managed Database", desc: "Outsource database operations" },
          { value: "db_license", icon: "📋", label: "Licence Consulting", desc: "Optimise licence costs" },
          { value: "db_performance", icon: "⚡", label: "Performance Tuning", desc: "Improve database performance" },
        ],
        general: [
          { value: "assessment", icon: "🔍", label: "IT Assessment", desc: "Inventory of current infrastructure" },
          { value: "strategy", icon: "🗺", label: "IT Strategy", desc: "Roadmap for the next 1–3 years" },
          { value: "vendor", icon: "🤝", label: "Vendor Selection", desc: "Right technology for my business" },
          { value: "other", icon: "💬", label: "Other", desc: "I'll describe it myself" },
        ],
      } as Record<string, { value: string; icon: string; label: string; desc: string }[]>,
    },
    size: {
      title: "How large is your company?",
      subtitle: "This helps us size the right solution for you.",
      options: [
        { value: "small", icon: "🏢", label: "1–50 Employees", desc: "SME / Small business" },
        { value: "medium", icon: "🏬", label: "51–250 Employees", desc: "Mid-size company" },
        { value: "large", icon: "🏭", label: "251–1,000 Employees", desc: "Large enterprise" },
        { value: "enterprise", icon: "🌐", label: "1,000+ Employees", desc: "Enterprise / Corporation" },
      ],
    },
    timeline: {
      title: "How urgent is your need?",
      subtitle: "This helps us prioritise your request.",
      options: [
        { value: "urgent", icon: "🔥", label: "Immediate / Urgent", desc: "Within the next 4 weeks" },
        { value: "soon", icon: "📅", label: "Short-term", desc: "Within the next 1–3 months" },
        { value: "planned", icon: "🗓", label: "Medium-term", desc: "Within the next 3–6 months" },
        { value: "exploring", icon: "🔭", label: "Long-term", desc: "Planning & orientation for the future" },
      ],
    },
    contact: {
      title: "How can we reach you?",
      subtitle: "Your data will only be used to contact you.",
      fields: [
        { name: "name", label: "Name", type: "text", placeholder: "First and last name", required: true },
        { name: "company", label: "Company", type: "text", placeholder: "Company name", required: true },
        { name: "email", label: "Email", type: "email", placeholder: "your@email.com", required: true },
        { name: "phone", label: "Phone", type: "tel", placeholder: "+43 …", required: false },
        { name: "message", label: "Additional Information", type: "textarea", placeholder: "What should we know about your needs?", required: false },
      ],
    },
    topicLabels: { storage: "Storage & Infrastructure", backup: "Backup & Security", managed: "Managed Services", cloud: "Cloud & Virtualisation", ai: "AI Infrastructure", database: "Database Services", general: "General Consulting" } as Record<string, string>,
    sizeLabels: { small: "1–50 emp.", medium: "51–250 emp.", large: "251–1,000 emp.", enterprise: "1,000+ emp." } as Record<string, string>,
    timelineLabels: { urgent: "Immediate", soon: "Short-term", planned: "Medium-term", exploring: "Long-term" } as Record<string, string>,
  },
};

const STEP_KEYS = ["topic", "detail", "size", "timeline", "contact"] as const;

export default function BeratungClient({ locale }: { locale: Locale }) {
  const s = STEPS_CONTENT[locale];
  const ui = UI[locale];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepKey = STEP_KEYS[step];
  const currentStep = s[stepKey] as typeof s.topic & typeof s.detail & typeof s.contact;
  const progress = (step / STEP_KEYS.length) * 100;

  function selectCard(field: string, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setTimeout(() => setStep((n) => n + 1), 250);
  }

  function getOptions() {
    if (stepKey === "detail") {
      const topic = answers["topic"] as string;
      return s.detail.conditionalOptions[topic] ?? [];
    }
    return (currentStep as any).options ?? [];
  }

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
        if (json.error === "Email not configured") { setSubmitted(true); return; }
        throw new Error(json.error ?? "Error");
      }
      setSubmitted(true);
    } catch {
      setSubmitError(ui.errorMsg);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <PageShell locale={locale} ui={ui}>
        <div className="text-center max-w-lg mx-auto">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-white mb-4">{ui.successTitle}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{ui.successDesc}</p>
          <div className="bg-[#111827] border border-white/10 p-5 text-left mb-8 space-y-2">
            {answers.topic && <SummaryRow label={ui.summaryTopic} value={s.topicLabels[answers.topic as string] ?? String(answers.topic)} />}
            {answers.size && <SummaryRow label={ui.summarySize} value={s.sizeLabels[answers.size as string] ?? ""} />}
            {answers.timeline && <SummaryRow label={ui.summaryTimeline} value={s.timelineLabels[answers.timeline as string] ?? ""} />}
            {formData.name && <SummaryRow label={ui.summaryName} value={formData.name} />}
            {formData.email && <SummaryRow label={ui.summaryEmail} value={formData.email} />}
          </div>
          <Link href="/" className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase">
            {ui.successBack}
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell locale={locale} ui={ui}>
      <div className="w-full bg-white/5 h-0.5 mb-10 rounded-full overflow-hidden">
        <div className="h-full bg-[#c9a84c] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-2 mb-8">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          {ui.step(step + 1, STEP_KEYS.length)}
        </span>
        {step > 0 && (
          <button onClick={() => setStep((n) => n - 1)} className="ml-auto text-xs text-gray-500 hover:text-[#c9a84c] transition-colors">
            {ui.back}
          </button>
        )}
      </div>

      {step > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {answers.topic && (
            <Chip label={s.topicLabels[answers.topic as string] ?? String(answers.topic)} onRemove={() => { setAnswers({}); setStep(0); }} />
          )}
          {answers.detail && step > 1 && (
            <Chip label={String(answers.detail)} onRemove={() => { setAnswers((p) => { const n = { ...p }; delete n.detail; return n; }); setStep(1); }} />
          )}
          {answers.size && step > 2 && (
            <Chip label={s.sizeLabels[answers.size as string]} onRemove={() => { setAnswers((p) => { const n = { ...p }; delete n.size; return n; }); setStep(2); }} />
          )}
          {answers.timeline && step > 3 && (
            <Chip label={s.timelineLabels[answers.timeline as string]} onRemove={() => { setAnswers((p) => { const n = { ...p }; delete n.timeline; return n; }); setStep(3); }} />
          )}
        </div>
      )}

      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{currentStep.title}</h1>
      <p className="text-gray-400 text-sm mb-10">{currentStep.subtitle}</p>

      {stepKey !== "contact" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getOptions().map((opt: { value: string; icon: string; label: string; desc: string }) => {
            const selected = answers[stepKey] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectCard(stepKey, opt.value)}
                className={`group text-left p-5 border transition-all duration-150 ${selected ? "border-[#c9a84c] bg-[#c9a84c]/10" : "border-white/10 bg-[#111827] hover:border-[#c9a84c]/50"}`}
              >
                <div className="text-2xl mb-3">{opt.icon}</div>
                <p className={`font-bold text-sm mb-1 transition-colors ${selected ? "text-[#c9a84c]" : "text-white group-hover:text-[#c9a84c]"}`}>{opt.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {stepKey === "contact" && (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          {s.contact.fields.map((field) => (
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
            <button type="submit" disabled={loading} className="w-full bg-[#c9a84c] text-black font-bold text-xs tracking-widest uppercase py-3.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50">
              {loading ? ui.submitting : ui.submit}
            </button>
            {submitError && <p className="text-red-400 text-xs mt-3 text-center">{submitError}</p>}
            <p className="text-gray-600 text-[10px] mt-3 text-center">{ui.privacy}</p>
          </div>
        </form>
      )}
    </PageShell>
  );
}

function PageShell({ children, ui }: { children: React.ReactNode; locale: Locale; ui: typeof UI.de }) {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <header className="border-b border-white/10 h-16 flex items-center px-6 shrink-0">
        <Link href="/"><img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" /></Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{ui.header}</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">{ui.cancel}</Link>
      </header>
      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-4xl">{children}</div>
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
