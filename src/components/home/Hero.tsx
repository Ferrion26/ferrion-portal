"use client";

import Link from "next/link";
import { translations, type Locale } from "@/lib/i18n/translations";

const partners = [
  { key: "HUAWEI", logo: "/logos/Huawei_Standard_logo.svg.png", badgeKey: "goldBadge" as const, desc: { de: "Leithersteller — Storage & Data Center Infrastruktur.", en: "Lead vendor — Storage & Data Center Infrastructure." } },
  { key: "PURE STORAGE", logo: "/logos/Pure Storage Bug Orange_undefined.PNG", badgeKey: "eliteBadge" as const, desc: { de: "Premium-Storage für performance-kritische Workloads.", en: "Premium storage for performance-critical workloads." } },
  { key: "COMMVAULT", logo: "/logos/cropped-favicon-commvault-1.png", badgeKey: "strategicBadge" as const, desc: { de: "Data Protection & Backup — NIS2-ready.", en: "Data Protection & Backup — NIS2-ready." } },
];

const newsItems = [
  { date: { de: "15. Mai 2024", en: "May 15, 2024" }, title: { de: "Huawei stellt neue All-Flash Storage Serie vor", en: "Huawei Introduces New All-Flash Storage Series" }, img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=70" },
  { date: { de: "06. Mai 2024", en: "May 6, 2024" }, title: { de: "NIS2-Compliance: Backup & Security Best Practices", en: "NIS2 Compliance: Backup & Security Best Practices" }, img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=70" },
  { date: { de: "30. April 2024", en: "April 30, 2024" }, title: { de: "AI-Infrastruktur: GPU Cluster für Enterprise", en: "AI Infrastructure: GPU Clusters for Enterprise" }, img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=70" },
];

const heroCopy = {
  de: {
    headline1: "Infrastruktur, die trägt.",
    headline2: "Expertise, die überzeugt.",
    sub: "Ferrion verbindet marktführende Technologien mit tiefem Datenbank-Know-how — als durchgängiges Paket aus Beratung, Implementierung und Managed Services.",
    cta1: "Beratung anfragen →",
    cta2: "Lösungen entdecken →",
    services: [
      { icon: "🗄", title: "Storage & Infrastruktur", desc: "Huawei, Pure Storage — skalierbar und zuverlässig." },
      { icon: "🛡", title: "Backup & Security", desc: "Commvault-Lösungen für NIS2-konforme Datensicherung." },
      { icon: "🤖", title: "AI-Infrastruktur", desc: "GPU Server, Private AI Cluster, NVIDIA." },
      { icon: "⚙", title: "Managed Services", desc: "Proaktiver Betrieb — damit Sie sich aufs Wesentliche konzentrieren." },
    ],
  },
  en: {
    headline1: "Infrastructure that endures.",
    headline2: "Expertise that convinces.",
    sub: "Ferrion combines leading technologies with deep database know-how — as a complete package of consulting, implementation and managed services.",
    cta1: "Request Consultation →",
    cta2: "Discover Solutions →",
    services: [
      { icon: "🗄", title: "Storage & Infrastructure", desc: "Huawei, Pure Storage — scalable and reliable." },
      { icon: "🛡", title: "Backup & Security", desc: "Commvault solutions for NIS2-compliant data protection." },
      { icon: "🤖", title: "AI Infrastructure", desc: "GPU servers, private AI clusters, NVIDIA." },
      { icon: "⚙", title: "Managed Services", desc: "Proactive operations — so you can focus on what matters." },
    ],
  },
};

export default function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const h = heroCopy[locale];

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
      <div className="absolute inset-0 bg-black/55" />

      {/* Main content */}
      <div className="relative flex-1 flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-4">
              {locale === "de" ? "IT-Systemhaus · Wien · Österreich" : "IT Systems House · Vienna · Austria"}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-1 text-white">{h.headline1}</h1>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-[#c9a84c]">{h.headline2}</h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-lg">{h.sub}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="#kontakt" className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase">
                {h.cta1}
              </Link>
              <Link href="#loesungen" className="border border-white/30 text-white hover:border-white/60 transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase">
                {h.cta2}
              </Link>
            </div>
          </div>

          {/* Right — partners + newsroom */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-4">
              {partners.map((p) => (
                <div key={p.key} className="flex flex-col items-center text-center">
                  <img src={p.logo} alt={p.key} className="h-10 w-auto object-contain mb-2" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
                  <p className="text-[#c9a84c] text-[9px] font-bold tracking-wide uppercase">{t.hero[p.badgeKey]}</p>
                  <p className="text-gray-300 text-[9px] leading-relaxed mt-0.5">{p.desc[locale]}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-xs tracking-widest uppercase">{t.hero.newsroom}</p>
                <Link href="#newsroom" className="text-[10px] text-[#c9a84c] tracking-widest uppercase hover:underline">{t.hero.allNews}</Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {newsItems.map((n) => (
                  <div key={n.title.de} className="bg-white group cursor-pointer overflow-hidden">
                    <img src={n.img} alt={n.title[locale]} className="w-full h-16 object-cover" crossOrigin="anonymous" />
                    <div className="p-2">
                      <p className="text-gray-400 text-[9px] mb-1">{n.date[locale]}</p>
                      <p className="text-gray-800 text-[10px] font-medium leading-snug group-hover:text-[#c9a84c] transition-colors">{n.title[locale]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services bar */}
      <div className="relative bg-white/15 backdrop-blur-md border-t border-white/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-4">
            {h.services.map((s, i) => (
              <div key={s.title} className={`flex items-center gap-3 py-4 px-4 hover:bg-white/10 transition-colors cursor-pointer ${i < 3 ? "border-r border-white/20" : ""}`}>
                <span className="text-xl shrink-0 opacity-80">{s.icon}</span>
                <div>
                  <p className="text-white font-bold text-xs">{s.title}</p>
                  <p className="text-gray-200 text-[10px] leading-snug mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact strip */}
      <div className="relative bg-black/60 backdrop-blur-md border-t border-white/10 py-2.5">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-8 text-[11px] text-gray-400">
          <span>✉ info@ferrion.at</span>
          <span>📍 Wien, Österreich</span>
          <span className="ml-auto text-[#c9a84c] font-bold tracking-widest text-[10px] uppercase">build to endure</span>
        </div>
      </div>
    </section>
  );
}
