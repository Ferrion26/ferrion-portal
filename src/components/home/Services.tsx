import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/lib/i18n/translations";

const PILLAR_IMAGES = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=70", // server rack / storage
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=70", // team consulting / architecture
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70", // monitoring dashboard
];

const AI_IMAGES = [
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=70", // GPU / chip
  "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&q=70", // kubernetes / containers
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=70", // data storage / datacenter
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=70", // backup / security shield
];

const content = {
  de: {
    tag: "Unsere Lösungen",
    headline: "IT-Services aus einer Hand",
    pillarsLabel: "Drei Säulen — ein Partner",
    pillars: [
      {
        num: "01",
        title: "Handel",
        desc: "Verkauf von Infrastruktur (Storage, Server, Data-Protection, Netzwerk) sowie Software und Lizenzen der Leithersteller Huawei, Pure Storage und Commvault.",
        badge: "Volumen & Markteintritt",
        icon: "🗄",
      },
      {
        num: "02",
        title: "Dienstleistungen",
        desc: "Beratung, Architektur, Implementierung, Migration — insbesondere im Datenbankumfeld als Nische. Hohe Marge durch Differenzierung.",
        badge: "Hohe Marge",
        icon: "⚙",
      },
      {
        num: "03",
        title: "Managed Services",
        desc: "Betrieb, Monitoring, Wartung, Renewals und Subscriptions als laufende Verträge. Wiederkehrende Erlöse decken die Fixkosten.",
        badge: "Wiederkehrend",
        icon: "🔄",
      },
    ],
    detailLabel: "Lösungen im Detail",
    detailLearn: "Mehr erfahren →",
    details: [
      { icon: "🗄", title: "Storage & Infrastruktur", slug: "storage" },
      { icon: "🛡", title: "Backup & Security", slug: "backup" },
      { icon: "🤖", title: "AI-Infrastruktur", slug: "ai-infrastruktur" },
      { icon: "⚙", title: "Managed Services", slug: "managed-services" },
    ],
    aiLabel: "AI-Infrastruktur",
    aiMore: "AI-Infrastruktur im Detail →",
    aiDesc: "Wir begleiten Ihr Unternehmen auf dem Weg in die KI — von der Infrastruktur bis zum Betrieb.",
    aiItems: [
      { icon: "🖥", title: "GPU Server & Private AI Cluster", desc: "NVIDIA-Infrastruktur für anspruchsvolle AI-Workloads." },
      { icon: "☸", title: "Kubernetes für AI", desc: "Container-Orchestrierung für skalierbare AI-Deployments." },
      { icon: "💾", title: "AI Storage", desc: "Hochperformante Storage-Lösungen von Pure Storage, Huawei & NetApp." },
      { icon: "🛡", title: "AI Backup & Disaster Recovery", desc: "Zuverlässiger Schutz Ihrer AI-Daten und -Modelle." },
    ],
  },
  en: {
    tag: "Our Solutions",
    headline: "IT Services from a Single Source",
    pillarsLabel: "Three Pillars — One Partner",
    pillars: [
      {
        num: "01",
        title: "Hardware & Licensing",
        desc: "Sale of infrastructure (storage, servers, data protection, networking) and software/licences from leading vendors Huawei, Pure Storage and Commvault.",
        badge: "Volume & Market Entry",
        icon: "🗄",
      },
      {
        num: "02",
        title: "Professional Services",
        desc: "Consulting, architecture, implementation, migration — especially in the database space as a niche. High margin through differentiation.",
        badge: "High Margin",
        icon: "⚙",
      },
      {
        num: "03",
        title: "Managed Services",
        desc: "Operations, monitoring, maintenance, renewals and subscriptions as ongoing contracts. Recurring revenues cover fixed costs.",
        badge: "Recurring Revenue",
        icon: "🔄",
      },
    ],
    detailLabel: "Solutions in Detail",
    detailLearn: "Learn more →",
    details: [
      { icon: "🗄", title: "Storage & Infrastructure", slug: "storage" },
      { icon: "🛡", title: "Backup & Security", slug: "backup" },
      { icon: "🤖", title: "AI Infrastructure", slug: "ai-infrastruktur" },
      { icon: "⚙", title: "Managed Services", slug: "managed-services" },
    ],
    aiLabel: "AI Infrastructure",
    aiMore: "AI Infrastructure in detail →",
    aiDesc: "We guide your company on the journey into AI — from infrastructure to operations.",
    aiItems: [
      { icon: "🖥", title: "GPU Servers & Private AI Clusters", desc: "NVIDIA infrastructure for demanding AI workloads." },
      { icon: "☸", title: "Kubernetes for AI", desc: "Container orchestration for scalable AI deployments." },
      { icon: "💾", title: "AI Storage", desc: "High-performance storage solutions from Pure Storage, Huawei & NetApp." },
      { icon: "🛡", title: "AI Backup & Disaster Recovery", desc: "Reliable protection for your AI data and models." },
    ],
  },
};

export default function Services({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section id="loesungen" className="bg-[#111820] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.tag}</p>
          <h2 className="text-4xl font-bold text-white">{t.headline}</h2>
        </div>

        {/* 3 Pillars */}
        <div className="mb-4">
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{t.pillarsLabel}</p>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {t.pillars.map((p, i) => (
              <div key={p.num} className="bg-[#0d1117] border border-white/10 hover:border-[#c9a84c]/40 transition-colors group relative overflow-hidden flex flex-col">
                <div className="relative h-44 overflow-hidden shrink-0">
                  <Image
                    src={PILLAR_IMAGES[i]}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117]" />
                  <span className="absolute top-4 right-5 text-5xl font-black text-white/10 select-none">{p.num}</span>
                </div>
                <div className="p-7 flex-1">
                  <span className="inline-block text-[9px] font-bold tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 mb-3">
                    {p.badge}
                  </span>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">{p.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Section */}
        <div className="border border-[#c9a84c]/20 bg-[#0d1117] p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤖</span>
            <p className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase">{t.aiLabel}</p>
            <Link href="/loesungen/ai-infrastruktur" className="ml-auto text-[10px] text-[#c9a84c] tracking-widest uppercase hover:underline">
              {t.aiMore}
            </Link>
          </div>
          <p className="text-gray-400 text-sm mb-8 ml-9">{t.aiDesc}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.aiItems.map((item, i) => (
              <div key={item.title} className="bg-[#111820] border border-white/10 hover:border-[#c9a84c]/30 transition-colors group overflow-hidden">
                <div className="relative h-28 overflow-hidden">
                  <Image
                    src={AI_IMAGES[i]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111820]" />
                </div>
                <div className="p-5">
                  <p className="text-white text-xs font-bold mb-1">{item.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail links */}
        <div className="mt-16">
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{t.detailLabel}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.details.map((d) => (
              <Link
                key={d.slug}
                href={`/loesungen/${d.slug}`}
                className="bg-[#0d1117] border border-white/10 hover:border-[#c9a84c]/40 transition-colors group p-6 flex flex-col"
              >
                <span className="text-2xl mb-3">{d.icon}</span>
                <p className="text-white font-bold text-sm mb-3 group-hover:text-[#c9a84c] transition-colors">{d.title}</p>
                <span className="text-[#c9a84c] text-[10px] tracking-widest uppercase mt-auto">{t.detailLearn}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
