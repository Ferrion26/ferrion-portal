export type SolutionContent = {
  slug: string;
  icon: string;
  eyebrow: { de: string; en: string };
  title: { de: string; en: string };
  lead: { de: string; en: string };
  capabilities: { de: { title: string; desc: string }[]; en: { title: string; desc: string }[] };
  techLabel: { de: string; en: string };
  tech: string[];
  useCasesLabel: { de: string; en: string };
  useCases: { de: string[]; en: string[] };
  stats: { value: string; label: { de: string; en: string } }[];
  cta: { de: string; en: string };
};

export const SOLUTIONS: SolutionContent[] = [
  {
    slug: "storage",
    icon: "🗄",
    eyebrow: { de: "Storage & Infrastruktur", en: "Storage & Infrastructure" },
    title: { de: "Storage, der mitwächst.", en: "Storage that scales with you." },
    lead: {
      de: "Von All-Flash-Performance bis Petabyte-Scale: Wir planen, liefern und betreiben Storage-Infrastruktur, die geschäftskritische Workloads zuverlässig trägt — ohne Vendor-Lock-in und mit Datenbank-Know-how, das den Unterschied macht.",
      en: "From all-flash performance to petabyte scale: we plan, deliver and operate storage infrastructure that reliably carries business-critical workloads — without vendor lock-in and with database know-how that makes the difference.",
    },
    capabilities: {
      de: [
        { title: "All-Flash & NVMe", desc: "Pure Storage FlashArray & Huawei OceanStor für latenzkritische Datenbanken und Virtualisierung." },
        { title: "Skalierbare Architektur", desc: "Scale-out-Design, das von Terabyte bis Petabyte ohne Re-Architecture mitwächst." },
        { title: "Datenreduktion", desc: "Inline-Kompression und Deduplizierung mit typischen Reduktionsfaktoren von 3:1 bis 5:1." },
        { title: "Zero-Downtime-Migration", desc: "Bewährtes Playbook für unterbrechungsfreie Umzüge — auch im 24/7-Betrieb." },
      ],
      en: [
        { title: "All-Flash & NVMe", desc: "Pure Storage FlashArray & Huawei OceanStor for latency-critical databases and virtualisation." },
        { title: "Scalable Architecture", desc: "Scale-out design that grows from terabyte to petabyte without re-architecture." },
        { title: "Data Reduction", desc: "Inline compression and deduplication with typical reduction factors of 3:1 to 5:1." },
        { title: "Zero-Downtime Migration", desc: "Proven playbook for non-disruptive moves — even in 24/7 operations." },
      ],
    },
    techLabel: { de: "Technologien", en: "Technologies" },
    tech: ["Pure Storage FlashArray", "Huawei OceanStor", "NetApp", "NVMe-oF", "VMware vSphere", "ActiveCluster"],
    useCasesLabel: { de: "Typische Anwendungsfälle", en: "Typical Use Cases" },
    useCases: {
      de: ["Konsolidierung gewachsener Storage-Landschaften", "Performance-Tuning für SQL- und Oracle-Datenbanken", "Storage-Refresh bei End-of-Support", "Aufbau hochverfügbarer Zwei-Standort-Architekturen"],
      en: ["Consolidation of grown storage landscapes", "Performance tuning for SQL and Oracle databases", "Storage refresh at end of support", "Building highly available two-site architectures"],
    },
    stats: [
      { value: "0 min", label: { de: "Downtime bei Migration", en: "Downtime during migration" } },
      { value: "4:1", label: { de: "Ø Datenreduktion", en: "Avg. data reduction" } },
      { value: "15×", label: { de: "Performance-Gewinn", en: "Performance gain" } },
    ],
    cta: { de: "Storage-Beratung anfragen →", en: "Request Storage Consultation →" },
  },
  {
    slug: "backup",
    icon: "🛡",
    eyebrow: { de: "Backup & Security", en: "Backup & Security" },
    title: { de: "Daten, die niemand kompromittiert.", en: "Data no one can compromise." },
    lead: {
      de: "Ransomware-resilient, NIS2-konform und auditfähig: Wir bauen Backup- und Data-Protection-Konzepte mit unveränderlichem Speicher, Air-Gap und getesteten Wiederherstellungsprozessen — damit der Ernstfall planbar bleibt.",
      en: "Ransomware-resilient, NIS2-compliant and audit-ready: we build backup and data protection concepts with immutable storage, air-gap and tested recovery processes — so the worst case stays plannable.",
    },
    capabilities: {
      de: [
        { title: "Immutable Backups", desc: "Unveränderlicher Speicher mit Air-Gap — Backup-Daten bleiben auch bei Ransomware unangetastet." },
        { title: "NIS2-Readiness", desc: "Von der Risikoanalyse bis zum bestandenen Audit — inkl. Incident-Response-Plan und Dokumentation." },
        { title: "Disaster Recovery", desc: "Definierte RTO/RPO mit automatisierten Failover-Tests und Recovery-Validierung." },
        { title: "Backup-Audit", desc: "Bestandsaufnahme und Härtung bestehender Backup-Umgebungen mit Lückenanalyse." },
      ],
      en: [
        { title: "Immutable Backups", desc: "Immutable storage with air-gap — backup data stays untouched even during ransomware." },
        { title: "NIS2 Readiness", desc: "From risk analysis to passed audit — including incident response plan and documentation." },
        { title: "Disaster Recovery", desc: "Defined RTO/RPO with automated failover tests and recovery validation." },
        { title: "Backup Audit", desc: "Assessment and hardening of existing backup environments with gap analysis." },
      ],
    },
    techLabel: { de: "Technologien", en: "Technologies" },
    tech: ["Commvault Complete", "Immutable Storage", "Air-Gap", "SIEM-Integration", "MFA", "ISO/IEC 27001"],
    useCasesLabel: { de: "Typische Anwendungsfälle", en: "Typical Use Cases" },
    useCases: {
      de: ["NIS2-Compliance für betroffene Unternehmen", "Ransomware-Schutz für kritische Daten", "Modernisierung veralteter Backup-Systeme", "Aufbau eines getesteten DR-Konzepts"],
      en: ["NIS2 compliance for affected companies", "Ransomware protection for critical data", "Modernisation of outdated backup systems", "Building a tested DR concept"],
    },
    stats: [
      { value: "90 T", label: { de: "Immutable-Aufbewahrung", en: "Immutable retention" } },
      { value: "< 4 h", label: { de: "Recovery Time Objective", en: "Recovery Time Objective" } },
      { value: "99,98 %", label: { de: "Backup-Erfolgsrate", en: "Backup success rate" } },
    ],
    cta: { de: "NIS2-Beratung anfragen →", en: "Request NIS2 Consultation →" },
  },
  {
    slug: "ai-infrastruktur",
    icon: "🤖",
    eyebrow: { de: "AI-Infrastruktur", en: "AI Infrastructure" },
    title: { de: "KI, die im eigenen Haus bleibt.", en: "AI that stays in-house." },
    lead: {
      de: "GPU-Power der Cloud-Riesen, aber on-premise und datenschutzkonform: Wir liefern private AI-Cluster auf NVIDIA-Basis, von der Hardware-Planung über Kubernetes-Orchestrierung bis zum produktiven Inferenz-Betrieb.",
      en: "GPU power of the cloud giants, but on-premise and privacy-compliant: we deliver private AI clusters based on NVIDIA, from hardware planning through Kubernetes orchestration to productive inference operations.",
    },
    capabilities: {
      de: [
        { title: "GPU Server & Cluster", desc: "NVIDIA DGX H100 und skalierbare Multi-GPU-Cluster mit InfiniBand-Interconnect." },
        { title: "Kubernetes für AI", desc: "GPU-Operator, automatische Workload-Zuteilung und Isolation zwischen Training und Inferenz." },
        { title: "AI Storage", desc: "Hochperformanter Flash-Storage, der Trainingszeiten um bis zu 60 % verkürzt." },
        { title: "AI Backup & DR", desc: "Schutz von Modellen, Datasets und Artefakten — versioniert und wiederherstellbar." },
      ],
      en: [
        { title: "GPU Servers & Clusters", desc: "NVIDIA DGX H100 and scalable multi-GPU clusters with InfiniBand interconnect." },
        { title: "Kubernetes for AI", desc: "GPU operator, automatic workload allocation and isolation between training and inference." },
        { title: "AI Storage", desc: "High-performance flash storage that cuts training times by up to 60%." },
        { title: "AI Backup & DR", desc: "Protection of models, datasets and artefacts — versioned and recoverable." },
      ],
    },
    techLabel: { de: "Technologien", en: "Technologies" },
    tech: ["NVIDIA DGX H100", "NVIDIA GPU Operator", "Kubernetes", "InfiniBand", "MLflow", "Huawei OceanStor A800"],
    useCasesLabel: { de: "Typische Anwendungsfälle", en: "Typical Use Cases" },
    useCases: {
      de: ["Private AI für sensible Branchen (Healthcare, Public)", "Medizinische Bildanalyse in Echtzeit", "On-Premise-LLM-Inferenz ohne Cloud", "Aufbau einer skalierbaren ML-Plattform"],
      en: ["Private AI for sensitive sectors (healthcare, public)", "Real-time medical image analysis", "On-premise LLM inference without cloud", "Building a scalable ML platform"],
    },
    stats: [
      { value: "32×H100", label: { de: "GPU pro Cluster", en: "GPUs per cluster" } },
      { value: "280 ms", label: { de: "Inferenz-Latenz", en: "Inference latency" } },
      { value: "6 W", label: { de: "Deployment-Zeit", en: "Deployment time" } },
    ],
    cta: { de: "AI-Infrastruktur anfragen →", en: "Request AI Infrastructure →" },
  },
  {
    slug: "managed-services",
    icon: "⚙",
    eyebrow: { de: "Managed Services", en: "Managed Services" },
    title: { de: "Betrieb, der nie schläft.", en: "Operations that never sleep." },
    lead: {
      de: "Proaktiv statt reaktiv: Wir übernehmen Monitoring, Wartung, Renewals und den laufenden Betrieb Ihrer Infrastruktur — mit definierten SLAs, transparentem Reporting und einem Team, das Ihre Umgebung kennt.",
      en: "Proactive instead of reactive: we take over monitoring, maintenance, renewals and the ongoing operation of your infrastructure — with defined SLAs, transparent reporting and a team that knows your environment.",
    },
    capabilities: {
      de: [
        { title: "24/7 Monitoring", desc: "Proaktive Überwachung mit Alerting, bevor aus einem Symptom ein Ausfall wird." },
        { title: "Wartung & Patching", desc: "Geplante Updates, Firmware-Pflege und Health-Checks im definierten Wartungsfenster." },
        { title: "Renewals & Lizenzen", desc: "Lückenlose Verwaltung von Support-Verträgen und Subscriptions — keine bösen Überraschungen." },
        { title: "Transparentes Reporting", desc: "Regelmäßige Service-Reviews mit klaren KPIs zu Verfügbarkeit und Performance." },
      ],
      en: [
        { title: "24/7 Monitoring", desc: "Proactive monitoring with alerting before a symptom becomes an outage." },
        { title: "Maintenance & Patching", desc: "Planned updates, firmware care and health checks within defined maintenance windows." },
        { title: "Renewals & Licences", desc: "Seamless management of support contracts and subscriptions — no nasty surprises." },
        { title: "Transparent Reporting", desc: "Regular service reviews with clear KPIs on availability and performance." },
      ],
    },
    techLabel: { de: "Leistungen", en: "Services" },
    tech: ["SLA-basierter Support", "Proaktives Monitoring", "Patch-Management", "Capacity Planning", "Lifecycle-Management", "Service Reviews"],
    useCasesLabel: { de: "Typische Anwendungsfälle", en: "Typical Use Cases" },
    useCases: {
      de: ["Entlastung schlanker IT-Teams", "Sicherstellung von Verfügbarkeit und Compliance", "Lifecycle-Management der Infrastruktur", "Planbare OpEx statt unplanbarer Ausfälle"],
      en: ["Relief for lean IT teams", "Ensuring availability and compliance", "Infrastructure lifecycle management", "Plannable OpEx instead of unplannable outages"],
    },
    stats: [
      { value: "24/7", label: { de: "Monitoring", en: "Monitoring" } },
      { value: "< 24 h", label: { de: "Reaktionszeit", en: "Response time" } },
      { value: "99,9 %", label: { de: "Verfügbarkeitsziel", en: "Availability target" } },
    ],
    cta: { de: "Managed Services anfragen →", en: "Request Managed Services →" },
  },
];

export function getSolution(slug: string) {
  return SOLUTIONS.find((s) => s.slug === slug);
}
