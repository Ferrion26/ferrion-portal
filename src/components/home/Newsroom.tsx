import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";

const news = [
  {
    date: { de: "1. Oktober 2025", en: "October 1, 2025" },
    title: { de: "Pure Storage: Die Plattform für das KI-Zeitalter", en: "Pure Storage: The Platform for the AI Era" },
    tag: "Pure Storage",
    href: "/newsroom/pure-storage-ki-plattform",
  },
  {
    date: { de: "1. Oktober 2025", en: "October 1, 2025" },
    title: { de: "Huawei OceanStor Dorado V7: Die neue Benchmark für All-Flash-Storage in der KI-Ära", en: "Huawei OceanStor Dorado V7: The New Benchmark for All-Flash Storage in the AI Era" },
    tag: "Huawei",
    href: "/newsroom/huawei-dorado-v7",
  },
  {
    date: { de: "22. März 2024", en: "March 22, 2024" },
    title: { de: "500 TB in 68 Stunden: Zero-Downtime-Migration auf Pure Storage FlashArray", en: "500 TB in 68 Hours: Zero-Downtime Migration to Pure Storage FlashArray" },
    tag: "Storage",
    href: "/newsroom/pure-storage-migration",
  },
  {
    date: { de: "06. Mai 2024", en: "May 6, 2024" },
    title: { de: "NIS2-Compliance in 10 Wochen: Von der Risikoanalyse bis zum Audit", en: "NIS2 Compliance in 10 Weeks: From Risk Analysis to Passed Audit" },
    tag: "Backup & Security",
    href: "/newsroom/nis2-compliance-oesterreich",
  },
  {
    date: { de: "15. Mai 2024", en: "May 15, 2024" },
    title: { de: "FusionCompute 8.9 & 8.10: Neuerungen im Überblick", en: "FusionCompute 8.9 & 8.10: Key Updates Overview" },
    tag: "Huawei",
    href: "/newsroom/fusioncompute-8-9-8-10",
  },
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
