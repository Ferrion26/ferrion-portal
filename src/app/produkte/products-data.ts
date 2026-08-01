// Central product catalog — single source of truth so additional
// products (and their Managed Services packages) can be added later
// without touching layout code. See /produkte (index) and
// /produkte/[slug] (detail).

type Bi = { de: string; en: string };

export type ManagedPackage = {
  id: "monitor" | "operate" | "complete";
  name: string; // brand name stays identical across locales, e.g. "Care Monitor"
  tagline: Bi;
  bullets: { de: string[]; en: string[] };
  price: string; // e.g. "1.890"
  recommended?: boolean;
};

export type ComparisonRow = {
  label: Bi;
  values: [string, string, string]; // Monitor / Operate / Complete
};

export type Product = {
  slug: string;
  status: "available" | "coming-soon";
  vendor: string;
  vendorLogo?: string;
  icon: string;
  eyebrow: Bi;
  name: string; // brand/product name, not translated
  tagline: Bi;
  intro: Bi;
  facts: { value: Bi; label: Bi }[];
  highlights: { title: Bi; desc: Bi; icon: string }[];
  relatedArticleSlugs: string[];
  managedServices?: {
    eyebrow: Bi;
    headline: Bi;
    intro: Bi;
    trustBadges: Bi[];
    packages: ManagedPackage[];
    comparisonLabel: Bi;
    comparison: ComparisonRow[];
    priceNote: Bi;
  };
};

export const PRODUCTS: Product[] = [
  {
    slug: "huawei-dcs",
    status: "available",
    vendor: "Huawei",
    vendorLogo: "/logos/huawei.svg",
    icon: "🗄",
    eyebrow: { de: "Produkt · Huawei Gold Partner", en: "Product · Huawei Gold Partner" },
    name: "Huawei DCS",
    tagline: {
      de: "Data Center Storage & Compute — der Unterbau, auf dem alles andere läuft.",
      en: "Data Center Storage & Compute — the foundation everything else runs on.",
    },
    intro: {
      de: "Huawei DCS bündelt die Data-Center-Infrastruktur von Huawei, mit der Ferrion arbeitet: All-Flash-Storage der OceanStor-Dorado-Serie, Server und Virtualisierung auf Basis von FusionCompute sowie Datensicherung mit OceanProtect. Als zertifizierter Huawei-Partner liefern, integrieren und betreiben wir diese Plattform für Sie — wahlweise als Projekt oder als laufender Managed Service.",
      en: "Huawei DCS brings together the Huawei data center infrastructure Ferrion works with: all-flash storage from the OceanStor Dorado series, servers and virtualisation built on FusionCompute, and data protection with OceanProtect. As a certified Huawei partner, we deliver, integrate and operate this platform for you — either as a project or as an ongoing managed service.",
    },
    facts: [
      { value: { de: "100 Mio.", en: "100M" }, label: { de: "IOPS (Dorado V7)", en: "IOPS (Dorado V7)" } },
      { value: { de: "0,03 ms", en: "0.03 ms" }, label: { de: "Latenz", en: "Latency" } },
      { value: { de: "bis 128", en: "up to 128" }, label: { de: "Controller", en: "Controllers" } },
      { value: { de: "99,99 %", en: "99.99%" }, label: { de: "Ransomware-Erkennung", en: "Ransomware detection" } },
    ],
    highlights: [
      {
        icon: "🗄",
        title: { de: "Storage — OceanStor Dorado", en: "Storage — OceanStor Dorado" },
        desc: {
          de: "All-Flash-Plattform für geschäftskritische Datenbanken, Virtualisierung und KI-Workloads, mit nativer Block-, File- und Object-Konvergenz.",
          en: "All-flash platform for business-critical databases, virtualisation and AI workloads, with native block, file and object convergence.",
        },
      },
      {
        icon: "🖥",
        title: { de: "Compute & Virtualisierung — FusionCompute", en: "Compute & Virtualisation — FusionCompute" },
        desc: {
          de: "Server und Hypervisor-Schicht für konsolidierte Workloads — von der Ressourcenzuteilung bis zum Disaster-Recovery-Flow.",
          en: "Server and hypervisor layer for consolidated workloads — from resource allocation to the disaster recovery flow.",
        },
      },
      {
        icon: "🛡",
        title: { de: "Datensicherung — OceanProtect", en: "Data Protection — OceanProtect" },
        desc: {
          de: "Cyber-resiliente Backup-Appliances mit Air-Gap-Isolation und KI-gestützter Bedrohungserkennung, DCIG-ausgezeichnet.",
          en: "Cyber-resilient backup appliances with air-gap isolation and AI-based threat detection, DCIG-recognised.",
        },
      },
    ],
    relatedArticleSlugs: ["huawei-dorado-v7", "fusioncompute-8-9-8-10", "oceanprotect-dcig-top5"],
    managedServices: {
      eyebrow: { de: "Managed Services", en: "Managed Services" },
      headline: { de: "Huawei DCS im Betrieb — drei Stufen, eine Umgebung", en: "Huawei DCS in Operation — Three Tiers, One Environment" },
      intro: {
        de: "Sie entscheiden, wie viel Betriebsverantwortung Sie abgeben möchten. Von der reinen Überwachung bis zur vollen Verfügbarkeitsgarantie — jede Stufe baut auf derselben Plattform auf und lässt sich jederzeit erweitern.",
        en: "You decide how much operational responsibility you want to hand over. From pure monitoring to full availability ownership — each tier builds on the same platform and can be upgraded at any time.",
      },
      trustBadges: [
        { de: "Transparente SLAs", en: "Transparent SLAs" },
        { de: "Österreichisches Service-Team", en: "Austria-based service team" },
        { de: "Skaliert mit Ihrem Wachstum", en: "Scales with your growth" },
      ],
      packages: [
        {
          id: "monitor",
          name: "Care Monitor",
          tagline: { de: "Sie behalten den Betrieb", en: "You keep operational control" },
          bullets: {
            de: ["Wir überwachen rund um die Uhr", "Störung wird analysiert und gemeldet", "Behebung durch Ihr IT-Team", "Quartalsbericht"],
            en: ["We monitor around the clock", "Incidents are analysed and reported", "Remediation by your own IT team", "Quarterly report"],
          },
          price: "1.890",
        },
        {
          id: "operate",
          name: "Care Operate",
          tagline: { de: "Wir übernehmen den Betrieb", en: "We take over day-to-day operations" },
          bullets: {
            de: ["Betrieb von Hardware, Netzwerk, DCS, Backup", "Störungen werden von uns behoben", "Patch- und Change-Management inklusive", "Monatsbericht, benannter Service Manager"],
            en: ["Operation of hardware, network, DCS, backup", "Incidents are resolved by us", "Patch and change management included", "Monthly report, named service manager"],
          },
          price: "3.290",
          recommended: true,
        },
        {
          id: "complete",
          name: "Care Complete",
          tagline: { de: "Wir verantworten die Verfügbarkeit", en: "We own availability end to end" },
          bullets: {
            de: ["Vollbetrieb bis einschließlich OS-Layer", "Rund-um-die-Uhr-Betreuung, 24×7×365", "Standard-Changes ohne Mengenbegrenzung", "Quartals-Review, DR-Test, Restore-Verifikation"],
            en: ["Full operation up to and including the OS layer", "Round-the-clock coverage, 24×7×365", "Unlimited standard changes", "Quarterly review, DR test, restore verification"],
          },
          price: "4.980",
        },
      ],
      comparisonLabel: { de: "Die drei Stufen im Vergleich", en: "The Three Tiers Compared" },
      comparison: [
        { label: { de: "Servicezeit", en: "Service hours" }, values: ["Mo–Fr 08–17", "Mo–Fr 07–19", "24×7×365"] },
        { label: { de: "Monitoring der Plattform", en: "Platform monitoring" }, values: ["24×7", "24×7", "24×7 + Rufbereitschaft"] },
        { label: { de: "Störungsbehebung", en: "Incident resolution" }, values: ["Analyse & Meldung", "Behebung", "Behebung inkl. Hersteller-Eskalation"] },
        { label: { de: "Hardware & Firmware", en: "Hardware & firmware" }, values: ["Health-Reporting", "2 Wartungsfenster p. a.", "4 Wartungsfenster p. a."] },
        { label: { de: "OS-Patching (VM-Layer)", en: "OS patching (VM layer)" }, values: ["nur Reporting", "monatlich, Ring-Modell", "monatlich + Notfall-Patches"] },
        { label: { de: "Virtualisierung (DCS)", en: "Virtualisation (DCS)" }, values: ["Monitoring", "Betrieb & Changes", "Vollbetrieb inkl. Ressourcen-Mgmt."] },
        { label: { de: "Backup (Commvault)", en: "Backup (Commvault)" }, values: ["Job-Monitoring", "+ Fehlerbehebung", "+ Restore-Test je Quartal"] },
        { label: { de: "Inkludierte Changes", en: "Included changes" }, values: ["2 / Quartal", "6 / Quartal", "Standard-Changes unbegrenzt"] },
        { label: { de: "Inkludierte Servicestunden", en: "Included service hours" }, values: ["4 h / Monat", "12 h / Monat", "24 h / Monat"] },
        { label: { de: "Reporting", en: "Reporting" }, values: ["Quartalsbericht", "Monatsbericht", "Monatsbericht + Quartals-Review"] },
        { label: { de: "Benannter Service Manager", en: "Named service manager" }, values: ["–", "ja", "ja, mit Quartals-Review"] },
        { label: { de: "DR-Test", en: "DR test" }, values: ["–", "–", "1× jährlich"] },
      ],
      priceNote: {
        de: "Alle Preise netto zzgl. USt., als Richtwert für eine mittelständische Infrastruktur. Ihr individuelles Angebot erstellen wir nach einem kurzen Umgebungs-Check.",
        en: "All prices net, excl. VAT, as a guideline for a mid-sized infrastructure. We prepare your individual quote after a short environment check.",
      },
    },
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug && p.status === "available");
}

// Placeholder entries to demonstrate the catalog scales to more vendors —
// shown as "coming soon" tiles on /produkte, no detail page yet.
export const UPCOMING_PRODUCTS: { name: string; vendor: string; icon: string }[] = [
  { name: "Pure Storage FlashArray", vendor: "Pure Storage", icon: "⚡" },
  { name: "Commvault Complete", vendor: "Commvault", icon: "🛡" },
];
