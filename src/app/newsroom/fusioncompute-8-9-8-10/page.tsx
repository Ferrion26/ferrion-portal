import Link from "next/link";
import { resolveLocale } from "@/lib/i18n";
import { articleMetadata } from "@/lib/seo";
import ArticleJsonLd from "@/components/ArticleJsonLd";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return articleMetadata("fusioncompute-8-9-8-10", searchParams);
}

const content = {
  de: {
    back: "← Newsroom",
    tag: "Huawei · Storage · Backup",
    date: "15. Mai 2024",
    readTime: "10 Min. Lesezeit",
    title: "FusionCompute 8.9 und 8.10: Die wichtigsten Neuerungen im Überblick",
    subtitle: "Ein Technik-Update zu den Releases 8.9.0 und 8.10.0 RC1 – mit Schwerpunkt auf LAN-Free Backup",
    intro: `Mit FusionCompute 8.9.0 und dem darauf folgenden Release 8.10.0 RC1 hat Huawei wieder eine ganze Reihe von Funktionen nachgelegt, die für den Betrieb virtualisierter Umgebungen relevant sind. In diesem Beitrag werfen wir einen technischen Blick auf die wichtigsten Neuerungen beider Versionen und schauen uns im Detail an, wie sich das Backup-Konzept von Version 8.9 zu Version 8.10 weiterentwickelt – insbesondere mit Blick auf LAN-Free Backup.`,
    v89: {
      title: "Version 8.9.0: Neue und erweiterte Funktionen",
      intro: "Version 8.9.0 bringt sowohl eine Reihe komplett neuer Funktionen als auch zahlreiche Erweiterungen bestehender Features. Für Techniker, die FusionCompute im täglichen Betrieb administrieren, sind vor allem die Punkte rund um Ressourcenmanagement, Sicherheit und Snapshot-Handling relevant.",
      newTitle: "Neue Funktionen (Auswahl)",
      newFeatures: [
        { id: "FSFD-010404", title: "Topology-Aware vCPU Scheduling", desc: "Das Scheduling der virtuellen CPUs berücksichtigt nun die NUMA- und Cache-Topologie der physischen Hosts und kann so Latenzen reduzieren." },
        { id: "FSFD-010405", title: "Adaptive Provisioning of Computing Power", desc: "Dynamische Anpassung der bereitgestellten Rechenleistung an den tatsächlichen Bedarf der VMs." },
        { id: "FSFD-010605", title: "VM Disk Encryption", desc: "Verschlüsselung von VM-Disks zur Erhöhung der Datensicherheit auf Speicherebene." },
        { id: "FSFD-020304", title: "Microsegmentation", desc: "Feingranulare Netzwerksegmentierung innerhalb der virtuellen Infrastruktur für mehr Sicherheit auf Workload-Ebene." },
        { id: "FSFD-070206", title: "SecureID RSA Authentication", desc: "Anbindung an RSA SecureID für eine zusätzliche, starke Authentifizierungsebene." },
        { id: "FSFD-090202", title: "Connection to Ansible", desc: "Integration in Ansible-basierte Automatisierungs-Workflows." },
      ],
      extTitle: "Erweiterte Funktionen (Auswahl)",
      extFeatures: [
        { id: "FSFD-010205", title: "VM Cloning", desc: "Unterstützt jetzt das Klonen von VMs auf Basis von Snapshots." },
        { id: "FSFD-010601/010603", title: "Consistency & VM Disk Snapshot", desc: "Snapshots können nun in Batches für mehrere VMs gleichzeitig erstellt und gelöscht werden." },
        { id: "FSFD-020102", title: "Network QoS", desc: "Unterstützung von QoS auf dem Management-Aggregation-Port." },
        { id: "FSFD-030104", title: "Thin Provisioning of Virtual Volumes", desc: "Vorab-Allokation von Metadaten zur Verbesserung der Schreibperformance bei Thin-Provisioned-Disks." },
        { id: "FSFD-030203", title: "NoF+ mit IPv6", desc: "NoF+ jetzt mit vollständiger IPv6-Unterstützung." },
        { id: "FSFD-070203", title: "Certificate Management", desc: "CA-Zertifikatswechsel per Mausklick." },
      ],
      backupLabel: "Backup in 8.9.0",
      backupNote: "Im Bereich Backup ist für Version 8.9.0 vor allem eines wichtig: Das VM-Disk-Backup (FSFD-050301) basiert weiterhin ausschließlich auf LAN-basiertem Backup. Backup-Daten werden über das Management- bzw. ein dediziertes Backup-Netzwerk übertragen – ein LAN-freier Pfad steht in dieser Version noch nicht zur Verfügung.",
    },
    v810: {
      title: "Version 8.10.0 RC1: Die wichtigsten Neuerungen",
      intro: "Version 8.10.0 RC1 erbt alle Funktionen von 8.9.0 und früheren Versionen und ergänzt diese um zahlreiche neue und überarbeitete Features.",
      colFeature: "Funktion",
      colDesc: "Beschreibung / Nutzen",
      features: [
        { title: "LAN-Free Backup für virtualisierten Storage", desc: "DCS unterstützt nun LAN-freies Backup – Backup-Server greifen direkt auf den Storage zu, ohne den FusionCompute-Host und das LAN zu belasten." },
        { title: "Kunpeng-Hardwarefehlererkennung", desc: "Verbesserte Erkennung von Kunpeng-CPU-Kernfehlern und Memory-UCE-Fehlern für höhere Zuverlässigkeit." },
        { title: "One-Click-Performance-Modus", desc: "Performance-Modus für Kerntransaktionssysteme lässt sich mit einem Klick aktivieren." },
        { title: "RADIUS-Authentifizierung für NCE", desc: "FusionCompute-Login kann Authentifizierungsanfragen an einen RADIUS-Server weiterleiten." },
        { title: "Virtuelle Shared Disks für WSFC", desc: "Unterstützung beim Aufbau von Windows Server Failover Cluster (WSFC) durch virtuelle gemeinsame Disks." },
        { title: "Automatische Migration/HA bei Memory-CE-Storms", desc: "Bei einem Memory-CE-Storm wird ein Alarm ausgelöst; betroffene VMs werden per HA oder Migration auf andere Hosts verschoben." },
        { title: "NUMA-Affinität", desc: "VM-CPUs werden bei Start, Migration und HA bevorzugt demselben NUMA-Knoten zugewiesen." },
        { title: "Live-Migration & HA mit Core-Binding (GaussDB)", desc: "Live-Migration und HA sind nun auch bei manuellem oder dynamischem Core-Binding in GaussDB-Szenarien möglich." },
      ],
    },
    backup: {
      title: "Deep Dive: LAN-Based vs. LAN-Free Backup",
      intro: "Der vielleicht spannendste Sprung zwischen 8.9 und 8.10 betrifft das Thema Backup. Während VM-Disk-Backups in 8.9.0 ausschließlich über das LAN abgewickelt werden, führt 8.10.0 erstmals LAN-freies Backup für virtualisierten Storage ein.",
      lanBased: {
        title: "LAN-Based Backup (Version 8.9.0)",
        desc: "Beim LAN-basierten Backup läuft der Datenverkehr über das Management- bzw. ein dediziertes Backup-Netzwerk: Die Daten werden vom Storage zum FusionCompute-Host (CNA) gelesen und von dort über das LAN an den Backup-Server übertragen. Das bedeutet zusätzliche CPU- und Netzwerk-Last auf dem Host.",
        flow: ["Storage", "FusionCompute Host (CNA)", "LAN / Backup-Netzwerk", "Backup-Server (eBackup)"],
        warning: "Host-CPU & LAN-Bandbreite werden belastet",
      },
      lanFree: {
        title: "LAN-Free Backup (ab Version 8.10.0)",
        desc: "Mit Version 8.10.0 kann der Backup-Server direkt über ein dediziertes Storage-Netzwerk auf den Storage zugreifen – am FusionCompute-Host und am regulären LAN vorbei. Dadurch wird der Host für das Backup nicht mehr belastet.",
        flow: ["Storage", "dediziertes Storage-Netzwerk", "Backup-Server (direkt)"],
        ok: "Host & LAN entlastet — direkter Storage-Zugriff",
        prereqs: {
          title: "Voraussetzungen für LAN-Free Backup",
          items: [
            { label: "Storage-Typ", desc: "Ausschließlich Huawei Distributed Block Storage und eVol Storage (OceanStor Dorado)." },
            { label: "Version", desc: "Ab FusionCompute 8.10.0, insbesondere in HA-Szenarien mit Dual-Active Cross- oder Parallel-Networking." },
            { label: "Netzwerk", desc: "Das Backup-Netzwerk des Client-Hosts muss mit dem Produktionsstorage-Netzwerk kommunizieren können." },
            { label: "Deployment", desc: "Pro Dual-Active-Setup darf nur ein OceanProtect-System für das Backup eingesetzt werden." },
          ],
        },
        limits: {
          title: "Wichtige Einschränkungen",
          items: [
            "VMs mit gemischten HA- und Non-HA-Disks können nicht über LAN-Free Backup gesichert werden.",
            "HA-Systemdisks unterstützen keine Disk-Level-Recovery.",
            "Nach einer Wiederherstellung werden HA-Disks zu Non-HA-Disks und müssen manuell neu konfiguriert werden.",
          ],
        },
      },
    },
    dr: {
      title: "Disaster Recovery in FusionCompute 8.10",
      intro: "Neben dem Backup ist Disaster Recovery (DR) eines der zentralen Themen für den produktiven Betrieb. FusionCompute 8.10 unterstützt mehrere DR-Konzepte – primär Storage-Replikations-basierte DR, eVol-Storage-basierte Replikations-DR und Metropolitan Active-Active DR.",
      colConcept: "DR-Konzept", colDesc: "Beschreibung", colRepl: "Replikation", colSince: "Seit",
      concepts: [
        { name: "Storage-Replikations-basierte DR", desc: "Nutzt die Remote-Replikation der Huawei-Storage-Geräte. UltraVR repliziert die VM-Konfiguration und verwaltet die DR-Pläne.", repl: "asynchron / synchron", since: "FC 6.5.0" },
        { name: "eVol-Storage-basierte Replikations-DR", desc: "Unterstützt eVol-Datastores mit zentralisiertem Huawei-Storage. UltraVR übernimmt VM-Konfigurationsreplikation und DR-Orchestrierung.", repl: "asynchron / synchron", since: "FC 8.7.0" },
        { name: "Metropolitan Active-Active DR", desc: "Zwei Standorte verarbeiten gleichzeitig Workloads mit nahezu null RPO. Basiert auf HyperMetro-Technologie.", repl: "synchron (Active-Active)", since: "FC 8.6.0" },
      ],
      highlight: {
        title: "Highlight: Two-Site and Three-Center DR",
        desc: "Das eigentliche Highlight im DR-Umfeld ist die Two-Site-and-Three-Center-Lösung. Sie kombiniert die Metropolitan-Active-Active-DR zwischen Produktionszentrum und einem Intra-City-DR-Zentrum mit einer Array-basierten Replikations-DR vom Active-Active-Rechenzentrum zu einem entfernten Remote-DR-Zentrum.",
        centers: [
          { label: "Produktionszentrum", sub: "Active", gold: true },
          { label: "Intra-City DR", sub: "Active (HyperMetro)", gold: true },
          { label: "Remote DR", sub: "Async Replikation", gold: false },
        ],
        benefits: [
          "Schnelles Failover auf den Intra-City-Standort (synchron, RPO = 0) bei lokalen Störungen.",
          "Zusätzliches entferntes Remote-Zentrum (asynchrone Replikation) bei regionalen Ausfällen.",
          "Zentrale Steuerung über UltraVR – inklusive DR-Tests, geplanter Migration und Reprotection.",
          "Unterstützt Non-Ring- und Ring-Topologie mit bidirektionalen Replikationspfaden.",
        ],
      },
    },
    conclusion: {
      title: "Fazit",
      text: "Version 8.9.0 legt mit Topology-Aware vCPU Scheduling, VM Disk Encryption, Microsegmentation und einer Reihe von Snapshot-Verbesserungen die Basis für eine performantere und sicherere Plattform. Version 8.10.0 RC1 baut darauf auf und bringt mit LAN-Free Backup, NUMA-Affinität und verbesserter Hardwarefehlererkennung weitere wichtige Bausteine für den produktiven Betrieb großer, hochverfügbarer Umgebungen.\n\nInsbesondere die Einführung von LAN-Free Backup ist für Techniker ein relevanter Architekturwechsel: Backups belasten ab 8.10.0 unter den genannten Voraussetzungen nicht mehr Host und LAN, sondern laufen direkt über das Storage-Netzwerk. Auf der DR-Seite rundet die Two-Site-and-Three-Center-Lösung das Bild ab.",
      note: "Hinweis: Dieser Beitrag basiert auf den Release Notes zu FusionCompute 8.9.0 und 8.10.0 RC1 sowie der Virtualization Feature List 8.9.0. Für detaillierte Fragen zu Konfiguration und Kompatibilität wenden Sie sich bitte an die Huawei-Ansprechpartner.",
      cta: "Haben Sie Fragen zu FusionCompute oder Huawei-Infrastruktur? Wir beraten Sie gerne.",
      ctaBtn: "Beratung anfragen →",
      backHome: "← Zurück zur Homepage",
      partner: "Ferrion — IT-Systemhaus · Huawei Gold Partner",
    },
  },
  en: {
    back: "← Newsroom",
    tag: "Huawei · Storage · Backup",
    date: "May 15, 2024",
    readTime: "10 min read",
    title: "FusionCompute 8.9 and 8.10: Key Updates at a Glance",
    subtitle: "A technical update on releases 8.9.0 and 8.10.0 RC1 – with a focus on LAN-Free Backup",
    intro: `With FusionCompute 8.9.0 and the subsequent release 8.10.0 RC1, Huawei has added a wide range of new capabilities relevant to running virtualised environments. In this article we take a technical look at the most important changes in both versions and examine in detail how the backup architecture evolved from 8.9 to 8.10 – in particular with respect to LAN-Free Backup.`,
    v89: {
      title: "Version 8.9.0: New and Enhanced Features",
      intro: "Version 8.9.0 introduces a set of entirely new features as well as numerous enhancements to existing ones. For engineers administering FusionCompute day-to-day, the most relevant areas are resource management, security, and snapshot handling.",
      newTitle: "New Features (Selection)",
      newFeatures: [
        { id: "FSFD-010404", title: "Topology-Aware vCPU Scheduling", desc: "Virtual CPU scheduling now takes the NUMA and cache topology of physical hosts into account, reducing latency." },
        { id: "FSFD-010405", title: "Adaptive Provisioning of Computing Power", desc: "Dynamic adjustment of allocated compute resources to match the actual demand of VMs." },
        { id: "FSFD-010605", title: "VM Disk Encryption", desc: "Encryption of VM disks to enhance data security at the storage layer." },
        { id: "FSFD-020304", title: "Microsegmentation", desc: "Fine-grained network segmentation within the virtual infrastructure for improved workload-level security." },
        { id: "FSFD-070206", title: "SecureID RSA Authentication", desc: "Integration with RSA SecureID for an additional strong authentication layer." },
        { id: "FSFD-090202", title: "Connection to Ansible", desc: "Integration with Ansible-based automation workflows." },
      ],
      extTitle: "Enhanced Features (Selection)",
      extFeatures: [
        { id: "FSFD-010205", title: "VM Cloning", desc: "Now supports cloning VMs based on snapshots." },
        { id: "FSFD-010601/010603", title: "Consistency & VM Disk Snapshot", desc: "Snapshots can now be created and deleted in batches for multiple VMs simultaneously." },
        { id: "FSFD-020102", title: "Network QoS", desc: "QoS support on the management aggregation port." },
        { id: "FSFD-030104", title: "Thin Provisioning of Virtual Volumes", desc: "Pre-allocation of metadata to improve write performance on thin-provisioned disks." },
        { id: "FSFD-030203", title: "NoF+ with IPv6", desc: "NoF+ now with full IPv6 support." },
        { id: "FSFD-070203", title: "Certificate Management", desc: "One-click CA certificate replacement." },
      ],
      backupLabel: "Backup in 8.9.0",
      backupNote: "For backup in version 8.9.0, the key point is this: VM disk backup (FSFD-050301) still relies exclusively on LAN-based backup. Backup data is transferred via the management or a dedicated backup network — a LAN-free path is not yet available in this version.",
    },
    v810: {
      title: "Version 8.10.0 RC1: Key New Features",
      intro: "Version 8.10.0 RC1 inherits all features from 8.9.0 and earlier, adding numerous new and revised capabilities.",
      colFeature: "Feature",
      colDesc: "Description / Benefit",
      features: [
        { title: "LAN-Free Backup for Virtualised Storage", desc: "DCS now supports LAN-free backup — backup servers access storage directly without burdening the FusionCompute host or LAN." },
        { title: "Kunpeng Hardware Fault Detection", desc: "Improved detection of Kunpeng CPU core faults and memory UCE errors for higher reliability." },
        { title: "One-Click Performance Mode", desc: "Performance mode for core transaction systems can be activated with a single click." },
        { title: "RADIUS Authentication for NCE", desc: "FusionCompute login can now forward authentication requests to a RADIUS server." },
        { title: "Virtual Shared Disks for WSFC", desc: "Support for building Windows Server Failover Cluster (WSFC) via virtual shared disks." },
        { title: "Automatic Migration/HA on Memory-CE Storms", desc: "A memory-CE storm triggers an alarm; affected VMs are moved to other hosts via HA or live migration." },
        { title: "NUMA Affinity", desc: "VM CPUs are preferentially assigned to the same NUMA node on start, migration, and HA." },
        { title: "Live Migration & HA with Core-Binding (GaussDB)", desc: "Live migration and HA are now supported even with manual or dynamic core-binding in GaussDB scenarios." },
      ],
    },
    backup: {
      title: "Deep Dive: LAN-Based vs. LAN-Free Backup",
      intro: "Perhaps the most significant leap between 8.9 and 8.10 concerns backup. While VM disk backups in 8.9.0 are handled exclusively over the LAN, 8.10.0 introduces LAN-free backup for virtualised storage for the first time.",
      lanBased: {
        title: "LAN-Based Backup (Version 8.9.0)",
        desc: "With LAN-based backup, all VM disk backup traffic runs over the management or a dedicated backup network: data is read from storage to the FusionCompute host (CNA) and then transferred over the LAN to the backup server. This means every backup consumes additional CPU and network resources on the host.",
        flow: ["Storage", "FusionCompute Host (CNA)", "LAN / Backup Network", "Backup Server (eBackup)"],
        warning: "Host CPU & LAN bandwidth are consumed",
      },
      lanFree: {
        title: "LAN-Free Backup (from Version 8.10.0)",
        desc: "From version 8.10.0, the backup server can access storage directly via a dedicated storage network — bypassing the FusionCompute host and the regular LAN. This removes the host from the backup data path entirely.",
        flow: ["Storage", "Dedicated Storage Network", "Backup Server (direct)"],
        ok: "Host & LAN offloaded — direct storage access",
        prereqs: {
          title: "Prerequisites for LAN-Free Backup",
          items: [
            { label: "Storage Type", desc: "Only Huawei Distributed Block Storage and eVol Storage (OceanStor Dorado) are supported." },
            { label: "Version", desc: "Requires FusionCompute 8.10.0 or later, especially in HA scenarios with Dual-Active cross- or parallel-networking." },
            { label: "Network", desc: "The client host's backup network must be able to communicate with the production storage network." },
            { label: "Deployment", desc: "Only one OceanProtect system per dual-active setup may be used for backup." },
          ],
        },
        limits: {
          title: "Important Limitations",
          items: [
            "VMs with mixed HA and non-HA disks cannot be backed up via LAN-Free Backup.",
            "HA system disks do not support disk-level recovery.",
            "After a restore, HA disks become non-HA disks and must be manually reconfigured.",
          ],
        },
      },
    },
    dr: {
      title: "Disaster Recovery in FusionCompute 8.10",
      intro: "Alongside backup, Disaster Recovery (DR) is one of the central topics for production operations. FusionCompute 8.10 supports multiple DR concepts — primarily storage-replication-based DR, eVol-storage-based replication DR, and Metropolitan Active-Active DR.",
      colConcept: "DR Concept", colDesc: "Description", colRepl: "Replication", colSince: "Since",
      concepts: [
        { name: "Storage-Replication-Based DR", desc: "Uses the remote replication of Huawei storage devices. UltraVR replicates VM configuration and manages DR plans.", repl: "async / sync", since: "FC 6.5.0" },
        { name: "eVol-Storage-Based Replication DR", desc: "Supports eVol datastores with centralised Huawei storage. UltraVR handles VM configuration replication and DR orchestration.", repl: "async / sync", since: "FC 8.7.0" },
        { name: "Metropolitan Active-Active DR", desc: "Two sites process workloads simultaneously with near-zero RPO. Based on HyperMetro technology.", repl: "sync (Active-Active)", since: "FC 8.6.0" },
      ],
      highlight: {
        title: "Highlight: Two-Site and Three-Center DR",
        desc: "The standout DR capability is the Two-Site-and-Three-Center solution. It combines Metropolitan Active-Active DR between the production centre and an intra-city DR centre with array-based replication DR from the active-active data centre to a remote DR centre.",
        centers: [
          { label: "Production Centre", sub: "Active", gold: true },
          { label: "Intra-City DR", sub: "Active (HyperMetro)", gold: true },
          { label: "Remote DR", sub: "Async Replication", gold: false },
        ],
        benefits: [
          "Fast failover to the intra-city site (synchronous, RPO = 0) for local disruptions.",
          "Additional remote centre (asynchronous replication) for regional outages.",
          "Centralised control via UltraVR — including DR tests, planned migration, and reprotection.",
          "Supports non-ring and ring topology with bidirectional replication paths.",
        ],
      },
    },
    conclusion: {
      title: "Summary",
      text: "Version 8.9.0 lays the groundwork for a more performant and secure platform with Topology-Aware vCPU Scheduling, VM Disk Encryption, Microsegmentation, and a range of snapshot improvements. Version 8.10.0 RC1 builds on this with LAN-Free Backup, NUMA affinity, and improved hardware fault detection — key building blocks for large, highly available environments.\n\nThe introduction of LAN-Free Backup in particular represents a meaningful architectural shift for engineers: from 8.10.0 onwards, under the prerequisites described, backups no longer burden the host or LAN but run directly over the storage network. On the DR side, the Two-Site-and-Three-Center solution rounds out the picture with multi-tier protection across three data centres.",
      note: "Note: This article is based on the release notes for FusionCompute 8.9.0 and 8.10.0 RC1 as well as the Virtualization Feature List 8.9.0. For detailed questions about configuration and compatibility, please contact your Huawei representative.",
      cta: "Questions about FusionCompute or Huawei infrastructure? We're happy to advise.",
      ctaBtn: "Request Consultation →",
      backHome: "← Back to Homepage",
      partner: "Ferrion — IT Systems House · Huawei Gold Partner",
    },
  },
};

export default function FusionComputeArticle({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <ArticleJsonLd slug="fusioncompute-8-9-8-10" locale={locale} />
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/" className="mr-6">
          <img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" />
        </Link>
        <div className="h-5 w-px bg-white/20 mr-6" />
        <Link href="/newsroom" className="text-xs text-gray-400 hover:text-[#c9a84c] transition-colors tracking-widest uppercase">
          {t.back}
        </Link>
      </header>

      <main className="pt-16">
        <div className="bg-[#111827] border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {t.tag.split(" · ").map((tag) => (
                <span key={tag} className="text-[10px] font-bold tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5">{tag}</span>
              ))}
              <span className="text-gray-500 text-xs ml-auto">{t.date} · {t.readTime}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">{t.title}</h1>
            <p className="text-[#c9a84c] text-sm font-medium mb-6">{t.subtitle}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{t.intro}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">

          {/* 8.9.0 */}
          <section>
            <SectionTitle>{t.v89.title}</SectionTitle>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.v89.intro}</p>
            <SubTitle>{t.v89.newTitle}</SubTitle>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {t.v89.newFeatures.map((f) => (
                <FeatureCard key={f.id} id={f.id} title={f.title} desc={f.desc} />
              ))}
            </div>
            <SubTitle>{t.v89.extTitle}</SubTitle>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {t.v89.extFeatures.map((f) => (
                <FeatureCard key={f.id} id={f.id} title={f.title} desc={f.desc} />
              ))}
            </div>
            <div className="bg-[#1a2332] border border-[#c9a84c]/20 p-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#c9a84c] mb-2">{t.v89.backupLabel}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{t.v89.backupNote}</p>
            </div>
          </section>

          {/* 8.10.0 */}
          <section>
            <SectionTitle>{t.v810.title}</SectionTitle>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.v810.intro}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.v810.colFeature}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.v810.colDesc}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.v810.features.map((f, i) => (
                    <tr key={f.title} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-3 text-[#c9a84c] font-medium text-xs whitespace-nowrap">{f.title}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs leading-relaxed">{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Backup Deep Dive */}
          <section>
            <SectionTitle>{t.backup.title}</SectionTitle>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">{t.backup.intro}</p>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-[#111827] border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                  <p className="text-white font-bold text-sm">{t.backup.lanBased.title}</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-5">{t.backup.lanBased.desc}</p>
                <div className="space-y-1">
                  {t.backup.lanBased.flow.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                        {i < t.backup.lanBased.flow.length - 1 && <div className="w-px h-4 bg-gray-700" />}
                      </div>
                      <span className="text-gray-400 text-xs">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-red-900/20 border border-red-500/20 px-3 py-2">
                  <p className="text-red-400 text-[10px]">{t.backup.lanBased.warning}</p>
                </div>
              </div>
              <div className="bg-[#111827] border border-[#c9a84c]/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                  <p className="text-white font-bold text-sm">{t.backup.lanFree.title}</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-5">{t.backup.lanFree.desc}</p>
                <div className="space-y-1">
                  {t.backup.lanFree.flow.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                        {i < t.backup.lanFree.flow.length - 1 && <div className="w-px h-4 bg-[#c9a84c]/30" />}
                      </div>
                      <span className="text-gray-300 text-xs">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-green-900/20 border border-green-500/20 px-3 py-2">
                  <p className="text-green-400 text-[10px]">{t.backup.lanFree.ok}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#111827] border border-white/10 p-6 mb-4">
              <SubTitle>{t.backup.lanFree.prereqs.title}</SubTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.backup.lanFree.prereqs.items.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-1 shrink-0 bg-[#c9a84c]/40 mt-1" />
                    <div>
                      <p className="text-white text-xs font-bold mb-0.5">{item.label}</p>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#1a1a2e] border border-orange-500/20 p-5">
              <p className="text-orange-400 text-[10px] font-bold tracking-widest uppercase mb-3">{t.backup.lanFree.limits.title}</p>
              <ul className="space-y-2">
                {t.backup.lanFree.limits.items.map((item) => (
                  <li key={item} className="flex gap-2 text-gray-300 text-xs leading-relaxed">
                    <span className="text-orange-400 shrink-0">⚠</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* DR */}
          <section>
            <SectionTitle>{t.dr.title}</SectionTitle>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.dr.intro}</p>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.dr.colConcept}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.dr.colDesc}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.dr.colRepl}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.dr.colSince}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.dr.concepts.map((c, i) => (
                    <tr key={c.name} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-3 text-[#c9a84c] font-medium text-xs">{c.name}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs leading-relaxed">{c.desc}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{c.repl}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{c.since}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-[#111827] border border-[#c9a84c]/30 p-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🏛</span>
                <p className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase">{t.dr.highlight.title}</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{t.dr.highlight.desc}</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {t.dr.highlight.centers.map((center, i) => (
                  <div key={center.label} className={`border ${center.gold ? "border-[#c9a84c]/40 bg-[#c9a84c]/5" : "border-white/10 bg-white/[0.02]"} p-4 text-center relative`}>
                    {i === 0 && <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#c9a84c] text-xs z-10">⟷</div>}
                    {i === 1 && <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs z-10">→</div>}
                    <p className="text-white text-xs font-bold">{center.label}</p>
                    <p className="text-gray-500 text-[10px] mt-1">{center.sub}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2">
                {t.dr.highlight.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-gray-300 text-xs leading-relaxed">
                    <span className="text-[#c9a84c] shrink-0">✓</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Fazit / Summary */}
          <section>
            <SectionTitle>{t.conclusion.title}</SectionTitle>
            <div className="space-y-4 mb-8">
              {t.conclusion.text.split("\n\n").map((para, i) => (
                <p key={i} className="text-gray-300 text-sm leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="bg-[#111827] border border-white/10 p-5 mb-8">
              <p className="text-gray-500 text-xs leading-relaxed">{t.conclusion.note}</p>
            </div>
          </section>

          {/* CTA */}
          <div className="border-t border-white/10 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm mb-1">{t.conclusion.cta}</p>
              <p className="text-gray-500 text-xs">{t.conclusion.partner}</p>
            </div>
            <Link href="/beratung" className="shrink-0 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase">
              {t.conclusion.ctaBtn}
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#080d12] border-t border-white/10 py-6 mt-16">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Ferrion IT Systemhaus</p>
          <Link href="/" className="text-gray-600 text-xs hover:text-[#c9a84c] transition-colors">{t.conclusion.backHome}</Link>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <div className="w-1 h-6 bg-[#c9a84c] shrink-0" />
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">{children}</p>;
}

function FeatureCard({ id, title, desc }: { id: string; title: string; desc: string }) {
  return (
    <div className="bg-[#0d1117] border border-white/10 p-4 hover:border-[#c9a84c]/30 transition-colors">
      <p className="text-[9px] font-mono text-gray-600 mb-1">{id}</p>
      <p className="text-white text-xs font-bold mb-1">{title}</p>
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}
