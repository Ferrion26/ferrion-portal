import { type Locale } from "@/lib/i18n/translations";

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
    aiLabel: "AI-Infrastruktur",
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
    aiLabel: "AI Infrastructure",
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
            {t.pillars.map((p) => (
              <div key={p.num} className="bg-[#0d1117] border border-white/10 p-7 hover:border-[#c9a84c]/40 transition-colors group relative overflow-hidden">
                <span className="absolute top-4 right-5 text-5xl font-black text-white/5 select-none">{p.num}</span>
                <div className="text-3xl mb-4">{p.icon}</div>
                <span className="inline-block text-[9px] font-bold tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 mb-3">
                  {p.badge}
                </span>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#c9a84c] transition-colors">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Section */}
        <div className="border border-[#c9a84c]/20 bg-[#0d1117] p-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤖</span>
            <p className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase">{t.aiLabel}</p>
          </div>
          <p className="text-gray-400 text-sm mb-8 ml-9">{t.aiDesc}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.aiItems.map((item) => (
              <div key={item.title} className="bg-[#111820] border border-white/10 p-5 hover:border-[#c9a84c]/30 transition-colors">
                <div className="text-xl mb-3">{item.icon}</div>
                <p className="text-white text-xs font-bold mb-1">{item.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
