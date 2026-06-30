import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { getHeroLight } from "@/lib/settings";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Showreel from "@/components/home/Showreel";
import Partners from "@/components/home/Partners";
import Services from "@/components/home/Services";
import AboutUs from "@/components/home/AboutUs";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import Newsroom from "@/components/home/Newsroom";
import Footer from "@/components/home/Footer";
import CookieBanner from "@/components/home/CookieBanner";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/",
    locale: resolveLocale(searchParams),
    titleDe: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
    titleEn: "Ferrion IT Systems House — Infrastructure that endures.",
    descDe: "Ferrion IT Systemhaus Wien: Storage, Backup & Security, AI-Infrastruktur und Managed Services. Zertifizierter Partner von Huawei, Pure Storage und Commvault.",
    descEn: "Ferrion IT Systems House Vienna: storage, backup & security, AI infrastructure and managed services. Certified partner of Huawei, Pure Storage and Commvault.",
  });
}

export default async function HomePage({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  const heroLight = await getHeroLight();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <Hero locale={locale} light={heroLight} />
      <Showreel locale={locale} />
      <Partners locale={locale} />
      <Services locale={locale} />
      <AboutUs locale={locale} />
      <Testimonials locale={locale} />
      <Newsroom locale={locale} />
      <FAQ locale={locale} />
      <Footer locale={locale} />
      <CookieBanner locale={locale} />
    </div>
  );
}
