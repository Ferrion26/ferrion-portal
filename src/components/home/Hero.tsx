import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient simulating the mountain image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          background:
            "linear-gradient(135deg, #0d1117 0%, #0f1f2e 40%, #112233 60%, #0d1520 100%)",
        }}
      />
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 70% 60%, #1a4a2e 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-24">
        {/* Left — headline */}
        <div>
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Technologie,{" "}
            <span className="text-[#4ade80]">die verbindet.</span>
            <br />
            Lösungen, die bleiben.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
            Wir kombinieren führende Technologien mit umfassendem Know-how – für IT-Lösungen,
            die heute überzeugen und morgen tragen.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#kontakt"
              className="border border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-black transition-colors px-6 py-3 text-sm font-bold tracking-widest uppercase"
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
          {[
            {
              name: "HUAWEI",
              badge: "Gold Partner",
              desc: "Innovative Infrastruktur für eine vernetzte Welt.",
              color: "#e31937",
            },
            {
              name: "PURE STORAGE",
              badge: "Elite Partner",
              desc: "All-Flash Performance für Ihre Daten.",
              color: "#ff6600",
            },
            {
              name: "COMMVAULT",
              badge: "Strategic Partner",
              desc: "Zuverlässiger Schutz Ihrer Daten. Immer.",
              color: "#0066cc",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="bg-white/5 border border-white/10 p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full mb-3 flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: p.color }}
              >
                {p.name[0]}
              </div>
              <p className="text-white font-bold text-xs tracking-wide mb-1">{p.name}</p>
              <p className="text-[#4ade80] text-[10px] font-medium mb-2">{p.badge}</p>
              <p className="text-gray-400 text-[10px] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
