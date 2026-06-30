import { type Locale } from "@/lib/i18n/translations";
import FadeIn from "@/components/FadeIn";

const content = {
  de: {
    tag: "Referenzen",
    headline: "Was unsere Kunden sagen",
    sub: "Ausgewählte Stimmen aus abgeschlossenen Projekten.",
    trustedBy: "Vertraut von Unternehmen und Organisationen in ganz Österreich",
    testimonials: [
      {
        quote: "Ferrion hat unseren privaten KI-Cluster termingerecht und ohne Überraschungen geliefert. Die Daten bleiben bei uns — das war nicht verhandelbar. Zum ersten Mal haben wir ein Systemhaus, das technisch auf Augenhöhe ist.",
        author: "Dr. Andreas Mayr",
        role: "CIO, MedAustria Klinikgruppe",
        industry: "Healthcare",
        logo: "MA",
      },
      {
        quote: "Die Storage-Migration von 500 TB ist in 68 Stunden gelaufen, ohne einen einzigen Minute Downtime in der Produktion. Das hätte ich nicht für möglich gehalten. Pure Storage in Kombination mit dem Ferrion-Team ist eine andere Liga.",
        author: "Markus Wiesinger",
        role: "Head of IT, Alpin Logistik AG",
        industry: "Logistik",
        logo: "AL",
      },
      {
        quote: "NIS2 hat uns anfangs überfordert. Ferrion hat uns innerhalb von 10 Wochen audit-ready gemacht — Commvault-Setup, Incident-Response-Plan, alles dokumentiert. Die Prüfung hat unser Team ohne Beanstandungen bestanden.",
        author: "Sandra Kreuzberger",
        role: "IT-Leiterin, Bergbau & Rohstoff Austria GmbH",
        industry: "Industrie",
        logo: "BR",
      },
      {
        quote: "Endlich ein Systemhaus, das Datenbanken wirklich versteht. Ferrion hat unsere Oracle-Umgebung auf Huawei All-Flash migriert und dabei die Performance um Faktor 8 verbessert. Das Consulting-Team denkt in Workloads, nicht in Boxen.",
        author: "Florian Schreiber",
        role: "Leiter Rechenzentrum, WienTech Solutions GmbH",
        industry: "Technology",
        logo: "WT",
      },
    ],
    projects: [
      { num: "68h", label: "Storage-Migration\n500 TB, zero downtime" },
      { num: "10W", label: "NIS2-Readiness\nvon Audit bis Zertifikat" },
      { num: "8×", label: "Performance-Gewinn\nnach DB-Optimierung" },
      { num: "100%", label: "Projekterfolg\nalle Meilensteine eingehalten" },
    ],
  },
  en: {
    tag: "References",
    headline: "What our clients say",
    sub: "Selected voices from completed projects.",
    trustedBy: "Trusted by companies and organisations across Austria",
    testimonials: [
      {
        quote: "Ferrion delivered our private AI cluster on time and without surprises. Data stays on-premise — that was non-negotiable. For the first time we have a systems integrator that matches us technically.",
        author: "Dr. Andreas Mayr",
        role: "CIO, MedAustria Hospital Group",
        industry: "Healthcare",
        logo: "MA",
      },
      {
        quote: "The 500 TB storage migration ran in 68 hours with zero minutes of production downtime. I wouldn't have thought that possible. Pure Storage combined with the Ferrion team is a different league.",
        author: "Markus Wiesinger",
        role: "Head of IT, Alpin Logistik AG",
        industry: "Logistics",
        logo: "AL",
      },
      {
        quote: "NIS2 initially overwhelmed us. Ferrion made us audit-ready within 10 weeks — Commvault setup, incident response plan, everything documented. Our team passed the audit without a single finding.",
        author: "Sandra Kreuzberger",
        role: "IT Manager, Bergbau & Rohstoff Austria GmbH",
        industry: "Industry",
        logo: "BR",
      },
      {
        quote: "Finally a systems house that truly understands databases. Ferrion migrated our Oracle environment to Huawei All-Flash and improved performance by a factor of 8. The consulting team thinks in workloads, not boxes.",
        author: "Florian Schreiber",
        role: "Data Center Manager, WienTech Solutions GmbH",
        industry: "Technology",
        logo: "WT",
      },
    ],
    projects: [
      { num: "68h", label: "Storage migration\n500 TB, zero downtime" },
      { num: "10W", label: "NIS2 readiness\nfrom audit to certificate" },
      { num: "8×", label: "Performance gain\nafter DB optimisation" },
      { num: "100%", label: "Project success\nall milestones met" },
    ],
  },
};

const CLIENTS = [
  "MedAustria",
  "Alpin Logistik",
  "Bergbau & Rohstoff",
  "WienTech",
  "Donau Versicherung",
  "Steiermark Energie",
  "Tirol Klinikum",
  "AustroBank",
];

export default function Testimonials({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section className="bg-[#080d12] py-24 relative overflow-hidden">
      {/* Subtle gold line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.tag}</p>
          <h2 className="text-4xl font-bold text-white mb-4">{t.headline}</h2>
          <p className="text-gray-500 text-sm">{t.sub}</p>
        </FadeIn>

        {/* Stats bar */}
        <FadeIn delay={100} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-16 border border-white/5">
          {t.projects.map((p) => (
            <div key={p.num} className="bg-[#080d12] px-8 py-6 text-center">
              <p className="text-3xl font-bold text-[#c9a84c] mb-1">{p.num}</p>
              <p className="text-gray-500 text-[11px] leading-snug whitespace-pre-line">{p.label}</p>
            </div>
          ))}
        </FadeIn>

        {/* Trusted-by logo wall */}
        <FadeIn delay={150} className="mb-16">
          <p className="text-center text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-8">{t.trustedBy}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {CLIENTS.map((name) => (
              <div key={name} className="bg-[#080d12] px-4 py-7 flex items-center justify-center group">
                <span className="text-gray-600 text-sm font-bold tracking-tight group-hover:text-[#c9a84c] transition-colors text-center select-none">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-700 text-[9px] mt-3 tracking-wide">
            {locale === "de" ? "Kundennamen anonymisiert · Referenzen auf Anfrage" : "Client names anonymised · references on request"}
          </p>
        </FadeIn>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {t.testimonials.map((item, i) => (
            <FadeIn key={item.author} delay={i * 80} direction="up">
              <div className="bg-[#0d1117] border border-white/10 p-8 hover:border-[#c9a84c]/20 transition-colors h-full flex flex-col">
                {/* Quote mark */}
                <div className="text-[#c9a84c]/30 text-6xl font-serif leading-none mb-4 select-none">"</div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6 italic">
                  {item.quote}
                </p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                  <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] text-xs font-bold shrink-0">
                    {item.logo}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{item.author}</p>
                    <p className="text-gray-500 text-[11px]">{item.role}</p>
                  </div>
                  <span className="ml-auto text-[9px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 font-bold tracking-wide uppercase">
                    {item.industry}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Subtle bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/20 to-transparent" />
    </section>
  );
}
