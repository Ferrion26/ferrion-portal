import Link from "next/link";
import { notFound } from "next/navigation";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { newsBySlugs } from "@/app/newsroom/news-data";
import { PRODUCTS, getProduct, CARE_PACKAGE_ICONS } from "../products-data";
import InquiryForm from "./InquiryForm";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };
type Params = { params: { slug: string } };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params, searchParams }: Params & SP) {
  const p = getProduct(params.slug);
  if (!p) return {};
  const locale = resolveLocale(searchParams);
  return pageMetadata({
    path: `/produkte/${p.slug}`,
    locale,
    titleDe: `${p.name} — ${p.eyebrow.de} — Ferrion IT Systemhaus`,
    titleEn: `${p.name} — ${p.eyebrow.en} — Ferrion IT Systems House`,
    descDe: p.intro.de,
    descEn: p.intro.en,
  });
}

const copy = {
  de: {
    back: "← Alle Produkte",
    highlightsLabel: "Die Plattform im Überblick",
    packagesCta: "Servicestufen ansehen ↓",
    recommended: "Empfohlen",
    request: "Anfragen →",
    comparisonMonitor: "Monitor",
    comparisonOperate: "Operate",
    comparisonComplete: "Complete",
    articlesLabel: "Mehr im Newsroom",
    readArticle: "Artikel lesen →",
    formAnchor: "anfrage",
    contactCta: "Interesse an {product}?",
    contactSub: "Kontaktieren Sie uns — wir melden uns innerhalb von 24 Stunden mit den nächsten Schritten.",
    contactButton: "Kontakt aufnehmen →",
  },
  en: {
    back: "← All Products",
    highlightsLabel: "The Platform at a Glance",
    packagesCta: "View service tiers ↓",
    recommended: "Recommended",
    request: "Request →",
    comparisonMonitor: "Monitor",
    comparisonOperate: "Operate",
    comparisonComplete: "Complete",
    articlesLabel: "More in the Newsroom",
    readArticle: "Read article →",
    formAnchor: "inquiry",
    contactCta: "Interested in {product}?",
    contactSub: "Get in touch — we'll respond within 24 hours with next steps.",
    contactButton: "Get in touch →",
  },
};

export default function ProductDetailPage({ params, searchParams }: Params & SP) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const locale: Locale = resolveLocale(searchParams);
  const t = copy[locale];
  const ms = product.managedServices;
  const relatedArticles = newsBySlugs(product.relatedArticleSlugs);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />

      <main className="pt-24 pb-24">
        {/* Hero */}
        <section className="relative border-b border-white/10 overflow-hidden">
          {product.heroImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${product.heroImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
            </>
          )}
          <div className="relative max-w-5xl mx-auto px-6 py-16">
            <Link href="/produkte" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
              {t.back}
            </Link>
            <div className="flex items-center gap-4 mb-6">
              {product.vendorLogo ? (
                <span className="w-16 h-16 rounded-md bg-white border border-[#c9a84c]/30 flex items-center justify-center overflow-hidden shrink-0 p-2">
                  <img src={product.vendorLogo} alt={product.vendor} className="w-full h-full object-contain" />
                </span>
              ) : product.icon.startsWith("/") ? (
                <span className="w-16 h-16 rounded-md border border-[#c9a84c]/30 overflow-hidden shrink-0">
                  <img src={product.icon} alt={product.vendor} className="w-full h-full object-cover" />
                </span>
              ) : (
                <span className="text-4xl">{product.icon}</span>
              )}
              <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase">{product.eyebrow[locale]}</p>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">{product.name}</h1>
            <p className="text-[#c9a84c] text-lg font-medium mb-6">{product.tagline[locale]}</p>
            <p className="text-gray-300 text-base leading-relaxed max-w-3xl">{product.intro[locale]}</p>

            <div className="flex flex-wrap gap-4 mt-8">
              {ms && (
                <a href={`#${t.formAnchor}`} className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-[#e0bc5a] transition-colors">
                  {t.packagesCta}
                </a>
              )}
            </div>

            {/* Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mt-12 border border-white/5 max-w-2xl backdrop-blur-sm">
              {product.facts.map((f, i) => (
                <div key={i} className="bg-[#0d1117]/80 px-5 py-4 text-center">
                  <p className="text-xl font-bold text-[#c9a84c]">{f.value[locale]}</p>
                  <p className="text-gray-400 text-[10px] mt-1 leading-snug">{f.label[locale]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{t.highlightsLabel}</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {product.highlights.map((h, i) => (
              <div key={i} className="bg-[#111827] border border-white/10 p-7 hover:border-[#c9a84c]/30 transition-colors">
                {h.icon.startsWith("/") ? (
                  <img src={h.icon} alt="" className="w-12 h-12 mb-4 object-contain" />
                ) : (
                  <span className="text-2xl mb-4 block">{h.icon}</span>
                )}
                <h3 className="text-white font-bold text-base mb-2">{h.title[locale]}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{h.desc[locale]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Managed Services */}
        {ms && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{ms.eyebrow[locale]}</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-5 max-w-2xl">{ms.headline[locale]}</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-8">{ms.intro[locale]}</p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-14">
              {ms.trustBadges.map((b) => (
                <span key={b.de} className="text-[10px] font-bold tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-3 py-1.5">
                  {b[locale]}
                </span>
              ))}
            </div>

            {/* Package cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              {ms.packages.map((p) => (
                <div
                  key={p.id}
                  className={`relative bg-[#111827] border p-7 flex flex-col ${p.recommended ? "border-[#c9a84c]" : "border-white/10"}`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3 right-6 bg-[#c9a84c] text-black text-[9px] font-bold tracking-widest uppercase px-3 py-1">
                      {t.recommended}
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mb-5 p-2.5">
                    <img src={CARE_PACKAGE_ICONS[p.id]} alt="" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-white font-bold text-lg uppercase tracking-wide mb-1">{p.name}</h3>
                  <p className="text-[#c9a84c] text-sm font-medium mb-5">{p.tagline[locale]}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {p.bullets[locale].map((b) => (
                      <li key={b} className="text-gray-400 text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-[#c9a84c] mt-0.5 shrink-0">▸</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <p className="text-white font-bold text-xl mb-6">{ms.comparisonLabel[locale]}</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr>
                    <th className="text-left text-gray-400 font-bold text-xs uppercase tracking-widest bg-[#0d1117] border border-white/10 px-4 py-3">
                      {locale === "de" ? "Leistung" : "Service"}
                    </th>
                    <th className="text-center text-white font-bold text-xs uppercase tracking-widest bg-[#0d1117] border border-white/10 px-4 py-3">{t.comparisonMonitor}</th>
                    <th className="text-center text-[#c9a84c] font-bold text-xs uppercase tracking-widest bg-[#0d1117] border border-[#c9a84c]/30 px-4 py-3">{t.comparisonOperate}</th>
                    <th className="text-center text-white font-bold text-xs uppercase tracking-widest bg-[#0d1117] border border-white/10 px-4 py-3">{t.comparisonComplete}</th>
                  </tr>
                </thead>
                <tbody>
                  {ms.comparison.map((row, i) => (
                    <tr key={row.label.de} className={i % 2 === 0 ? "bg-[#111827]" : "bg-[#0d1117]"}>
                      <td className="text-gray-300 font-medium text-xs px-4 py-3 border border-white/5">{row.label[locale]}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className={`text-center text-xs px-4 py-3 border border-white/5 ${j === 1 ? "text-white font-medium bg-[#c9a84c]/[0.07] border-x-[#c9a84c]/20" : "text-gray-400"}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed max-w-2xl">{ms.note[locale]}</p>
          </section>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-6">{t.articlesLabel}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <Link key={a.slug} href={a.href} className="bg-[#111827] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors group flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">{a.date[locale]}</span>
                    <span className="text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{a.tag}</span>
                  </div>
                  <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#c9a84c] transition-colors mb-3 flex-1">{a.title[locale]}</h3>
                  <span className="text-[#c9a84c] text-[10px] tracking-widest uppercase">{t.readArticle}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Inquiry form */}
        {ms && (
          <section id={t.formAnchor} className="max-w-3xl mx-auto px-6 py-16 border-t border-white/10 scroll-mt-24">
            <InquiryForm locale={locale} productName={product.name} packages={ms.packages} defaultPackageId="operate" />
          </section>
        )}

        {/* Generic contact CTA for products without a Managed Services form */}
        {!ms && (
          <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/10 text-center">
            <p className="text-white font-bold text-xl mb-3">{t.contactCta.replace("{product}", product.name)}</p>
            <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">{t.contactSub}</p>
            <Link href={`/kontakt?topic=${encodeURIComponent(product.name)}`} className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-[#e0bc5a] transition-colors">
              {t.contactButton}
            </Link>
          </section>
        )}
      </main>

      <Footer locale={locale} />
    </div>
  );
}
