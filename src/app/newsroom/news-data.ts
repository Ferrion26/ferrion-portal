export type NewsArticle = {
  slug: string;
  href: string;
  iso: string; // YYYY-MM-DD, for sorting & year filter
  date: { de: string; en: string };
  tag: string;
  title: { de: string; en: string };
  excerpt: { de: string; en: string };
};

// Single source of truth for all newsroom articles.
export const NEWS: NewsArticle[] = [
  {
    slug: "citrix-netscaler-security-bulletin",
    href: "/newsroom/citrix-netscaler-security-bulletin",
    iso: "2026-06-30",
    date: { de: "30. Juni 2026", en: "June 30, 2026" },
    tag: "Security",
    title: { de: "Citrix Security Bulletin: Sechs Schwachstellen in NetScaler ADC & Gateway (CTX696604)", en: "Citrix Security Bulletin: Six Vulnerabilities in NetScaler ADC & Gateway (CTX696604)" },
    excerpt: {
      de: "Cloud Software Group adressiert sechs CVEs (CVSS bis 8,8) in NetScaler ADC & Gateway — von DoS bis unauthentifiziertem File Read. Updates stehen bereit; Betreiber sollten zeitnah patchen.",
      en: "Cloud Software Group addresses six CVEs (CVSS up to 8.8) in NetScaler ADC & Gateway — from DoS to unauthenticated file read. Updates are available; operators should patch promptly.",
    },
  },
  {
    slug: "pure-storage-ki-plattform",
    href: "/newsroom/pure-storage-ki-plattform",
    iso: "2025-10-01",
    date: { de: "1. Oktober 2025", en: "October 1, 2025" },
    tag: "Pure Storage",
    title: { de: "Pure Storage: Die Plattform für das KI-Zeitalter", en: "Pure Storage: The Platform for the AI Era" },
    excerpt: {
      de: "Next-Gen FlashArray//XL & //ST, Pure Fusion, Cloud Azure Native und Cyber Resilience — eine Plattform, die speziell für das KI-Zeitalter entwickelt wurde.",
      en: "Next-gen FlashArray//XL & //ST, Pure Fusion, Cloud Azure Native and cyber resilience — a platform built specifically for the AI era.",
    },
  },
  {
    slug: "huawei-dorado-v7",
    href: "/newsroom/huawei-dorado-v7",
    iso: "2025-10-01",
    date: { de: "1. Oktober 2025", en: "October 1, 2025" },
    tag: "Huawei",
    title: { de: "Huawei OceanStor Dorado V7: Die neue Benchmark für All-Flash-Storage in der KI-Ära", en: "Huawei OceanStor Dorado V7: The New Benchmark for All-Flash Storage in the AI Era" },
    excerpt: {
      de: "Bis zu 100 Mio. IOPS, 0,03 ms Latenz, native Block/File/Object-Konvergenz und KI-basierte Ransomware-Erkennung mit 99,99 %.",
      en: "Up to 100M IOPS, 0.03 ms latency, native block/file/object convergence and AI-based ransomware detection at 99.99%.",
    },
  },
  {
    slug: "pure-storage-migration",
    href: "/newsroom/pure-storage-migration",
    iso: "2024-03-22",
    date: { de: "22. März 2024", en: "March 22, 2024" },
    tag: "Storage",
    title: { de: "500 TB in 68 Stunden: Zero-Downtime-Migration auf Pure Storage FlashArray", en: "500 TB in 68 Hours: Zero-Downtime Migration to Pure Storage FlashArray" },
    excerpt: {
      de: "Wie wir bei Alpin Logistik 500 TB ohne eine einzige Minute ungeplante Downtime migriert und die SQL-Performance um Faktor 15,7 verbessert haben.",
      en: "How we migrated 500 TB for Alpin Logistik without a single minute of unplanned downtime and improved SQL performance by a factor of 15.7.",
    },
  },
  {
    slug: "private-ai-klinik",
    href: "/newsroom/private-ai-klinik",
    iso: "2024-04-30",
    date: { de: "30. April 2024", en: "April 30, 2024" },
    tag: "AI",
    title: { de: "Private AI Cluster für Klinikgruppe: NVIDIA GPU On-Premise statt Cloud", en: "Private AI Cluster for Hospital Group: NVIDIA GPU On-Premise instead of Cloud" },
    excerpt: {
      de: "32× NVIDIA H100 on-premise für die medizinische Bildanalyse — datenschutzkonform, mit 280 ms Inferenz-Latenz und Deployment in 6 Wochen.",
      en: "32× NVIDIA H100 on-premise for medical image analysis — privacy-compliant, with 280 ms inference latency and deployment in 6 weeks.",
    },
  },
  {
    slug: "nis2-compliance-oesterreich",
    href: "/newsroom/nis2-compliance-oesterreich",
    iso: "2024-05-06",
    date: { de: "6. Mai 2024", en: "May 6, 2024" },
    tag: "Backup & Security",
    title: { de: "NIS2-Compliance in 10 Wochen: Von der Risikoanalyse bis zum Audit", en: "NIS2 Compliance in 10 Weeks: From Risk Analysis to Passed Audit" },
    excerpt: {
      de: "Wie ein Industrieunternehmen in 10 Wochen audit-ready wurde — Immutable Backups, Incident-Response-Plan und ein bestandener Audit ohne Beanstandung.",
      en: "How an industrial company became audit-ready in 10 weeks — immutable backups, incident response plan and a passed audit without findings.",
    },
  },
  {
    slug: "fusioncompute-8-9-8-10",
    href: "/newsroom/fusioncompute-8-9-8-10",
    iso: "2024-05-15",
    date: { de: "15. Mai 2024", en: "May 15, 2024" },
    tag: "Huawei",
    title: { de: "FusionCompute 8.9 & 8.10: Neuerungen im Überblick", en: "FusionCompute 8.9 & 8.10: Key Updates Overview" },
    excerpt: {
      de: "Die wichtigsten Neuerungen der FusionCompute-Versionen 8.9 und 8.10 — Backup-Flow, Disaster Recovery und Performance im Überblick.",
      en: "The key updates in FusionCompute versions 8.9 and 8.10 — backup flow, disaster recovery and performance at a glance.",
    },
  },
];

/** Newest first. */
export function allNewsSorted(): NewsArticle[] {
  return [...NEWS].sort((a, b) => b.iso.localeCompare(a.iso));
}

/** Pick specific articles by slug, preserving the given order. */
export function newsBySlugs(slugs: string[]): NewsArticle[] {
  return slugs
    .map((s) => NEWS.find((n) => n.slug === s))
    .filter((n): n is NewsArticle => Boolean(n));
}

/** Distinct tags, sorted alphabetically. */
export function allTags(): string[] {
  return Array.from(new Set(NEWS.map((n) => n.tag))).sort();
}

/** Distinct years (from iso), newest first. */
export function allYears(): number[] {
  return Array.from(new Set(NEWS.map((n) => Number(n.iso.slice(0, 4))))).sort((a, b) => b - a);
}
