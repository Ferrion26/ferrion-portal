import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { PRODUCTS, UPCOMING_PRODUCTS, CATEGORIES } from "./products-data";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  return pageMetadata({
    path: "/produkte",
    locale,
    titleDe: "Produkte — Ferrion IT Systemhaus",
    titleEn: "Products — Ferrion IT Systems House",
    descDe: "Herstellerplattformen, die Ferrion liefert, integriert und als Managed Service betreibt — beginnend mit Huawei DCS.",
    descEn: "Vendor platforms Ferrion delivers, integrates and operates as a managed service — starting with Huawei DCS.",
  });
}

const copy = {
  de: {
    eyebrow: "Produkte",
    headline: "Plattformen, die wir betreiben",
    sub: "Für jede Plattform bieten wir Verkauf, Implementierung und wahlweise den vollständigen Managed-Service-Betrieb — beginnend mit Huawei DCS, weitere Plattformen folgen.",
    categoriesLabel: "Kategorien",
    available: "Verfügbar",
    soon: "Bald verfügbar",
    categorySoon: "In Vorbereitung",
    explore: "Produkt & Pakete ansehen →",
    empty: "Für diese Kategorie folgen in Kürze weitere Informationen.",
  },
  en: {
    eyebrow: "Products",
    headline: "Platforms We Operate",
    sub: "For every platform we offer sales, implementation and, optionally, full managed-service operations — starting with Huawei DCS, more platforms to follow.",
    categoriesLabel: "Categories",
    available: "Available",
    soon: "Coming Soon",
    categorySoon: "In preparation",
    explore: "View product & packages →",
    empty: "More information on this category is coming soon.",
  },
};

export default function ProductsIndexPage({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = copy[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <main className="pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-2xl">
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-[#c9a84c]" />
              {t.eyebrow}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">{t.headline}</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{t.sub}</p>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            {/* Category sidebar — new categories simply get added to CATEGORIES
                in products-data.ts and appear here automatically */}
            <nav className="md:sticky md:top-28 self-start">
              <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-4">{t.categoriesLabel}</p>
              <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {CATEGORIES.map((c) => (
                  <li key={c.id} className="shrink-0">
                    {c.available ? (
                      <a
                        href={`#${c.id}`}
                        className="block px-4 py-3 bg-[#111827] border border-[#c9a84c]/30 text-white text-sm font-medium hover:border-[#c9a84c] transition-colors whitespace-nowrap md:whitespace-normal"
                      >
                        {c.label[locale]}
                      </a>
                    ) : (
                      <span className="flex items-center justify-between gap-2 px-4 py-3 bg-transparent border border-white/5 text-gray-600 text-sm whitespace-nowrap md:whitespace-normal">
                        {c.label[locale]}
                        <span className="text-[8px] font-bold tracking-widest uppercase text-gray-700 shrink-0">{t.categorySoon}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Category panels */}
            <div className="flex flex-col gap-16">
              {CATEGORIES.filter((c) => c.available).map((c) => {
                const items = PRODUCTS.filter((p) => p.categoryId === c.id);
                const upcoming = UPCOMING_PRODUCTS.filter((p) => p.categoryId === c.id);
                return (
                  <section key={c.id} id={c.id} className="scroll-mt-28">
                    <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">{c.label[locale]}</h2>
                    {items.length === 0 && upcoming.length === 0 ? (
                      <p className="text-gray-600 text-sm">{t.empty}</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((p) => (
                          <Link key={p.slug} href={`/produkte/${p.slug}`} className="bg-[#111827] border border-white/10 hover:border-[#c9a84c]/40 transition-colors group p-7 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                              <span className="text-3xl">{p.icon}</span>
                              <span className="text-[9px] font-bold tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{t.available}</span>
                            </div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">{p.vendor}</p>
                            <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#c9a84c] transition-colors">{p.name}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{p.tagline[locale]}</p>
                            <span className="text-[#c9a84c] text-[10px] tracking-widest uppercase">{t.explore}</span>
                          </Link>
                        ))}

                        {upcoming.map((p) => (
                          <div key={p.name} className="bg-[#0d1117] border border-white/5 p-7 flex flex-col opacity-60">
                            <div className="flex items-center justify-between mb-5">
                              <span className="text-3xl grayscale">{p.icon}</span>
                              <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500 border border-white/15 px-2 py-0.5">{t.soon}</span>
                            </div>
                            <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-2">{p.vendor}</p>
                            <h3 className="text-gray-300 font-bold text-lg">{p.name}</h3>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
