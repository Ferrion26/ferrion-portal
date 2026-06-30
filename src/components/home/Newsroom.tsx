import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { newsBySlugs } from "@/app/newsroom/news-data";

// Curated selection shown on the homepage (full history lives at /newsroom).
const FEATURED = [
  "pure-storage-ki-plattform",
  "huawei-dorado-v7",
  "pure-storage-migration",
  "nis2-compliance-oesterreich",
  "fusioncompute-8-9-8-10",
];

const news = newsBySlugs(FEATURED);

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
          <Link href="/newsroom" className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase border border-[#c9a84c]/40 px-4 py-2 hover:bg-[#c9a84c] hover:text-black transition-colors">
            {isEn ? "All News →" : "Alle News →"}
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n) => (
            <Link key={n.title.de} href={n.href}>
              <article className="bg-[#111820] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors group cursor-pointer h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">{n.date[locale]}</span>
                  <span className="text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{n.tag}</span>
                </div>
                <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#c9a84c] transition-colors">
                  {n.title[locale]}
                </h3>
                <p className="text-[#c9a84c] text-[10px] mt-3 tracking-widest uppercase">{locale === "de" ? "Artikel lesen →" : "Read Article →"}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
