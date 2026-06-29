import Link from "next/link";

const news = [
  {
    date: "15. Mai 2024",
    title: "Huawei stellt neue All-Flash Storage Serie vor",
    tag: "Storage",
  },
  {
    date: "06. Mai 2024",
    title: "Backup Best Practices für 2024",
    tag: "Backup & Security",
  },
  {
    date: "30. April 2024",
    title: "Erfolgreiche Modernisierung bei Kunde X",
    tag: "Case Study",
  },
];

export default function Newsroom() {
  return (
    <section id="newsroom" className="bg-[#0d1117] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#4ade80] text-xs font-bold tracking-widest uppercase mb-2">
              Aktuelles
            </p>
            <h2 className="text-4xl font-bold text-white">Newsroom</h2>
          </div>
          <Link
            href="#"
            className="text-xs font-bold tracking-widest text-[#4ade80] uppercase border border-[#4ade80]/40 px-4 py-2 hover:bg-[#4ade80] hover:text-black transition-colors"
          >
            Alle News →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {news.map((n) => (
            <article
              key={n.title}
              className="bg-[#111820] border border-white/10 p-6 hover:border-[#4ade80]/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500">{n.date}</span>
                <span className="text-[10px] text-[#4ade80] border border-[#4ade80]/30 px-2 py-0.5">
                  {n.tag}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#4ade80] transition-colors">
                {n.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
