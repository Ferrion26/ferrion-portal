import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { CATEGORIES, productsByCategory } from "./products-data";
import CategorySidebar from "./CategorySidebar";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  return pageMetadata({
    path: "/produkte",
    locale,
    titleDe: "Produkte — Ferrion IT Systemhaus",
    titleEn: "Products — Ferrion IT Systems House",
    descDe: "Herstellerplattformen, die Ferrion liefert, integriert und als Managed Service betreibt — von Data Storage bis AI & Data Intelligence.",
    descEn: "Vendor platforms Ferrion delivers, integrates and operates as a managed service — from Data Storage to AI & Data Intelligence.",
  });
}

const copy = {
  de: {
    eyebrow: "Produkte",
    headline: "Plattformen, die wir betreiben",
    sub: "Für jede Plattform bieten wir Verkauf, Implementierung und wahlweise den vollständigen Managed-Service-Betrieb. Neue Kategorien und Hersteller ergänzen wir laufend.",
    categoriesLabel: "Kategorien",
    explore: "Produkt ansehen →",
    empty: "Für diese Kategorie folgen in Kürze weitere Informationen.",
  },
  en: {
    eyebrow: "Products",
    headline: "Platforms We Operate",
    sub: "For every platform we offer sales, implementation and, optionally, full managed-service operations. We're continuously adding new categories and vendors.",
    categoriesLabel: "Categories",
    explore: "View product →",
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
            {/* Category sidebar — mirrors how manufacturers like Huawei
                structure their own product navigation (category list on
                the left, matching products on the right). New categories
                just get added to CATEGORIES in products-data.ts. Active
                category is tracked via scroll position (CategorySidebar). */}
            <CategorySidebar categories={CATEGORIES} locale={locale} label={t.categoriesLabel} />

            {/* Category panels — each product can list itself under more
                than one category (e.g. OceanStor Dorado appears under both
                Data Storage and AI Data Platform), so panels are derived
                per category rather than a single flat product grid. */}
            <div className="flex flex-col gap-16">
              {CATEGORIES.map((c) => {
                const items = productsByCategory(c.id);
                const subgroups = Array.from(
                  new Set(items.filter((p) => p.subgroup).map((p) => p.subgroup!.de))
                );

                return (
                  <section key={c.id} id={c.id} className="scroll-mt-28">
                    <h2 className="text-white font-bold text-lg mb-6 pb-3 border-b border-white/10">{c.label[locale]}</h2>
                    {items.length === 0 ? (
                      <p className="text-gray-600 text-sm">{t.empty}</p>
                    ) : (
                      <div className="flex flex-col gap-8">
                        {subgroups.map((sg) => {
                          const group = items.filter((p) => p.subgroup?.de === sg);
                          return (
                            <div key={sg}>
                              <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-4">{group[0].subgroup![locale]}</p>
                              <ProductGrid products={group} locale={locale} explore={t.explore} />
                            </div>
                          );
                        })}
                        {items.some((p) => !p.subgroup) && (
                          <ProductGrid products={items.filter((p) => !p.subgroup)} locale={locale} explore={t.explore} />
                        )}
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

function ProductGrid({
  products,
  locale,
  explore,
}: {
  products: ReturnType<typeof productsByCategory>;
  locale: Locale;
  explore: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <Link key={p.slug} href={`/produkte/${p.slug}`} className="bg-[#111827] border border-white/10 hover:border-[#c9a84c]/40 transition-colors group p-7 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            {p.vendorLogo ? (
              <span className="w-10 h-10 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center overflow-hidden">
                <img src={p.vendorLogo} alt={p.vendor} className="w-6 h-6 object-contain" />
              </span>
            ) : (
              <span className="text-3xl">{p.icon}</span>
            )}
          </div>
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">{p.vendor}</p>
          <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#c9a84c] transition-colors">{p.name}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{p.tagline[locale]}</p>
          <span className="text-[#c9a84c] text-[10px] tracking-widest uppercase">{explore}</span>
        </Link>
      ))}
    </div>
  );
}
