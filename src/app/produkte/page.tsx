import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { PRODUCTS, UPCOMING_PRODUCTS } from "./products-data";

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
  de: { eyebrow: "Produkte", headline: "Plattformen, die wir betreiben", sub: "Für jede Plattform bieten wir Verkauf, Implementierung und wahlweise den vollständigen Managed-Service-Betrieb — beginnend mit Huawei DCS, weitere Plattformen folgen.", available: "Verfügbar", soon: "Bald verfügbar", explore: "Produkt & Pakete ansehen →" },
  en: { eyebrow: "Products", headline: "Platforms We Operate", sub: "For every platform we offer sales, implementation and, optionally, full managed-service operations — starting with Huawei DCS, more platforms to follow.", available: "Available", soon: "Coming Soon", explore: "View product & packages →" },
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {PRODUCTS.map((p) => (
              <Link key={p.slug} href={`/produkte/${p.slug}`} className="bg-[#111827] border border-white/10 hover:border-[#c9a84c]/40 transition-colors group p-7 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{t.available}</span>
                </div>
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">{p.vendor}</p>
                <h2 className="text-white font-bold text-lg mb-3 group-hover:text-[#c9a84c] transition-colors">{p.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{p.tagline[locale]}</p>
                <span className="text-[#c9a84c] text-[10px] tracking-widest uppercase">{t.explore}</span>
              </Link>
            ))}

            {UPCOMING_PRODUCTS.map((p) => (
              <div key={p.name} className="bg-[#0d1117] border border-white/5 p-7 flex flex-col opacity-60">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl grayscale">{p.icon}</span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500 border border-white/15 px-2 py-0.5">{t.soon}</span>
                </div>
                <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-2">{p.vendor}</p>
                <h2 className="text-gray-300 font-bold text-lg">{p.name}</h2>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
