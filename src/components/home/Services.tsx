const services = [
  {
    icon: "☁",
    title: "Cloud & Virtualisierung",
    desc: "Moderne Cloud-Lösungen für agile Unternehmen.",
    href: "#",
  },
  {
    icon: "🗄",
    title: "Storage & Data Management",
    desc: "Effiziente, skalierbare und sichere Storage-Systeme.",
    href: "#",
  },
  {
    icon: "🛡",
    title: "Backup & Security",
    desc: "Backup & Recovery mit höchstem Sicherheitsstandard.",
    href: "#",
  },
  {
    icon: "⚙",
    title: "Managed Services",
    desc: "Proaktiver Betrieb und Support für Ihre IT-Infrastruktur.",
    href: "#",
  },
];

export default function Services() {
  return (
    <section id="loesungen" className="bg-[#111820] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">
            Unsere Lösungen
          </p>
          <h2 className="text-4xl font-bold text-white">
            IT-Services aus einer Hand
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="bg-[#0d1117] border border-white/10 p-6 hover:border-[#c9a84c]/40 transition-colors group"
            >
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-white font-bold mb-2 text-sm group-hover:text-[#c9a84c] transition-colors">
                {s.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
