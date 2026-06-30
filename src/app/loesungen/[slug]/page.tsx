import Link from "next/link";
import { notFound } from "next/navigation";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { SOLUTIONS, getSolution } from "../solutions-data";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params, searchParams }: { params: { slug: string } } & SP) {
  const sol = getSolution(params.slug);
  if (!sol) return {};
  return pageMetadata({
    path: `/loesungen/${sol.slug}`,
    locale: resolveLocale(searchParams),
    titleDe: `${sol.eyebrow.de} — Ferrion IT Systemhaus`,
    titleEn: `${sol.eyebrow.en} — Ferrion IT Systems House`,
    descDe: sol.lead.de,
    descEn: sol.lead.en,
  });
}

export default function SolutionPage({ params, searchParams }: { params: { slug: string } } & SP) {
  const sol = getSolution(params.slug);
  if (!sol) notFound();

  const locale: Locale = resolveLocale(searchParams);
  const others = SOLUTIONS.filter((s) => s.slug !== sol.slug);
  const backLabel = locale === "de" ? "← Alle Lösungen" : "← All Solutions";
  const moreLabel = locale === "de" ? "Weitere Lösungen" : "More Solutions";

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />

      <main className="pt-24 pb-24">
        {/* Hero */}
        <section className="border-b border-white/10">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <Link href="/#loesungen" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
              {backLabel}
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{sol.icon}</span>
              <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase">{sol.eyebrow[locale]}</p>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">{sol.title[locale]}</h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-3xl">{sol.lead[locale]}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-white/5 mt-12 border border-white/5 max-w-2xl">
              {sol.stats.map((s) => (
                <div key={s.value} className="bg-[#0d1117] px-6 py-5 text-center">
                  <p className="text-2xl font-bold text-[#c9a84c]">{s.value}</p>
                  <p className="text-gray-500 text-[10px] mt-1 leading-snug">{s.label[locale]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 gap-6">
            {sol.capabilities[locale].map((c) => (
              <div key={c.title} className="bg-[#111827] border border-white/10 p-7 hover:border-[#c9a84c]/30 transition-colors">
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-3">
                  <span className="inline-block w-4 h-px bg-[#c9a84c]" />
                  {c.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech + Use cases */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-white font-bold text-xs tracking-widest uppercase mb-5">{sol.techLabel[locale]}</p>
              <div className="flex flex-wrap gap-2">
                {sol.tech.map((tech) => (
                  <span key={tech} className="text-xs text-gray-300 border border-white/10 bg-[#111827] px-3 py-1.5 hover:border-[#c9a84c]/40 transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-xs tracking-widest uppercase mb-5">{sol.useCasesLabel[locale]}</p>
              <ul className="space-y-3">
                {sol.useCases[locale].map((uc) => (
                  <li key={uc} className="text-gray-400 text-sm flex items-start gap-3">
                    <span className="text-[#c9a84c] mt-0.5">▸</span>
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-10 text-center">
            <Link href="/beratung" className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-[#e0bc5a] transition-colors">
              {sol.cta[locale]}
            </Link>
          </div>
        </section>

        {/* Other solutions */}
        <section className="max-w-5xl mx-auto px-6 mt-20">
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{moreLabel}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/loesungen/${o.slug}`} className="bg-[#111827] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors group">
                <span className="text-2xl">{o.icon}</span>
                <p className="text-white font-bold text-sm mt-3 group-hover:text-[#c9a84c] transition-colors">{o.eyebrow[locale]}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
