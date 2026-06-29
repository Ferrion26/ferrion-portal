import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import Partners from "@/components/home/Partners";
import Services from "@/components/home/Services";
import Newsroom from "@/components/home/Newsroom";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "Ferrion IT Systemhaus — Technologie, die verbindet.",
  description:
    "Ferrion IT Systemhaus: Cloud & Virtualisierung, Storage, Backup & Security und Managed Services für Ihr Unternehmen.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header />
      <Hero />
      <Partners />
      <Services />
      <Newsroom />
      <Footer />
    </div>
  );
}
