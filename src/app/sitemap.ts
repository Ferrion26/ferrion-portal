import type { MetadataRoute } from "next";
import { SOLUTIONS } from "./loesungen/solutions-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferrion.at";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/kontakt",
    "/karriere",
    "/beratung",
    "/impressum",
    "/datenschutz",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const solutionRoutes = SOLUTIONS.map((s) => ({
    url: `${BASE}/loesungen/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const newsRoutes = [
    "/newsroom/citrix-netscaler-security-bulletin",
    "/newsroom/pure-storage-ki-plattform",
    "/newsroom/huawei-dorado-v7",
    "/newsroom/pure-storage-migration",
    "/newsroom/private-ai-klinik",
    "/newsroom/nis2-compliance-oesterreich",
    "/newsroom/fusioncompute-8-9-8-10",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...solutionRoutes, ...newsRoutes];
}
