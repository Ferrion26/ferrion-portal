import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import NewsroomIndex from "./NewsroomIndex";
import { allNewsSorted, allTags, allYears } from "./news-data";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/newsroom",
    locale: resolveLocale(searchParams),
    titleDe: "Newsroom — Ferrion IT Systemhaus",
    titleEn: "Newsroom — Ferrion IT Systems House",
    descDe: "Alle News, Fachartikel und Projektberichte von Ferrion — durchsuchbar und filterbar nach Technologie und Jahr.",
    descEn: "All news, technical articles and project reports from Ferrion — searchable and filterable by technology and year.",
  });
}

export default function NewsroomPage({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);

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
