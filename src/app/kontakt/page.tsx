import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import KontaktClient from "./KontaktClient";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/kontakt",
    locale: resolveLocale(searchParams),
    titleDe: "Kontakt — Ferrion IT Systemhaus",
    titleEn: "Contact — Ferrion IT Systems House",
    descDe: "Nehmen Sie Kontakt mit Ferrion auf. IT-Systemhaus Wien — Beratung, Infrastruktur, Managed Services.",
    descEn: "Get in touch with Ferrion. IT systems house Vienna — consulting, infrastructure, managed services.",
  });
}

export default function KontaktPage({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <KontaktClient locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
