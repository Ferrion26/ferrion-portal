import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { PRODUCTS } from "@/app/produkte/products-data";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  return pageMetadata({
    path: "/managed-services",
    locale,
    titleDe: "Managed Services — Ferrion IT Systemhaus",
    titleEn: "Managed Services — Ferrion IT Systems House",
    descDe: "Servicestufen für den laufenden Betrieb Ihrer Infrastruktur — von reiner Überwachung bis zur vollen Verfügbarkeitsgarantie.",
    descEn: "Service tiers for the ongoing operation of your infrastructure — from pure monitoring to full availability ownership.",
  });
}

const copy = {
  de: {
    eyebrow: "Managed Services",
    headline: "Betrieb, den Sie nicht mehr selbst tragen müssen",
    sub: "Für jede Plattform, die wir liefern, bieten wir passende Servicestufen an — von der reinen Überwachung bis zur vollen Verfügbarkeitsgarantie. Sie wählen, wie viel Betriebsverantwortung Sie abgeben möchten.",
    recommended: "Empfohlen",
    viewDetails: "Pakete & Details ansehen →",
    empty: "Für weitere Plattformen folgen Managed-Services-Pakete in Kürze.",
  },
  en: {
    eyebrow: "Managed Services",
    headline: "Operations You No Longer Have to Carry Yourself",
    sub: "For every platform we deliver, we offer matching service tiers — from pure monitoring to full availability ownership. You choose how much operational responsibility to hand over.",
    recommended: "Recommended",
    viewDetails: "View packages & details →",
    empty: "Managed Services packages for more platforms are coming soon.",
  },
};

export default function ManagedServicesIndexPage({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = copy[locale];
  const products = PRODUCTS.filter((p) => p.status === "available" && p.managedServices);

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

          {products.length === 0 ? (
            <p className="text-gray-600 text-sm">{t.empty}</p>
          ) : (
            <div className="flex flex-col gap-20">
              {products.map((product) => {
                const ms = product.managedServices!;
                return (
                  <section key={product.slug}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{product.icon}</span>
                      <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">{product.vendor} · {product.name}</p>
                    </div>
                    <h2 className="text-white font-bold text-2xl mb-6">{ms.headline[locale]}</h2>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                          <h3 className="text-white font-bold text-base uppercase tracking-wide mb-1">{p.name}</h3>
                          <p className="text-[#c9a84c] text-sm font-medium mb-5">{p.tagline[locale]}</p>
                          <ul className="space-y-2.5 flex-1">
                            {p.bullets[locale].slice(0, 3).map((b) => (
                              <li key={b} className="text-gray-400 text-sm flex items-start gap-2 leading-relaxed">
                                <span className="text-[#c9a84c] mt-0.5 shrink-0">▸</span>{b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <Link href={`/produkte/${product.slug}#anfrage`} className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors">
                      {t.viewDetails}
                    </Link>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
