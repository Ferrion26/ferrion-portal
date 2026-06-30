"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { type NewsArticle } from "./news-data";

const L = {
  de: {
    eyebrow: "Newsroom",
    headline: "Alle News & Fachartikel",
    sub: "Projektberichte, Technologie-Updates und Einblicke aus der Praxis.",
    search: "Artikel durchsuchen …",
    tech: "Technologie",
    year: "Jahr",
    all: "Alle",
    results: (n: number) => `${n} ${n === 1 ? "Artikel" : "Artikel"}`,
    none: "Keine Artikel gefunden.",
    noneHint: "Passen Sie Suche oder Filter an.",
    reset: "Filter zurücksetzen",
    read: "Artikel lesen →",
    back: "← Zur Startseite",
  },
  en: {
    eyebrow: "Newsroom",
    headline: "All News & Articles",
    sub: "Project reports, technology updates and insights from practice.",
    search: "Search articles …",
    tech: "Technology",
    year: "Year",
    all: "All",
    results: (n: number) => `${n} ${n === 1 ? "article" : "articles"}`,
    none: "No articles found.",
    noneHint: "Try adjusting your search or filters.",
    reset: "Reset filters",
    read: "Read article →",
    back: "← Back to home",
  },
};

export default function NewsroomIndex({
  locale,
  articles,
  tags,
  years,
}: {
  locale: Locale;
  articles: NewsArticle[];
  tags: string[];
  years: number[];
}) {
  const t = L[locale];
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (tag && a.tag !== tag) return false;
      if (year && Number(a.iso.slice(0, 4)) !== year) return false;
      if (q) {
        const hay = `${a.title[locale]} ${a.excerpt[locale]} ${a.tag}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [articles, query, tag, year, locale]);

  const hasFilters = query || tag || year;

  function reset() {
    setQuery("");
    setTag(null);
    setYear(null);
  }

  const chip = (active: boolean) =>
    `px-3.5 py-1.5 text-xs font-bold tracking-wide uppercase border transition-colors ${
      active
        ? "bg-[#c9a84c] text-black border-[#c9a84c]"
        : "text-gray-400 border-white/15 hover:border-white/35 hover:text-white"
    }`;

  return (
    <main className="pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-6 block">
            {t.back}
          </Link>
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-[#c9a84c]" />
            {t.eyebrow}
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{t.headline}</h1>
          <p className="text-gray-400 text-sm max-w-xl">{t.sub}</p>
        </div>

        {/* Controls */}
        <div className="bg-[#111827] border border-white/10 p-6 mb-8">
          {/* Search */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search}
              className="w-full bg-[#0d1117] border border-white/10 text-white text-sm pl-10 pr-4 py-3 placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none transition-colors"
            />
          </div>

          {/* Tag filter */}
          <div className="mb-4">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">{t.tech}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTag(null)} className={chip(tag === null)}>{t.all}</button>
              {tags.map((tg) => (
                <button key={tg} onClick={() => setTag(tg)} className={chip(tag === tg)}>{tg}</button>
              ))}
            </div>
          </div>

          {/* Year filter */}
          <div>
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">{t.year}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setYear(null)} className={chip(year === null)}>{t.all}</button>
              {years.map((y) => (
                <button key={y} onClick={() => setYear(y)} className={chip(year === y)}>{y}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-xs tracking-wide">{t.results(filtered.length)}</p>
          {hasFilters && (
            <button onClick={reset} className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline">
              {t.reset}
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <Link key={a.slug} href={a.href}>
                <article className="bg-[#111820] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors group cursor-pointer h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">{a.date[locale]}</span>
                    <span className="text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{a.tag}</span>
                  </div>
                  <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#c9a84c] transition-colors mb-3">
                    {a.title[locale]}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">{a.excerpt[locale]}</p>
                  <p className="text-[#c9a84c] text-[10px] tracking-widest uppercase">{t.read}</p>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-white/5 bg-[#0d1117]">
            <p className="text-white font-bold text-lg mb-2">{t.none}</p>
            <p className="text-gray-500 text-sm mb-6">{t.noneHint}</p>
            <button onClick={reset} className="inline-block border border-[#c9a84c] text-[#c9a84c] text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#c9a84c] hover:text-black transition-colors">
              {t.reset}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
