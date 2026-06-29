import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";

const news = [
  { date: "15. Mai 2024", dateEn: "May 15, 2024", title: "Huawei stellt neue All-Flash Storage Serie vor", titleEn: "Huawei Introduces New All-Flash Storage Series", tag: "Storage" },
  { date: "06. Mai 2024", dateEn: "May 6, 2024", title: "Backup Best Practices für 2024", titleEn: "Backup Best Practices for 2024", tag: "Backup & Security" },
  { date: "30. April 2024", dateEn: "April 30, 2024", title: "Erfolgreiche Modernisierung bei Kunde X", titleEn: "Successful Modernisation at Client X", tag: "Case Study" },
];

export default function Newsroom({ locale }: { locale: Locale }) {
  const isEn = locale === "en";

  return (
    <section id="newsroom" className="bg-[#0d1117] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-2">
              {isEn ? "Latest" : "Aktuelles"}
            </p>
            <h2 className="text-4xl font-bold text-white">Newsroom</h2>
          </div>
          <Link href="#" className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase border border-[#c9a84c]/40 px-4 py-2 hover:bg-[#c9a84c] hover:text-black transition-colors">
            {isEn ? "All News →" : "Alle News →"}
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {news.map((n) => (
            <article key={n.title} className="bg-[#111820] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500">{isEn ? n.dateEn : n.date}</span>
                <span className="text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{n.tag}</span>
              </div>
              <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#c9a84c] transition-colors">
                {isEn ? n.titleEn : n.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
