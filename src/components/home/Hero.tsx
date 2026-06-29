"use client";

import Link from "next/link";
import { translations, type Locale } from "@/lib/i18n/translations";

const partners = [
  { key: "HUAWEI", logo: "/logos/Huawei_Standard_logo.svg.png", badgeKey: "goldBadge", desc: "Innovative Infrastruktur für eine vernetzte Welt." },
  { key: "PURE STORAGE", logo: "/logos/Pure Storage Bug Orange_undefined.PNG", badgeKey: "eliteBadge", desc: "All-Flash Performance für Ihre Daten." },
  { key: "COMMVAULT", logo: "/logos/cropped-favicon-commvault-1.png", badgeKey: "strategicBadge", desc: "Zuverlässiger Schutz Ihrer Daten. Immer." },
];

const newsItems = [
  { date: "15. Mai 2024", title: "Huawei stellt neue All-Flash Storage Serie vor", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=70" },
  { date: "06. Mai 2024", title: "Backup Best Practices für 2024", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=70" },
  { date: "30. April 2024", title: "Erfolgreiche Modernisierung bei Kunde X", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=70" },
];

export default function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const h = t.hero;
  const s = t.services;

  const services = [
    { title: s.cloud.title, desc: s.cloud.desc, icon: "☁" },
    { title: s.storage.title, desc: s.storage.desc, icon: "🗄" },
    { title: s.backup.title, desc: s.backup.desc, icon: "🛡" },
    { title: s.managed.title, desc: s.managed.desc, icon: "⚙" },
  ];

  const [line1, line2] = h.headline.split("\n");

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex-1 flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-8 items-start pt-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
              {line1}<br />{line2}
            </h1>
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

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-6">
              {partners.map((p) => (
                <div key={p.key} className="flex flex-col items-center text-center">
                  <img src={p.logo} alt={p.key} className="h-12 w-auto object-contain mb-2" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }} />
                  <p className="text-[#c9a84c] text-[10px] font-medium tracking-wide">{h[p.badgeKey as keyof typeof h] as string}</p>
                  <p className="text-gray-300 text-[9px] leading-relaxed mt-1">{p.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-xs tracking-widest uppercase">{h.newsroom}</p>
                <Link href="#newsroom" className="text-[10px] text-[#c9a84c] tracking-widest uppercase hover:underline">{h.allNews}</Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {newsItems.map((n) => (
                  <div key={n.title} className="bg-white group cursor-pointer overflow-hidden">
                    <img src={n.img} alt={n.title} className="w-full h-16 object-cover" crossOrigin="anonymous" />
                    <div className="p-2">
                      <p className="text-gray-400 text-[9px] mb-1">{n.date}</p>
                      <p className="text-gray-800 text-[10px] font-medium leading-snug group-hover:text-[#c9a84c] transition-colors">{n.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-white/15 backdrop-blur-md border-t border-white/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-4">
            {services.map((s, i) => (
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

      <div className="relative bg-black/50 backdrop-blur-md border-t border-white/10 py-2.5">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-8 text-[11px] text-gray-400">
          <span>📞 +49 123 456789-0</span>
          <span>✉ info@ferrion.de</span>
          <span>📍 Musterstraße 1, 12345 Musterstadt</span>
        </div>
      </div>
    </section>
  );
}
