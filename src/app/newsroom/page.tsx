import { cookies } from "next/headers";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import NewsroomIndex from "./NewsroomIndex";
import { allNewsSorted, allTags, allYears } from "./news-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsroom — Ferrion IT Systemhaus",
  description: "Alle News, Fachartikel und Projektberichte von Ferrion — durchsuchbar und filterbar nach Technologie und Jahr.",
};

export default function NewsroomPage() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <NewsroomIndex
        locale={locale}
        articles={allNewsSorted()}
        tags={allTags()}
        years={allYears()}
      />
      <Footer locale={locale} />
    </div>
  );
}
