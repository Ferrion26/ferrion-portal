import { getLocale } from "@/lib/i18n";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Partners from "@/components/home/Partners";
import Services from "@/components/home/Services";
import AboutUs from "@/components/home/AboutUs";
import Newsroom from "@/components/home/Newsroom";
import Footer from "@/components/home/Footer";

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
      <Partners locale={locale} />
      <Services locale={locale} />
      <AboutUs locale={locale} />
      <Newsroom locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
