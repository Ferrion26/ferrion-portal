import { cookies } from "next/headers";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Karriere — Ferrion IT Systemhaus",
  description: "Werde Teil von Ferrion. Offene Stellen im Bereich Infrastruktur, Storage, AI und Managed Services in Wien.",
};

const content = {
  de: {
    eyebrow: "Karriere",
    headline: "Bau mit an Infrastruktur, die trägt.",
    sub: "Ferrion ist ein junges, inhabergeführtes IT-Systemhaus mit großen Ambitionen. Wir suchen Menschen, die Technologie lieben, Verantwortung übernehmen wollen und mit uns wachsen.",
    benefitsLabel: "Warum Ferrion",
    benefits: [
      { icon: "🚀", title: "Gestaltungsspielraum", desc: "Flache Hierarchien, kurze Wege und echte Mitsprache — bei uns bewegst du etwas." },
      { icon: "📜", title: "Zertifizierungen", desc: "Wir investieren in deine Weiterbildung — Hersteller-Zertifizierungen von Huawei, Pure Storage, Commvault & NVIDIA." },
      { icon: "🏠", title: "Flexibles Arbeiten", desc: "Hybrid-Modell mit modernem Büro in Wien und Home-Office-Option." },
      { icon: "💰", title: "Faire Vergütung", desc: "Marktkonformes Gehalt mit Bonus-Komponente und Beteiligung am Unternehmenserfolg." },
    ],
    openingsLabel: "Offene Stellen",
    type: { fulltime: "Vollzeit", parttime: "Teilzeit möglich" },
    jobs: [
      {
        title: "Senior Storage & Infrastructure Engineer (m/w/d)",
        location: "Wien · Hybrid",
        type: "fulltime",
        desc: "Du planst und implementierst Storage- und Virtualisierungslösungen bei unseren Kunden — von Pure Storage bis Huawei OceanStor. Erfahrung mit SAN/NAS, VMware und Migrationen bringst du mit.",
        tags: ["Pure Storage", "VMware", "SAN/NAS"],
      },
      {
        title: "Backup & Cyber-Resilience Consultant (m/w/d)",
        location: "Wien · Hybrid",
        type: "fulltime",
        desc: "Du verantwortest Data-Protection-Projekte mit Schwerpunkt Commvault und NIS2-Compliance. Du berätst Kunden, designst Backup-Architekturen und begleitest Audits.",
        tags: ["Commvault", "NIS2", "Disaster Recovery"],
      },
      {
        title: "AI Infrastructure Engineer (m/w/d)",
        location: "Wien · Hybrid",
        type: "fulltime",
        desc: "Du baust private AI-Cluster auf NVIDIA-Basis, orchestrierst GPU-Workloads mit Kubernetes und betreust On-Premise-ML-Plattformen. Linux, Containers und ein Faible für KI sind dein Zuhause.",
        tags: ["NVIDIA", "Kubernetes", "Linux"],
      },
      {
        title: "Junior Database & Managed Services Specialist (m/w/d)",
        location: "Wien · Hybrid",
        type: "parttime",
        desc: "Du steigst in unser Managed-Services-Team ein, übernimmst Monitoring und Betrieb von Datenbankumgebungen und wächst in die Rolle eines DB-Spezialisten hinein. Wir bilden dich aus.",
        tags: ["SQL", "Oracle", "Monitoring"],
      },
    ],
    spontaneousLabel: "Nichts Passendes dabei?",
    spontaneousText: "Wir freuen uns immer über Initiativbewerbungen von Menschen, die zu uns passen.",
    apply: "Jetzt bewerben →",
    spontaneousApply: "Initiativ bewerben →",
  },
  en: {
    eyebrow: "Careers",
    headline: "Help build infrastructure that endures.",
    sub: "Ferrion is a young, owner-managed IT systems house with big ambitions. We're looking for people who love technology, want to take responsibility and grow with us.",
    benefitsLabel: "Why Ferrion",
    benefits: [
      { icon: "🚀", title: "Room to Shape", desc: "Flat hierarchies, short paths and real say — here you move the needle." },
      { icon: "📜", title: "Certifications", desc: "We invest in your development — vendor certifications from Huawei, Pure Storage, Commvault & NVIDIA." },
      { icon: "🏠", title: "Flexible Work", desc: "Hybrid model with a modern office in Vienna and home-office option." },
      { icon: "💰", title: "Fair Compensation", desc: "Market-rate salary with bonus component and participation in company success." },
    ],
    openingsLabel: "Open Positions",
    type: { fulltime: "Full-time", parttime: "Part-time possible" },
    jobs: [
      {
        title: "Senior Storage & Infrastructure Engineer (m/f/d)",
        location: "Vienna · Hybrid",
        type: "fulltime",
        desc: "You plan and implement storage and virtualisation solutions for our clients — from Pure Storage to Huawei OceanStor. You bring experience with SAN/NAS, VMware and migrations.",
        tags: ["Pure Storage", "VMware", "SAN/NAS"],
      },
      {
        title: "Backup & Cyber-Resilience Consultant (m/f/d)",
        location: "Vienna · Hybrid",
        type: "fulltime",
        desc: "You own data protection projects focused on Commvault and NIS2 compliance. You advise clients, design backup architectures and accompany audits.",
        tags: ["Commvault", "NIS2", "Disaster Recovery"],
      },
      {
        title: "AI Infrastructure Engineer (m/f/d)",
        location: "Vienna · Hybrid",
        type: "fulltime",
        desc: "You build private AI clusters based on NVIDIA, orchestrate GPU workloads with Kubernetes and maintain on-premise ML platforms. Linux, containers and a passion for AI are your home turf.",
        tags: ["NVIDIA", "Kubernetes", "Linux"],
      },
      {
        title: "Junior Database & Managed Services Specialist (m/f/d)",
        location: "Vienna · Hybrid",
        type: "parttime",
        desc: "You join our managed services team, take over monitoring and operation of database environments and grow into the role of a DB specialist. We'll train you.",
        tags: ["SQL", "Oracle", "Monitoring"],
      },
    ],
    spontaneousLabel: "Nothing that fits?",
    spontaneousText: "We always welcome unsolicited applications from people who fit with us.",
    apply: "Apply now →",
    spontaneousApply: "Apply spontaneously →",
  },
};

export default function KarrierePage() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />

      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="mb-16 max-w-2xl">
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-[#c9a84c]" />
              {t.eyebrow}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">{t.headline}</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{t.sub}</p>
          </div>

          {/* Benefits */}
          <div className="mb-20">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{t.benefitsLabel}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.benefits.map((b) => (
                <div key={b.title} className="bg-[#111827] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors">
                  <span className="text-2xl">{b.icon}</span>
                  <p className="text-white font-bold text-sm mt-3 mb-2">{b.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs */}
          <div className="mb-16">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{t.openingsLabel}</p>
            <div className="space-y-4">
              {t.jobs.map((job) => (
                <div key={job.title} className="bg-[#111827] border border-white/10 p-7 hover:border-[#c9a84c]/30 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-white font-bold text-lg group-hover:text-[#c9a84c] transition-colors">{job.title}</h3>
                        <span className="text-[9px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 font-bold tracking-wide uppercase">
                          {t.type[job.type as "fulltime" | "parttime"]}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-3">📍 {job.location}</p>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-2xl">{job.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-gray-300 border border-white/10 bg-[#0d1117] px-2.5 py-1">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/kontakt?job=${encodeURIComponent(job.title)}`}
                      className="shrink-0 inline-block border border-[#c9a84c] text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase px-5 py-3 hover:bg-[#c9a84c] hover:text-black transition-colors text-center"
                    >
                      {t.apply}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spontaneous */}
          <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-10 text-center">
            <p className="text-white font-bold text-lg mb-2">{t.spontaneousLabel}</p>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{t.spontaneousText}</p>
            <Link href="/kontakt" className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors">
              {t.spontaneousApply}
            </Link>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
