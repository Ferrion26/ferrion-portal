"use client";

import Link from "next/link";

const partners = [
  {
    name: "HUAWEI",
    logo: "/logos/Huawei_Standard_logo.svg.png",
    badge: "Gold Partner",
    desc: "Innovative Infrastruktur für eine vernetzte Welt.",
  },
  {
    name: "PURE STORAGE",
    logo: "/logos/Pure Storage Bug Orange_undefined.PNG",
    badge: "Elite Partner",
    desc: "All-Flash Performance für Ihre Daten.",
  },
  {
    name: "COMMVAULT",
    logo: "/logos/cropped-favicon-commvault-1.png",
    badge: "Strategic Partner",
    desc: "Zuverlässiger Schutz Ihrer Daten. Immer.",
  },
];

const services = [
  { icon: "☁", title: "Cloud & Virtualisierung", desc: "Moderne Cloud-Lösungen für agile Unternehmen." },
  { icon: "🗄", title: "Storage & Data Management", desc: "Effiziente, skalierbare und sichere Storage-Systeme." },
  { icon: "🛡", title: "Backup & Security", desc: "Backup & Recovery auf höchstem Niveau." },
  { icon: "⚙", title: "Managed Services", desc: "Proaktiver Betrieb und Support für Ihre IT-Infrastruktur." },
];

const newsItems = [
  {
    date: "15. Mai 2024",
    title: "Huawei stellt neue All-Flash Storage Serie vor",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=70",
  },
  {
    date: "06. Mai 2024",
    title: "Backup Best Practices für 2024",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=70",
  },
  {
    date: "30. April 2024",
    title: "Erfolgreiche Modernisierung bei Kunde X",
    img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=70",
  },
];

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Main hero content */}
      <div className="relative flex-1 flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-8 items-start pt-4">

          {/* Left — headline + CTAs */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
              Technologie, die verbindet.<br />
              Lösungen, die bleiben.
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-lg">
              Wir kombinieren führende Technologien mit umfassendem Know-how –
              für IT-Lösungen, die heute überzeugen und morgen tragen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#kontakt"
                className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase"
              >
                Beratung anfragen →
              </Link>
              <Link
                href="#loesungen"
                className="border border-white/30 text-white hover:border-white/60 transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase"
              >
                Mehr erfahren →
              </Link>
            </div>
          </div>

          {/* Right — partners (no boxes) + newsroom */}
          <div className="flex flex-col gap-5">
            {/* Partner logos — transparent, no cards */}
            <div className="grid grid-cols-3 gap-6">
              {partners.map((p) => (
                <div key={p.name} className="flex flex-col items-center text-center">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="h-12 w-auto object-contain mb-2"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
                  />
                  <p className="text-[#c9a84c] text-[10px] font-medium tracking-wide">{p.badge}</p>
                  <p className="text-gray-300 text-[9px] leading-relaxed mt-1">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Newsroom — white cards with images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-bold text-xs tracking-widest uppercase">Newsroom</p>
                <Link href="#newsroom" className="text-[10px] text-[#c9a84c] tracking-widest uppercase hover:underline">
                  Alle News →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {newsItems.map((n) => (
                  <div key={n.title} className="bg-white group cursor-pointer overflow-hidden">
                    <img
                      src={n.img}
                      alt={n.title}
                      className="w-full h-16 object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="p-2">
                      <p className="text-gray-400 text-[9px] mb-1">{n.date}</p>
                      <p className="text-gray-800 text-[10px] font-medium leading-snug group-hover:text-[#c9a84c] transition-colors">
                        {n.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services bar — lighter/frosted */}
      <div className="relative bg-white/15 backdrop-blur-md border-t border-white/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-4">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`flex items-center gap-3 py-4 px-4 hover:bg-white/10 transition-colors cursor-pointer ${
                  i < 3 ? "border-r border-white/20" : ""
                }`}
              >
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
