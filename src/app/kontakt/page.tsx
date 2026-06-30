import { cookies } from "next/headers";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import KontaktClient from "./KontaktClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kontakt — Ferrion IT Systemhaus",
  description: "Nehmen Sie Kontakt mit Ferrion auf. IT-Systemhaus Wien — Beratung, Infrastruktur, Managed Services.",
};

export default function KontaktPage() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <KontaktClient locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
