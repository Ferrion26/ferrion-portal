import { type Locale } from "@/lib/i18n/translations";
import { NEWS } from "@/app/newsroom/news-data";
import { SITE_URL } from "@/lib/seo";

/** NewsArticle + BreadcrumbList structured data for a newsroom article. */
export default function ArticleJsonLd({ slug, locale }: { slug: string; locale: Locale }) {
  const a = NEWS.find((n) => n.slug === slug);
  if (!a) return null;

  const url = `${SITE_URL}${a.href}`;
  const iso = new Date(a.iso).toISOString();
  const lang = locale === "en" ? "en" : "de-AT";
  const publisher = {
    "@type": "Organization",
    name: "Ferrion IT Systemhaus",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logos/ferrion.svg` },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title[locale],
    description: a.excerpt[locale],
    datePublished: iso,
    dateModified: iso,
    inLanguage: lang,
    image: [`${SITE_URL}/images/hero.jpg`],
    author: { "@type": "Organization", name: "Ferrion IT Systemhaus", url: SITE_URL },
    publisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: a.tag,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "en" ? "Home" : "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Newsroom", item: `${SITE_URL}/newsroom` },
      { "@type": "ListItem", position: 3, name: a.title[locale], item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
