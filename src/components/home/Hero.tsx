import Link from "next/link";

const partners = [
  {
    name: "HUAWEI",
    logo: "/logos/huawei.svg",
    badge: "Gold Partner",
    desc: "Innovative Infrastruktur für eine vernetzte Welt.",
    bg: "bg-white",
  },
  {
    name: "PURE STORAGE",
    logo: "/logos/purestorage.svg",
    badge: "Elite Partner",
    desc: "All-Flash Performance für Ihre Daten.",
    bg: "bg-white",
  },
  {
    name: "COMMVAULT",
    logo: "/logos/commvault.svg",
    badge: "Strategic Partner",
    desc: "Zuverlässiger Schutz Ihrer Daten. Immer.",
    bg: "bg-white",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0d1117 0%, #0f1f2e 40%, #112233 60%, #0d1520 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 60%, #1a4a2e 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-24">
        {/* Left — headline */}
        <div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Technologie,{" "}
            <span className="text-[#c9a84c]">die verbindet.</span>
            <br />
            Lösungen, die bleiben.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
            Wir kombinieren führende Technologien mit umfassendem Know-how – für
            IT-Lösungen, die heute überzeugen und morgen tragen.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#kontakt"
              className="border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-6 py-3 text-sm font-bold tracking-widest uppercase"
            >
              Beratung anfragen →
            </Link>
            <Link
              href="#loesungen"
              className="border border-white/20 text-white hover:border-white/50 transition-colors px-6 py-3 text-sm font-bold tracking-widest uppercase"
            >
              Mehr erfahren →
            </Link>
          </div>
        </div>

        {/* Right — partner cards */}
        <div className="grid grid-cols-3 gap-4">
          {partners.map((p) => (
            <div
              key={p.name}
              className="bg-white/5 border border-white/10 p-5 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <div className="bg-white rounded p-2 mb-3 w-16 h-16 flex items-center justify-center">
                <img src={p.logo} alt={p.name} className="w-12 h-12 object-contain" />
              </div>
              <p className="text-white font-bold text-[10px] tracking-wide mb-1">{p.name}</p>
              <p className="text-[#c9a84c] text-[9px] font-medium mb-2">{p.badge}</p>
              <p className="text-gray-400 text-[9px] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
