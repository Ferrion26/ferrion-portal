import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import FadeIn from "@/components/FadeIn";
import { PRODUCTS } from "@/app/produkte/products-data";

const content = {
  de: {
    eyebrow: "Managed Services",
    headline: "Betrieb, den Sie nicht mehr selbst tragen müssen",
    sub: "Drei Servicestufen für Ihre Huawei-DCS-Infrastruktur — von der reinen Überwachung bis zur vollen Verfügbarkeitsgarantie. Weitere Plattformen folgen.",
    perMonth: "/ Monat",
    recommended: "Empfohlen",
    cta: "Alle Pakete & Details ansehen →",
    note: "Individuelles Angebot nach kurzem Umgebungs-Check · weitere Plattformen in Vorbereitung",
  },
  en: {
    eyebrow: "Managed Services",
    headline: "Operations You No Longer Have to Carry Yourself",
    sub: "Three service tiers for your Huawei DCS infrastructure — from pure monitoring to full availability ownership. More platforms to follow.",
    perMonth: "/ month",
    recommended: "Recommended",
    cta: "View all packages & details →",
    note: "Individual quote after a short environment check · more platforms in preparation",
  },
};

export default function ManagedServicesTeaser({ locale }: { locale: Locale }) {
  const t = content[locale];
  const product = PRODUCTS.find((p) => p.slug === "huawei-dcs");
  if (!product?.managedServices) return null;
  const packages = product.managedServices.packages;

  return (
    <section className="bg-[#111820] py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.eyebrow}</p>
          <h2 className="text-4xl font-bold text-white mb-4">{t.headline}</h2>
          <p className="text-gray-400 text-sm">{t.sub}</p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {packages.map((p, i) => (
            <FadeIn key={p.id} delay={i * 80}>
              <div className={`relative bg-[#0d1117] border p-7 h-full flex flex-col ${p.recommended ? "border-[#c9a84c]" : "border-white/10"}`}>
                {p.recommended && (
                  <span className="absolute -top-3 right-6 bg-[#c9a84c] text-black text-[9px] font-bold tracking-widest uppercase px-3 py-1">
                    {t.recommended}
                  </span>
                )}
                <h3 className="text-white font-bold text-base uppercase tracking-wide mb-1">{p.name}</h3>
                <p className="text-[#c9a84c] text-sm font-medium mb-5">{p.tagline[locale]}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.bullets[locale].slice(0, 2).map((b) => (
                    <li key={b} className="text-gray-400 text-xs flex items-start gap-2 leading-relaxed">
                      <span className="text-[#c9a84c] mt-0.5 shrink-0">▸</span>{b}
                    </li>
                  ))}
                </ul>
                <p className="text-white text-xl font-bold">
                  € {p.price},–<span className="text-gray-500 text-xs font-normal"> {t.perMonth}</span>
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="text-center">
          <Link href={`/produkte/${product.slug}#anfrage`} className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors mb-4">
            {t.cta}
          </Link>
          <p className="text-gray-600 text-xs">{t.note}</p>
        </div>
      </div>
    </section>
  );
}
