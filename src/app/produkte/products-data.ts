// Central product catalog — single source of truth so additional
// products (and their Managed Services packages) can be added later
// without touching layout code. See /produkte (index) and
// /produkte/[slug] (detail).
//
// Structure follows the vendor-style category navigation Huawei itself
// uses (category list → sub-group → product), so Ferrion's catalog reads
// the same way a manufacturer's own product finder does. A product can
// appear in more than one category (e.g. OceanStor Dorado is both a
// Data-Storage product and part of the AI Data Platform), so `categoryIds`
// is an array.

type Bi = { de: string; en: string };

export type Category = { id: string; label: Bi };

export const CATEGORIES: Category[] = [
  { id: "data-storage", label: { de: "Data Storage", en: "Data Storage" } },
  { id: "security", label: { de: "Security", en: "Security" } },
  { id: "server", label: { de: "Serverlösungen", en: "Server Solutions" } },
  { id: "ai-data-platform", label: { de: "AI Data Platform", en: "AI Data Platform" } },
  { id: "backup-recovery", label: { de: "Backup & Recovery", en: "Backup & Recovery" } },
  { id: "virtualization", label: { de: "Virtualization", en: "Virtualization" } },
  { id: "ai-data-intelligence", label: { de: "AI & Data Intelligence", en: "AI & Data Intelligence" } },
];

export type ManagedPackage = {
  id: "monitor" | "operate" | "complete";
  name: string; // brand name stays identical across locales, e.g. "Care Monitor"
  tagline: Bi;
  bullets: { de: string[]; en: string[] };
  recommended?: boolean;
};

export type ComparisonRow = {
  label: Bi;
  values: [string, string, string]; // Monitor / Operate / Complete
};

export type Product = {
  slug: string;
  status: "available" | "coming-soon";
  categoryIds: string[];
  subgroup?: Bi; // optional sub-heading within a category panel, e.g. "All-Flash Storage"
  vendor: string;
  vendorLogo?: string;
  heroImage?: string;
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
    note: Bi;
  };
};

export const PRODUCTS: Product[] = [
  // ── Data Storage / AI Data Platform ────────────────────────────────
  {
    slug: "oceanstor-dorado",
    status: "available",
    categoryIds: ["data-storage", "ai-data-platform"],
    subgroup: { de: "All-Flash Storage", en: "All-Flash Storage" },
    vendor: "Huawei",
    vendorLogo: "/logos/Huawei_Standard_logo.svg.png",
    heroImage: "/images/Hero Visual/HWE_Storage.png",
    icon: "🗄️",
    eyebrow: { de: "Produkt · Huawei Gold Partner", en: "Product · Huawei Gold Partner" },
    name: "OceanStor Dorado",
    tagline: {
      de: "All-Flash-Storage für geschäftskritische Datenbanken und KI-Workloads.",
      en: "All-flash storage for business-critical databases and AI workloads.",
    },
    intro: {
      de: "Die OceanStor-Dorado-Serie ist Huaweis All-Flash-Plattform für Umgebungen, in denen Latenz und Verfügbarkeit direkt den Geschäftserfolg beeinflussen. Native Block-, File- und Object-Konvergenz, integrierte Ransomware-Erkennung und bis zu 128 Controller im Scale-out-Verbund machen sie zur Storage-Basis, auf der Ferrion Datenbank- und KI-Projekte aufbaut.",
      en: "The OceanStor Dorado series is Huawei's all-flash platform for environments where latency and availability directly affect business outcomes. Native block, file and object convergence, built-in ransomware detection and up to 128 controllers in a scale-out cluster make it the storage foundation Ferrion builds database and AI projects on.",
    },
    facts: [
      { value: { de: "100 Mio.", en: "100M" }, label: { de: "IOPS", en: "IOPS" } },
      { value: { de: "0,03 ms", en: "0.03 ms" }, label: { de: "Latenz", en: "Latency" } },
      { value: { de: "bis 128", en: "up to 128" }, label: { de: "Controller", en: "Controllers" } },
      { value: { de: "99,99 %", en: "99.99%" }, label: { de: "Ransomware-Erkennung", en: "Ransomware detection" } },
    ],
    highlights: [
      { icon: "⚡", title: { de: "Konstant niedrige Latenz", en: "Consistently low latency" }, desc: { de: "FlashLink-Architektur hält die Antwortzeiten auch unter Volllast im Mikrosekundenbereich.", en: "FlashLink architecture keeps response times in the microsecond range even under full load." } },
      { icon: "🛡️", title: { de: "Eingebaute Cyber-Resilienz", en: "Built-in cyber resilience" }, desc: { de: "KI-gestützte Ransomware-Erkennung direkt im Storage-Controller, ohne separate Appliance.", en: "AI-based ransomware detection directly in the storage controller, no separate appliance required." } },
      { icon: "🔗", title: { de: "Konvergente Protokolle", en: "Converged protocols" }, desc: { de: "Block, File und Object auf derselben Plattform — weniger Silos, weniger Betriebsaufwand.", en: "Block, file and object on the same platform — fewer silos, less operational overhead." } },
    ],
    relatedArticleSlugs: ["huawei-dorado-v7"],
  },
  {
    slug: "oceanstor-hybrid-flash",
    status: "available",
    categoryIds: ["data-storage", "ai-data-platform"],
    subgroup: { de: "Hybrid Flash Storage", en: "Hybrid Flash Storage" },
    vendor: "Huawei",
    vendorLogo: "/logos/Huawei_Standard_logo.svg.png",
    icon: "💽",
    eyebrow: { de: "Produkt · Huawei Gold Partner", en: "Product · Huawei Gold Partner" },
    name: "OceanStor Hybrid Flash Storage",
    tagline: {
      de: "Kosteneffiziente Hybrid-Speicherung für Workloads mit gemischten Performance-Anforderungen.",
      en: "Cost-efficient hybrid storage for workloads with mixed performance needs.",
    },
    intro: {
      de: "Beispiel-Content: Die Hybrid-Flash-Serie kombiniert SSD- und Festplattenspeicher in einem System und eignet sich für Umgebungen, in denen nicht jeder Workload Vollflash-Performance benötigt — etwa Fileservices, Archivierung oder sekundäre Kopien. Ferrion dimensioniert die passende Konfiguration nach Ihrem tatsächlichen I/O-Profil.",
      en: "Example content: The Hybrid Flash series combines SSD and HDD storage in one system, suited to environments where not every workload needs full-flash performance — such as file services, archiving or secondary copies. Ferrion sizes the right configuration based on your actual I/O profile.",
    },
    facts: [
      { value: { de: "bis 3 PB", en: "up to 3 PB" }, label: { de: "Kapazität pro System", en: "Capacity per system" } },
      { value: { de: "Tiering", en: "Tiering" }, label: { de: "Automatisches Datentiering", en: "Automatic data tiering" } },
      { value: { de: "SAN & NAS", en: "SAN & NAS" }, label: { de: "Unterstützte Protokolle", en: "Supported protocols" } },
      { value: { de: "aktiv-aktiv", en: "active-active" }, label: { de: "Hochverfügbarkeit", en: "High availability" } },
    ],
    highlights: [
      { icon: "💰", title: { de: "Wirtschaftlich skalieren", en: "Scale economically" }, desc: { de: "SSD-Tier für heiße Daten, HDD-Tier für Kapazität — automatisch verwaltet.", en: "SSD tier for hot data, HDD tier for capacity — automatically managed." } },
      { icon: "🗂", title: { de: "Für Fileservices geeignet", en: "Built for file services" }, desc: { de: "Skalierbares NAS für Abteilungslaufwerke, Home-Verzeichnisse und Archive.", en: "Scalable NAS for department shares, home directories and archives." } },
      { icon: "🔁", title: { de: "Nahtlose Migration", en: "Seamless migration" }, desc: { de: "Lässt sich mit bestehenden Dorado-Systemen im selben Verbund betreiben.", en: "Can run alongside existing Dorado systems in the same cluster." } },
    ],
    relatedArticleSlugs: [],
  },
  {
    slug: "everpure-storage-platform",
    status: "available",
    categoryIds: ["data-storage", "ai-data-platform"],
    subgroup: { de: "All-Flash Storage", en: "All-Flash Storage" },
    vendor: "Everpure",
    vendorLogo: "/logos/Pure Storage Bug Orange_undefined.PNG",
    heroImage: "/images/Hero Visual/Storage_Infrastruktur_Pure.png",
    icon: "🌊",
    eyebrow: { de: "Produkt · Elite Partner", en: "Product · Elite Partner" },
    name: "Everpure Storage Platform",
    tagline: {
      de: "All-Flash-Storage von Everpure (vormals Pure Storage) — FlashArray für latenzkritische Workloads.",
      en: "All-flash storage from Everpure (formerly Pure Storage) — FlashArray for latency-critical workloads.",
    },
    intro: {
      de: "Pure Storage firmiert seit Februar 2026 als Everpure — Produkte, Zertifizierungen und die Partnerschaft mit Ferrion bestehen unverändert fort. Die FlashArray-Plattform bleibt technisch dieselbe: non-disruptive Upgrades über Pure//Fusion, das Evergreen-Modell für kostenfreie Controller-Upgrades sowie hohe Datenreduktion machen sie zur Basis für latenzkritische Datenbanken und Virtualisierung.",
      en: "Pure Storage has traded as Everpure since February 2026 — products, certifications and the partnership with Ferrion continue unchanged. The FlashArray platform remains technically the same: non-disruptive upgrades via Pure//Fusion, the Evergreen model for free controller upgrades, and high data reduction make it the foundation for latency-critical databases and virtualisation.",
    },
    facts: [
      { value: { de: "4:1", en: "4:1" }, label: { de: "Datenreduktion", en: "Data reduction" } },
      { value: { de: "3 Jahre", en: "3 years" }, label: { de: "Evergreen-Controller-Upgrade", en: "Evergreen controller upgrade" } },
      { value: { de: "0", en: "0" }, label: { de: "Downtime bei Upgrades", en: "Downtime for upgrades" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Weitere Kennzahl folgt", en: "Further metric to follow" } },
    ],
    highlights: [
      { icon: "🔁", title: { de: "Pure//Fusion", en: "Pure//Fusion" }, desc: { de: "Non-disruptive Upgrades und Controller-Wechsel ohne Downtime im laufenden Betrieb.", en: "Non-disruptive upgrades and controller changes without downtime during operation." } },
      { icon: "🌱", title: { de: "Evergreen-Modell", en: "Evergreen model" }, desc: { de: "Kostenfreie Controller-Upgrades alle 3 Jahre — eliminiert zukünftige Migrationsrisiken.", en: "Free controller upgrades every 3 years — eliminates future migration risk." } },
      { icon: "🗜", title: { de: "Hohe Datenreduktion", en: "High data reduction" }, desc: { de: "Compression & Deduplizierung erreichen in der Praxis Reduktionsfaktoren von 4:1 und mehr.", en: "Compression & deduplication achieve real-world reduction ratios of 4:1 and higher." } },
    ],
    relatedArticleSlugs: ["pure-storage-migration", "pure-storage-ki-plattform"],
  },
  {
    slug: "data-lakes",
    status: "available",
    categoryIds: ["ai-data-platform"],
    vendor: "Huawei",
    vendorLogo: "/logos/Huawei_Standard_logo.svg.png",
    icon: "🌐",
    eyebrow: { de: "Produkt · Beispiel-Content", en: "Product · Example content" },
    name: "Data Lakes",
    tagline: {
      de: "Beispiel-Content: Zentrale Datenhaltung als Grundlage für Analytics und KI-Training.",
      en: "Example content: Centralised data storage as the foundation for analytics and AI training.",
    },
    intro: {
      de: "Beispiel-Content: Ein Data Lake bündelt strukturierte und unstrukturierte Daten aus verschiedenen Quellsystemen in einem durchsuchbaren, skalierbaren Object-Storage — die Basis, auf der KI-Trainingsdaten und Analytics-Pipelines aufsetzen. Details zu Ferrions konkretem Angebot folgen.",
      en: "Example content: A data lake consolidates structured and unstructured data from various source systems into a searchable, scalable object store — the foundation AI training data and analytics pipelines build on. Details on Ferrion's concrete offering will follow.",
    },
    facts: [
      { value: { de: "S3-kompatibel", en: "S3-compatible" }, label: { de: "Object-Storage-API", en: "Object storage API" } },
      { value: { de: "Skalierbar", en: "Scalable" }, label: { de: "Kapazität", en: "Capacity" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "🌐", title: { de: "Ein Ort für alle Daten", en: "One place for all data" }, desc: { de: "Konsolidiert Quellsysteme statt Daten in Silos zu duplizieren.", en: "Consolidates source systems instead of duplicating data across silos." } },
      { icon: "🤖", title: { de: "KI-Trainingsdaten", en: "AI training data" }, desc: { de: "Grundlage für Modelltraining und Retrieval-Augmented-Generation-Szenarien.", en: "Foundation for model training and retrieval-augmented generation scenarios." } },
      { icon: "🔒", title: { de: "Governance eingebaut", en: "Governance built in" }, desc: { de: "Zugriffskontrolle und Klassifizierung auf Datenebene, nicht nachträglich aufgesetzt.", en: "Access control and classification at the data level, not bolted on afterwards." } },
    ],
    relatedArticleSlugs: [],
  },

  // ── Security ─────────────────────────────────────────────────────
  {
    slug: "fudo",
    status: "available",
    categoryIds: ["security"],
    vendor: "Fudo Security",
    vendorLogo: "/logos/fudo-mark.png",
    icon: "🔑",
    eyebrow: { de: "Produkt · Fudo Registered Partner", en: "Product · Fudo Registered Partner" },
    name: "Fudo",
    tagline: {
      de: "Beispiel-Content: Privileged Access Management für kontrollierten administrativen Zugriff.",
      en: "Example content: Privileged access management for controlled administrative access.",
    },
    intro: {
      de: "Beispiel-Content: Fudo überwacht, protokolliert und kontrolliert privilegierte Sitzungen von Admins, Dienstleistern und externen Partnern in Echtzeit — inklusive Session-Recording und Anomalieerkennung. Ferrions konkretes Leistungspaket rund um Fudo wird hier ergänzt, sobald es final ist.",
      en: "Example content: Fudo monitors, logs and controls privileged sessions from admins, service providers and external partners in real time — including session recording and anomaly detection. Ferrion's concrete service package around Fudo will be added here once finalised.",
    },
    facts: [
      { value: { de: "Echtzeit", en: "Real-time" }, label: { de: "Session-Monitoring", en: "Session monitoring" } },
      { value: { de: "Video", en: "Video" }, label: { de: "Session-Recording", en: "Session recording" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "👁", title: { de: "Volle Sitzungstransparenz", en: "Full session visibility" }, desc: { de: "Jede privilegierte Sitzung wird aufgezeichnet und ist im Nachhinein auditierbar.", en: "Every privileged session is recorded and auditable after the fact." } },
      { icon: "⏱", title: { de: "Just-in-Time-Zugriff", en: "Just-in-time access" }, desc: { de: "Zeitlich befristete Freigaben statt dauerhaft bestehender Admin-Rechte.", en: "Time-limited approvals instead of permanent admin rights." } },
      { icon: "🚨", title: { de: "Anomalieerkennung", en: "Anomaly detection" }, desc: { de: "Erkennt untypisches Verhalten in privilegierten Sitzungen automatisch.", en: "Automatically detects unusual behaviour in privileged sessions." } },
    ],
    relatedArticleSlugs: [],
  },
  {
    slug: "varonis",
    status: "available",
    categoryIds: ["security"],
    vendor: "Varonis",
    icon: "🕵",
    eyebrow: { de: "Produkt · Beispiel-Content", en: "Product · Example content" },
    name: "Varonis",
    tagline: {
      de: "Beispiel-Content: Data Security Platform für Transparenz über sensible Daten und Zugriffsrechte.",
      en: "Example content: Data security platform for visibility into sensitive data and access rights.",
    },
    intro: {
      de: "Beispiel-Content: Varonis analysiert, wo sensible Daten liegen, wer Zugriff darauf hat und wie dieser Zugriff tatsächlich genutzt wird — und meldet Abweichungen von normalem Verhalten automatisch. Details zum Ferrion-Leistungsumfang folgen.",
      en: "Example content: Varonis analyses where sensitive data lives, who has access to it and how that access is actually used — flagging deviations from normal behaviour automatically. Details on Ferrion's scope of service will follow.",
    },
    facts: [
      { value: { de: "Automatisch", en: "Automated" }, label: { de: "Daten-Klassifizierung", en: "Data classification" } },
      { value: { de: "In Echtzeit", en: "Real-time" }, label: { de: "Bedrohungserkennung", en: "Threat detection" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "🗂", title: { de: "Sensible Daten finden", en: "Find sensitive data" }, desc: { de: "Automatische Klassifizierung über Fileserver, NAS und Cloud-Speicher hinweg.", en: "Automatic classification across file servers, NAS and cloud storage." } },
      { icon: "🔐", title: { de: "Berechtigungen bereinigen", en: "Clean up permissions" }, desc: { de: "Zeigt überprivilegierte Zugriffe auf und hilft, sie systematisch abzubauen.", en: "Surfaces over-privileged access and helps reduce it systematically." } },
      { icon: "📈", title: { de: "Verhaltensbasierte Alarme", en: "Behaviour-based alerts" }, desc: { de: "Erkennt untypische Datenzugriffe, etwa vor einem Ransomware-Vorfall.", en: "Detects unusual data access patterns, e.g. ahead of a ransomware incident." } },
    ],
    relatedArticleSlugs: [],
  },

  // ── Server Solutions ────────────────────────────────────────────
  {
    slug: "dell-poweredge",
    status: "available",
    categoryIds: ["server"],
    vendor: "Dell Technologies",
    icon: "🖥",
    eyebrow: { de: "Produkt · Beispiel-Content", en: "Product · Example content" },
    name: "Dell PowerEdge",
    tagline: {
      de: "Beispiel-Content: Servergeneration für klassische Workloads bis hin zu GPU-beschleunigten Anwendungen.",
      en: "Example content: Server generation for classic workloads through to GPU-accelerated applications.",
    },
    intro: {
      de: "Beispiel-Content: Die PowerEdge-Serie deckt das Server-Portfolio von Standard-Rack-Systemen bis zu GPU-dichten Plattformen für AI-Training ab. Ferrion konfiguriert, liefert und integriert PowerEdge-Systeme in Ihre bestehende Storage- und Virtualisierungsumgebung.",
      en: "Example content: The PowerEdge series covers everything from standard rack servers to GPU-dense platforms for AI training. Ferrion configures, delivers and integrates PowerEdge systems into your existing storage and virtualisation environment.",
    },
    facts: [
      { value: { de: "Rack & Tower", en: "Rack & Tower" }, label: { de: "Formfaktoren", en: "Form factors" } },
      { value: { de: "GPU-fähig", en: "GPU-capable" }, label: { de: "AI-Workloads", en: "AI workloads" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "🖥", title: { de: "Für jeden Workload", en: "For every workload" }, desc: { de: "Von virtualisierten Standard-Workloads bis zu GPU-dichten AI-Trainingsservern.", en: "From standard virtualised workloads to GPU-dense AI training servers." } },
      { icon: "🔧", title: { de: "Lebenszyklus-Management", en: "Lifecycle management" }, desc: { de: "Firmware-, BIOS- und Health-Management über den gesamten Betriebszeitraum.", en: "Firmware, BIOS and health management across the entire operating lifetime." } },
      { icon: "🔗", title: { de: "Integriert in Ihre Umgebung", en: "Integrated into your environment" }, desc: { de: "Passt in bestehende OceanStor- und FusionCompute-Landschaften.", en: "Fits into existing OceanStor and FusionCompute landscapes." } },
    ],
    relatedArticleSlugs: [],
  },

  // ── Backup & Recovery ───────────────────────────────────────────
  {
    slug: "oceanprotect",
    status: "available",
    categoryIds: ["backup-recovery"],
    vendor: "Huawei",
    vendorLogo: "/logos/Huawei_Standard_logo.svg.png",
    icon: "🛡️",
    eyebrow: { de: "Produkt · Huawei Gold Partner", en: "Product · Huawei Gold Partner" },
    name: "OceanProtect",
    tagline: {
      de: "Cyber-resiliente Backup-Appliances mit Air-Gap-Isolation und KI-Bedrohungserkennung.",
      en: "Cyber-resilient backup appliances with air-gap isolation and AI threat detection.",
    },
    intro: {
      de: "OceanProtect ist Huaweis Backup-Appliance-Serie für Umgebungen, in denen Ransomware-Resilienz kein Nice-to-have mehr ist. Physische und logische Air-Gap-Isolation, KI-gestützte Anomalieerkennung auf Backup-Daten und eine 2026 von DCIG unter die Top 5 Cyber Resilient PBBAs gewählte Architektur bilden die Grundlage für eine belastbare Recovery-Strategie.",
      en: "OceanProtect is Huawei's backup appliance series for environments where ransomware resilience is no longer a nice-to-have. Physical and logical air-gap isolation, AI-based anomaly detection on backup data, and an architecture ranked among DCIG's Top 5 Cyber Resilient PBBAs for 2026 form the basis for a resilient recovery strategy.",
    },
    facts: [
      { value: { de: "99,99 %", en: "99.99%" }, label: { de: "Erkennungsgenauigkeit", en: "Detection accuracy" } },
      { value: { de: "200 TB/h", en: "200 TB/h" }, label: { de: "Durchsatz", en: "Throughput" } },
      { value: { de: "90:1", en: "90:1" }, label: { de: "Datenreduktion", en: "Data reduction" } },
      { value: { de: "Air-Gap", en: "Air-gap" }, label: { de: "Isolation", en: "Isolation" } },
    ],
    highlights: [
      { icon: "🔒", title: { de: "Physische & logische Isolation", en: "Physical & logical isolation" }, desc: { de: "Air-Gap-Kopien, die selbst bei kompromittierter Produktionsumgebung unerreichbar bleiben.", en: "Air-gapped copies that remain unreachable even if the production environment is compromised." } },
      { icon: "🤖", title: { de: "KI-gestützte Erkennung", en: "AI-based detection" }, desc: { de: "Erkennt Ransomware-Muster direkt in den Backup-Daten, nicht erst im Produktivsystem.", en: "Detects ransomware patterns directly in backup data, not only in the production system." } },
      { icon: "⚡", title: { de: "Schnelle Wiederherstellung", en: "Fast recovery" }, desc: { de: "Hoher Durchsatz sorgt für kurze Recovery-Zeiten auch bei großen Datenmengen.", en: "High throughput keeps recovery times short even for large data volumes." } },
    ],
    relatedArticleSlugs: ["oceanprotect-dcig-top5"],
  },
  {
    slug: "commvault",
    status: "available",
    categoryIds: ["backup-recovery"],
    vendor: "Commvault",
    vendorLogo: "/logos/commvault.svg",
    icon: "☁️",
    eyebrow: { de: "Produkt · Strategic Partner", en: "Product · Strategic Partner" },
    name: "Commvault",
    tagline: {
      de: "Datensicherung und -wiederherstellung für hybride Umgebungen, NIS2-ready.",
      en: "Data protection and recovery for hybrid environments, NIS2-ready.",
    },
    intro: {
      de: "Beispiel-Content: Commvault sichert physische, virtuelle, Cloud- und SaaS-Workloads über eine einheitliche Plattform ab und unterstützt Ferrion-Kunden dabei, die Nachweispflichten der NIS2-Richtlinie zu erfüllen — von Backup-Nachweisen bis zu dokumentierten Recovery-Tests. Details zum konkreten Ferrion-Leistungspaket folgen.",
      en: "Example content: Commvault protects physical, virtual, cloud and SaaS workloads through a unified platform and helps Ferrion customers meet NIS2 evidence requirements — from backup records to documented recovery tests. Details on Ferrion's concrete service package will follow.",
    },
    facts: [
      { value: { de: "Hybrid", en: "Hybrid" }, label: { de: "On-Prem & Cloud", en: "On-prem & cloud" } },
      { value: { de: "NIS2", en: "NIS2" }, label: { de: "Compliance-ready", en: "Compliance-ready" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "☁️", title: { de: "Eine Plattform, alle Workloads", en: "One platform, every workload" }, desc: { de: "Physisch, virtuell, Cloud und SaaS über eine zentrale Konsole gesichert.", en: "Physical, virtual, cloud and SaaS protected through a single console." } },
      { icon: "📋", title: { de: "NIS2-Nachweise", en: "NIS2 evidence" }, desc: { de: "Dokumentierte Restore-Tests und Reports, wie sie Audits verlangen.", en: "Documented restore tests and reports the way audits require them." } },
      { icon: "🔁", title: { de: "Getestete Recovery", en: "Tested recovery" }, desc: { de: "Regelmäßige Restore-Verifikation statt ungeprüfter Backup-Jobs.", en: "Regular restore verification instead of unverified backup jobs." } },
    ],
    relatedArticleSlugs: [],
  },

  // ── Virtualization ──────────────────────────────────────────────
  {
    slug: "huawei-dcs",
    status: "available",
    categoryIds: ["virtualization"],
    vendor: "Huawei",
    vendorLogo: "/logos/Huawei_Standard_logo.svg.png",
    icon: "🖥",
    eyebrow: { de: "Produkt · Huawei Gold Partner", en: "Product · Huawei Gold Partner" },
    name: "Huawei DCS",
    tagline: {
      de: "Datacenter Virtualization (DCS) — die Compute-Schicht auf Basis von FusionCompute.",
      en: "Datacenter Virtualization (DCS) — the compute layer built on FusionCompute.",
    },
    intro: {
      de: "Huawei DCS (Datacenter Virtualization) ist die Server- und Hypervisor-Schicht auf Basis von FusionCompute, die konsolidierte Workloads von der Ressourcenzuteilung bis zum Disaster-Recovery-Flow trägt. Als zertifizierter Huawei-Partner liefern, integrieren und betreiben wir DCS für Sie — im Zusammenspiel mit OceanStor-Storage und OceanProtect-Backup oder als eigenständiges Projekt.",
      en: "Huawei DCS (Datacenter Virtualization) is the server and hypervisor layer built on FusionCompute, carrying consolidated workloads from resource allocation through to the disaster recovery flow. As a certified Huawei partner, we deliver, integrate and operate DCS for you — alongside OceanStor storage and OceanProtect backup, or as a standalone project.",
    },
    facts: [
      { value: { de: "FusionCompute", en: "FusionCompute" }, label: { de: "Hypervisor", en: "Hypervisor" } },
      { value: { de: "Konsolidiert", en: "Consolidated" }, label: { de: "Ressourcennutzung", en: "Resource utilisation" } },
      { value: { de: "Integriert", en: "Integrated" }, label: { de: "DR-Orchestrierung", en: "DR orchestration" } },
      { value: { de: "99,99 %", en: "99.99%" }, label: { de: "Verfügbarkeit (mit OceanProtect)", en: "Availability (with OceanProtect)" } },
    ],
    highlights: [
      {
        icon: "🖥",
        title: { de: "Compute & Virtualisierung — FusionCompute", en: "Compute & Virtualisation — FusionCompute" },
        desc: {
          de: "Server und Hypervisor-Schicht für konsolidierte Workloads — von der Ressourcenzuteilung bis zum Disaster-Recovery-Flow.",
          en: "Server and hypervisor layer for consolidated workloads — from resource allocation to the disaster recovery flow.",
        },
      },
      {
        icon: "🗄️",
        title: { de: "Läuft auf OceanStor Dorado", en: "Runs on OceanStor Dorado" },
        desc: {
          de: "Abgestimmt auf Huaweis All-Flash-Storage für geschäftskritische Datenbanken und KI-Workloads.",
          en: "Tuned for Huawei's all-flash storage for business-critical databases and AI workloads.",
        },
      },
      {
        icon: "🛡️",
        title: { de: "Abgesichert mit OceanProtect", en: "Protected by OceanProtect" },
        desc: {
          de: "Cyber-resiliente Backup-Appliances mit Air-Gap-Isolation und KI-gestützter Bedrohungserkennung, DCIG-ausgezeichnet.",
          en: "Cyber-resilient backup appliances with air-gap isolation and AI-based threat detection, DCIG-recognised.",
        },
      },
    ],
    relatedArticleSlugs: ["fusioncompute-8-9-8-10", "huawei-dorado-v7", "oceanprotect-dcig-top5"],
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
        },
        {
          id: "operate",
          name: "Care Operate",
          tagline: { de: "Wir übernehmen den Betrieb", en: "We take over day-to-day operations" },
          bullets: {
            de: ["Betrieb von Hardware, Netzwerk, DCS, Backup", "Störungen werden von uns behoben", "Patch- und Change-Management inklusive", "Monatsbericht, benannter Service Manager"],
            en: ["Operation of hardware, network, DCS, backup", "Incidents are resolved by us", "Patch and change management included", "Monthly report, named service manager"],
          },
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
      note: {
        de: "Jede Stufe wird auf Ihre Umgebung zugeschnitten. Ihr individuelles Angebot erstellen wir nach einem kurzen, unverbindlichen Umgebungs-Check.",
        en: "Every tier is tailored to your environment. We prepare your individual, no-obligation quote after a short environment check.",
      },
    },
  },

  // ── AI & Data Intelligence ──────────────────────────────────────
  {
    slug: "dell-ai-factory",
    status: "available",
    categoryIds: ["ai-data-intelligence"],
    vendor: "Dell Technologies",
    icon: "🏭",
    eyebrow: { de: "Produkt · Beispiel-Content", en: "Product · Example content" },
    name: "Dell AI Factory",
    tagline: {
      de: "Beispiel-Content: Referenzarchitektur für den Aufbau privater KI-Infrastruktur.",
      en: "Example content: Reference architecture for building private AI infrastructure.",
    },
    intro: {
      de: "Beispiel-Content: Dell AI Factory bündelt Server, Storage, Netzwerk und Software zu einer abgestimmten Referenzarchitektur für Unternehmen, die KI-Workloads on-premises betreiben möchten, statt Daten in die Public Cloud zu geben. Details zum konkreten Ferrion-Angebot folgen.",
      en: "Example content: Dell AI Factory bundles server, storage, network and software into a coordinated reference architecture for organisations that want to run AI workloads on-premises rather than sending data to the public cloud. Details on Ferrion's concrete offering will follow.",
    },
    facts: [
      { value: { de: "On-Premises", en: "On-premises" }, label: { de: "Bereitstellung", en: "Deployment" } },
      { value: { de: "GPU-optimiert", en: "GPU-optimised" }, label: { de: "Compute", en: "Compute" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "🏭", title: { de: "Referenzarchitektur statt Bastellösung", en: "Reference architecture, not a DIY build" }, desc: { de: "Vorab abgestimmte Kombination aus Server, Storage, Netzwerk und Software.", en: "Pre-validated combination of server, storage, network and software." } },
      { icon: "🔒", title: { de: "Daten bleiben im Haus", en: "Data stays on-premises" }, desc: { de: "Private AI-Infrastruktur ohne Datenabfluss in die Public Cloud.", en: "Private AI infrastructure without data leaving for the public cloud." } },
      { icon: "📈", title: { de: "Skalierbar geplant", en: "Planned to scale" }, desc: { de: "Wächst von Pilotprojekten zu produktiven KI-Clustern.", en: "Grows from pilot projects to production AI clusters." } },
    ],
    relatedArticleSlugs: [],
  },
  {
    slug: "huawei-ai-appliances",
    status: "available",
    categoryIds: ["ai-data-intelligence"],
    vendor: "Huawei",
    vendorLogo: "/logos/Huawei_Standard_logo.svg.png",
    icon: "🤖",
    eyebrow: { de: "Produkt · Beispiel-Content", en: "Product · Example content" },
    name: "Huawei AI Appliances",
    tagline: {
      de: "Beispiel-Content: Vorkonfigurierte Appliances für KI-Inferenz und -Training.",
      en: "Example content: Pre-configured appliances for AI inference and training.",
    },
    intro: {
      de: "Beispiel-Content: Huaweis AI-Appliances liefern vorkonfigurierte Compute-, Storage- und Netzwerkbausteine für den schnellen Einstieg in produktive KI-Workloads — ohne monatelange Integrationsprojekte. Details zum konkreten Ferrion-Angebot folgen.",
      en: "Example content: Huawei's AI appliances provide pre-configured compute, storage and network building blocks for a fast start into production AI workloads — without months-long integration projects. Details on Ferrion's concrete offering will follow.",
    },
    facts: [
      { value: { de: "Vorkonfiguriert", en: "Pre-configured" }, label: { de: "Lieferzustand", en: "Delivery state" } },
      { value: { de: "Training & Inferenz", en: "Training & inference" }, label: { de: "Einsatzbereich", en: "Use case" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
      { value: { de: "n/a", en: "n/a" }, label: { de: "Kennzahl folgt", en: "Metric to follow" } },
    ],
    highlights: [
      { icon: "📦", title: { de: "Schneller Produktivstart", en: "Fast time to production" }, desc: { de: "Vorkonfigurierte Appliance statt monatelanger Integrationsprojekte.", en: "Pre-configured appliance instead of months-long integration projects." } },
      { icon: "🤖", title: { de: "Training & Inferenz", en: "Training & inference" }, desc: { de: "Abgestimmt auf gängige KI-Frameworks für Training und produktiven Betrieb.", en: "Tuned for common AI frameworks, from training to production serving." } },
      { icon: "🔗", title: { de: "Passt zu OceanStor & Data Lakes", en: "Fits OceanStor & Data Lakes" }, desc: { de: "Integriert sich in bestehende Huawei-Storage- und Datenplattformen.", en: "Integrates with existing Huawei storage and data platforms." } },
    ],
    relatedArticleSlugs: [],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug && p.status === "available");
}

// Shared package-tier icon set (used on the product detail page, the
// Managed Services overview, and the homepage teaser) so all three stay
// in sync automatically.
export const CARE_PACKAGE_ICONS: Record<ManagedPackage["id"], string> = {
  monitor: "/Icons/care_monitor_icon.png",
  operate: "/Icons/care_operate_icon.png",
  complete: "/Icons/care_complete_icon.png",
};

export function productsByCategory(categoryId: string) {
  return PRODUCTS.filter((p) => p.categoryIds.includes(categoryId) && p.status === "available");
}
