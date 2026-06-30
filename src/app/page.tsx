import { getLocale } from "@/lib/i18n";
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

export const metadata = {
  title: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
  description:
    "Ferrion IT Systemhaus Wien: Infrastruktur, Datenbank-Expertise und Managed Services. Partner von Huawei, Pure Storage und Commvault.",
};

export default function HomePage() {
  const locale = getLocale();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <Hero locale={locale} />
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
