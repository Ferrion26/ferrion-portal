import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";

const news = [
  {
    date: { de: "15. Mai 2024", en: "May 15, 2024" },
    title: { de: "FusionCompute 8.9 & 8.10: Neuerungen im Überblick", en: "FusionCompute 8.9 & 8.10: Key Updates Overview" },
    tag: "Huawei",
    href: "/newsroom/fusioncompute-8-9-8-10",
  },
  {
    date: { de: "06. Mai 2024", en: "May 6, 2024" },
    title: { de: "NIS2-Compliance: Was IT-Verantwortliche jetzt wissen müssen", en: "NIS2 Compliance: What IT Decision-Makers Need to Know Now" },
    tag: "Backup & Security",
    href: "#newsroom",
  },
  {
    date: { de: "30. April 2024", en: "April 30, 2024" },
    title: { de: "AI-Infrastruktur: GPU Cluster für Enterprise-Workloads", en: "AI Infrastructure: GPU Clusters for Enterprise Workloads" },
    tag: "AI",
    href: "#newsroom",
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
        <div className="grid md:grid-cols-3 gap-6">
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
                {n.href !== "#newsroom" && (
                  <p className="text-[#c9a84c] text-[10px] mt-3 tracking-widest uppercase">Artikel lesen →</p>
                )}
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
