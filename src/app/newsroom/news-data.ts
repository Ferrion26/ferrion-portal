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
    slug: "vmware-migration-huawei-dcs",
    href: "/newsroom/vmware-migration-huawei-dcs",
    iso: "2026-06-09",
    date: { de: "9. Juni 2026", en: "June 9, 2026" },
    tag: "Virtualisierung",
    title: { de: "Von VMware zu Huawei DCS: Wie eine Migration wirklich abläuft — Woche für Woche", en: "From VMware to Huawei DCS: How a Migration Really Goes — Week by Week" },
    excerpt: {
      de: "Der ehrliche Ablaufplan für eine Mittelstands-Migration: von der Aufnahme in Woche 0 bis zum Rückbau in Woche 9 — inklusive der sechs Stellen, an denen es unangenehm wird.",
      en: "The honest week-by-week plan for a mid-market migration — from discovery in week 0 to decommissioning in week 9, including the six places where it gets uncomfortable.",
    },
  },
  {
    slug: "vmware-kosten-2026",
    href: "/newsroom/vmware-kosten-2026",
    iso: "2026-05-12",
    date: { de: "12. Mai 2026", en: "May 12, 2026" },
    tag: "Virtualisierung",
    title: { de: "VMware-Kosten 2026: Was der Broadcom-Wechsel den österreichischen Mittelstand wirklich kostet", en: "VMware Costs 2026: What the Broadcom Transition Really Costs Austrian Mid-Market Companies" },
    excerpt: {
      de: "Dokumentierte Preissteigerungen von 300 bis 1.500 Prozent, ein Lizenzmodell ohne Restwert — und ein zweites Datum neben dem Renewal, das die meisten Unternehmen noch nicht auf dem Schirm haben.",
      en: "Documented price increases of 300 to 1,500 percent, a licensing model with no residual value — and a second date beyond your renewal that most companies haven't factored in yet.",
    },
  },
  {
    slug: "vmware-vmsa-2026-0006",
    href: "/newsroom/vmware-vmsa-2026-0006",
    iso: "2026-07-30",
    date: { de: "30. Juli 2026", en: "July 30, 2026" },
    tag: "Security",
    title: { de: "VMSA-2026-0006: Kritische Lücken in VMware ESX, vCenter, Workstation und Fusion", en: "VMSA-2026-0006: Critical Vulnerabilities in VMware ESX, vCenter, Workstation and Fusion" },
    excerpt: {
      de: "Broadcom schließt fünf Schwachstellen, zwei davon mit CVSS 9,8 und ohne Workaround. vCenter Server ist ohne Anmeldedaten aus dem Netz angreifbar — Updates sollten prioritär eingespielt werden.",
      en: "Broadcom patches five vulnerabilities, two rated CVSS 9.8 with no workaround. vCenter Server is exploitable over the network without credentials — updates should be applied as a priority.",
    },
  },
  {
    slug: "cosmosescape-azure-masterkey",
    href: "/newsroom/cosmosescape-azure-masterkey",
    iso: "2026-07-31",
    date: { de: "31. Juli 2026", en: "July 31, 2026" },
    tag: "Security",
    title: { de: "CosmosEscape: Wie ein „Master Key“ Zugriff auf sämtliche Azure-Cosmos-DB-Datenbanken ermöglichte", en: "CosmosEscape: How a “Master Key” Enabled Access to Every Azure Cosmos DB Database" },
    excerpt: {
      de: "Wiz-Forscher fanden einen plattformweiten Master Key in Azure Cosmos DB — theoretisch Vollzugriff auf jede Datenbank über Mandanten und Regionen hinweg. Microsoft reagierte binnen 48 Stunden.",
      en: "Wiz researchers found a platform-wide master key in Azure Cosmos DB — theoretically full access to every database across tenants and regions. Microsoft responded within 48 hours.",
    },
  },
  {
    slug: "oceanprotect-dcig-top5",
    href: "/newsroom/oceanprotect-dcig-top5",
    iso: "2026-07-16",
    date: { de: "16. Juli 2026", en: "July 16, 2026" },
    tag: "Huawei",
    title: { de: "Huawei OceanProtect unter den DCIG TOP 5 Cyber Resilient PBBAs 2026–27", en: "Huawei OceanProtect Named Among the DCIG TOP 5 Cyber Resilient PBBAs 2026–27" },
    excerpt: {
      de: "DCIG prüfte über 250 Merkmale von 35 Backup-Appliances — OceanProtect X9000 und X6000 belegen jeweils Platz 1 in ihrer Kategorie für Recovery-Performance und Kosteneffizienz.",
      en: "DCIG evaluated over 250 features across 35 backup appliances — OceanProtect X9000 and X6000 each rank #1 in their category for recovery performance and cost-effectiveness.",
    },
  },
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
