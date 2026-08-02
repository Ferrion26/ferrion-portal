import type { MetadataRoute } from "next";
import { SOLUTIONS } from "./loesungen/solutions-data";
import { PRODUCTS } from "./produkte/products-data";
import { allNewsSorted } from "./newsroom/news-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferrion.at";

// Fixed reference date for pages without a tracked change date (products,
// solutions, static pages) — bump this when their content actually changes.
// Using the real request time here would make every URL's lastmod "now" on
// every crawl, which defeats the purpose of the field for search engines.
const CONTENT_LAST_UPDATED = new Date("2026-08-02");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/produkte",
    "/managed-services",
    "/newsroom",
    "/kontakt",
    "/karriere",
    "/beratung",
    "/impressum",
    "/datenschutz",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const solutionRoutes = SOLUTIONS.map((s) => ({
    url: `${BASE}/loesungen/${s.slug}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const productRoutes = PRODUCTS.map((p) => ({
    url: `${BASE}/produkte/${p.slug}`,
    lastModified: CONTENT_LAST_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const newsRoutes = allNewsSorted().map((article) => ({
    url: `${BASE}${article.href}`,
    lastModified: new Date(article.iso),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...solutionRoutes, ...productRoutes, ...newsRoutes];
}
