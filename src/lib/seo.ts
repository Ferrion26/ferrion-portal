import type { Metadata } from "next";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { NEWS } from "@/app/newsroom/news-data";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferrion.at";
const BRAND = "Ferrion IT Systemhaus";

type SearchParams = { [key: string]: string | string[] | undefined } | undefined;

/**
 * Build a localized Metadata object with canonical + hreflang alternates.
 * English is exposed to crawlers at `<path>?lang=en`.
 */
export function pageMetadata(opts: {
  path: string;
  locale: Locale;
  titleDe: string;
  titleEn: string;
  descDe: string;
  descEn: string;
  type?: "website" | "article";
  publishedTime?: string;
  image?: string;
}): Metadata {
  const { path, locale } = opts;
  const isEn = locale === "en";
  const title = isEn ? opts.titleEn : opts.titleDe;
  const description = isEn ? opts.descEn : opts.descDe;
  const base = `${SITE_URL}${path}`;
  const canonical = isEn ? `${base}?lang=en` : base;
  const image = opts.image ?? "/images/hero.jpg";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "de-AT": base,
        en: `${base}?lang=en`,
        "x-default": base,
      },
    },
    openGraph: {
      type: opts.type ?? "website",
      url: canonical,
      title,
      description,
      siteName: BRAND,
      locale: isEn ? "en_US" : "de_AT",
      images: [{ url: image }],
      ...(opts.type === "article" && opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Metadata for a newsroom article, sourced from the central news data. */
export function articleMetadata(slug: string, searchParams?: SearchParams): Metadata {
  const a = NEWS.find((n) => n.slug === slug);
  if (!a) return {};
  const locale = resolveLocale(searchParams);
  return pageMetadata({
    path: a.href,
    locale,
    titleDe: `${a.title.de} — ${BRAND}`,
    titleEn: `${a.title.en} — ${BRAND}`,
    descDe: a.excerpt.de,
    descEn: a.excerpt.en,
    type: "article",
    publishedTime: new Date(a.iso).toISOString(),
  });
}
