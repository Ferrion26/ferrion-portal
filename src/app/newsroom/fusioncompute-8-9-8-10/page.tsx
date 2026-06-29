import Link from "next/link";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FusionCompute 8.9 & 8.10: Die wichtigsten Neuerungen — Ferrion Newsroom",
  description:
    "Ein technischer Überblick zu den Releases 8.9.0 und 8.10.0 RC1 – mit Schwerpunkt auf LAN-Free Backup und Disaster Recovery.",
};

const de = {
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
      { id: "FSFD-010601/010603", title: "Consistency & VM Disk Snapshot", desc: "Snapshots können nun in Batches für mehrere VMs gleichzeitig erstellt und gelöscht werden – ein klarer Vorteil bei der Administration größerer Umgebungen." },
      { id: "FSFD-020102", title: "Network QoS", desc: "Unterstützung von QoS auf dem Management-Aggregation-Port." },
      { id: "FSFD-030104", title: "Thin Provisioning of Virtual Volumes", desc: "Vorab-Allokation von Metadaten zur Verbesserung der Schreibperformance bei Thin-Provisioned-Disks." },
      { id: "FSFD-030203", title: "NoF+ mit IPv6", desc: "NoF+ jetzt mit vollständiger IPv6-Unterstützung." },
      { id: "FSFD-070203", title: "Certificate Management", desc: "CA-Zertifikatswechsel per Mausklick." },
    ],
    backupNote: "Im Bereich Backup ist für Version 8.9.0 vor allem eines wichtig: Das VM-Disk-Backup (FSFD-050301) basiert weiterhin ausschließlich auf LAN-basiertem Backup. Backup-Daten werden über das Management- bzw. ein dediziertes Backup-Netzwerk übertragen – ein LAN-freier Pfad steht in dieser Version noch nicht zur Verfügung.",
  },

  v810: {
    title: "Version 8.10.0 RC1: Die wichtigsten Neuerungen",
    intro: "Version 8.10.0 RC1 erbt alle Funktionen von 8.9.0 und früheren Versionen und ergänzt diese um zahlreiche neue und überarbeitete Features.",
    features: [
      { title: "LAN-Free Backup für virtualisierten Storage", desc: "DCS unterstützt nun LAN-freies Backup – Backup-Server greifen direkt auf den Storage zu, ohne den FusionCompute-Host und das LAN-/Management-Netzwerk zu belasten." },
      { title: "Kunpeng-Hardwarefehlererkennung", desc: "Verbesserte Erkennung von Kunpeng-CPU-Kernfehlern und Memory-UCE-Fehlern für höhere Zuverlässigkeit." },
      { title: "One-Click-Performance-Modus", desc: "Performance-Modus für Kerntransaktionssysteme lässt sich mit einem Klick aktivieren." },
      { title: "RADIUS-Authentifizierung für NCE", desc: "FusionCompute-Login kann Authentifizierungsanfragen an einen RADIUS-Server weiterleiten." },
      { title: "Virtuelle Shared Disks für WSFC", desc: "Unterstützung beim Aufbau von Windows Server Failover Cluster (WSFC) durch virtuelle gemeinsame Disks." },
      { title: "Automatische Migration/HA bei Memory-CE-Storms", desc: "Bei einem Memory-CE-Storm wird ein Alarm ausgelöst; betroffene VMs werden per HA oder Migration auf andere Hosts verschoben." },
      { title: "NUMA-Affinität", desc: "VM-CPUs werden bei Start, Migration und HA bevorzugt demselben NUMA-Knoten zugewiesen; Lastverteilung über NUMA-Knoten zur Laufzeit." },
      { title: "Live-Migration & HA mit Core-Binding (GaussDB)", desc: "Live-Migration und HA sind nun auch bei manuellem oder dynamischem Core-Binding in GaussDB-Szenarien möglich." },
    ],
  },

  backup: {
    title: "Deep Dive: LAN-Based vs. LAN-Free Backup",
    intro: "Der vielleicht spannendste Sprung zwischen 8.9 und 8.10 betrifft das Thema Backup. Während VM-Disk-Backups in 8.9.0 ausschließlich über das LAN abgewickelt werden, führt 8.10.0 erstmals LAN-freies Backup für virtualisierten Storage ein.",
    lanBased: {
      title: "LAN-Based Backup (Version 8.9.0)",
      desc: "Beim LAN-basierten Backup läuft der Datenverkehr für das VM-Disk-Backup über das Management- bzw. ein dediziertes Backup-Netzwerk: Die Daten werden vom Storage zum FusionCompute-Host (CNA) gelesen und von dort über das LAN an den Backup-Server (z. B. eBackup) übertragen. Das bedeutet, dass jedes Backup zusätzliche CPU- und Netzwerk-Ressourcen auf dem Host bindet und Bandbreite im Management-Netzwerk verbraucht.",
      flow: ["Storage", "FusionCompute Host (CNA)", "LAN / Backup-Netzwerk", "Backup-Server (eBackup)"],
    },
    lanFree: {
      title: "LAN-Free Backup (ab Version 8.10.0)",
      desc: "Mit Version 8.10.0 kann der Backup-Server direkt über ein dediziertes Storage-Netzwerk auf den Storage zugreifen – am FusionCompute-Host und am regulären LAN vorbei. Dadurch wird der Host für das Backup nicht mehr belastet, und das Management-Netzwerk bleibt frei für andere Aufgaben.",
      flow: ["Storage", "dediziertes Storage-Netzwerk", "Backup-Server (direkt)"],
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
    concepts: [
      { name: "Storage-Replikations-basierte DR", desc: "Nutzt die Remote-Replikation der Huawei-Storage-Geräte. UltraVR repliziert die VM-Konfiguration und verwaltet die DR-Pläne.", repl: "asynchron / synchron", since: "FC 6.5.0" },
      { name: "eVol-Storage-basierte Replikations-DR", desc: "Unterstützt eVol-Datastores mit zentralisiertem Huawei-Storage. UltraVR übernimmt VM-Konfigurationsreplikation und DR-Orchestrierung.", repl: "asynchron / synchron", since: "FC 8.7.0" },
      { name: "Metropolitan Active-Active DR", desc: "Zwei Standorte verarbeiten gleichzeitig Workloads mit nahezu null RPO. Basiert auf HyperMetro-Technologie.", repl: "synchron (Active-Active)", since: "FC 8.6.0" },
    ],
    highlight: {
      title: "Highlight: Two-Site and Three-Center DR",
      desc: "Das eigentliche Highlight im DR-Umfeld ist die Two-Site-and-Three-Center-Lösung. Sie kombiniert die Metropolitan-Active-Active-DR zwischen Produktionszentrum und einem Intra-City-DR-Zentrum mit einer Array-basierten Replikations-DR vom Active-Active-Rechenzentrum zu einem entfernten Remote-DR-Zentrum.",
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
    text: `Version 8.9.0 legt mit Topology-Aware vCPU Scheduling, VM Disk Encryption, Microsegmentation und einer Reihe von Snapshot-Verbesserungen die Basis für eine performantere und sicherere Plattform. Version 8.10.0 RC1 baut darauf auf und bringt mit LAN-Free Backup, NUMA-Affinität und verbesserter Hardwarefehlererkennung weitere wichtige Bausteine für den produktiven Betrieb großer, hochverfügbarer Umgebungen.

Insbesondere die Einführung von LAN-Free Backup ist für Techniker ein relevanter Architekturwechsel: Backups belasten ab 8.10.0 unter den genannten Voraussetzungen nicht mehr Host und LAN, sondern laufen direkt über das Storage-Netzwerk. Auf der DR-Seite rundet die Two-Site-and-Three-Center-Lösung das Bild ab und erlaubt einen mehrstufigen Schutz über drei Rechenzentren hinweg.`,
    note: "Hinweis: Dieser Beitrag basiert auf den Release Notes zu FusionCompute 8.9.0 und 8.10.0 RC1 sowie der Virtualization Feature List 8.9.0. Für detaillierte Fragen zu Konfiguration und Kompatibilität wenden Sie sich bitte an die Huawei-Ansprechpartner.",
    cta: "Haben Sie Fragen zu FusionCompute oder Huawei-Infrastruktur? Wir beraten Sie gerne.",
    ctaBtn: "Beratung anfragen →",
  },
};

export default function FusionComputeArticle() {
  const t = de; // always DE for this article

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/" className="mr-6">
          <img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" />
        </Link>
        <div className="h-5 w-px bg-white/20 mr-6" />
        <Link href="/#newsroom" className="text-xs text-gray-400 hover:text-[#c9a84c] transition-colors tracking-widest uppercase">
          {t.back}
        </Link>
      </header>

      <main className="pt-16">
        {/* Hero */}
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

            <div className="bg-[#1a2332] border border-[#c9a84c]/20 p-5 rounded-sm">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#c9a84c] mb-2">Backup in 8.9.0</p>
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
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">Funktion</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">Beschreibung / Nutzen</th>
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
              {/* LAN-Based */}
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
                  <p className="text-red-400 text-[10px]">Host-CPU & LAN-Bandbreite werden belastet</p>
                </div>
              </div>

              {/* LAN-Free */}
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
                  <p className="text-green-400 text-[10px]">Host & LAN entlastet — direkter Storage-Zugriff</p>
                </div>
              </div>
            </div>

            {/* Voraussetzungen */}
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

            {/* Einschränkungen */}
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

          {/* Disaster Recovery */}
          <section>
            <SectionTitle>{t.dr.title}</SectionTitle>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.dr.intro}</p>

            <div className="overflow-x-auto mb-10">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">DR-Konzept</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">Beschreibung</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">Replikation</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">Seit</th>
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

            {/* Two-Site Three-Center Highlight */}
            <div className="bg-[#111827] border border-[#c9a84c]/30 p-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🏛</span>
                <p className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase">{t.dr.highlight.title}</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{t.dr.highlight.desc}</p>

              {/* 3-Center Visual */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { label: "Produktionszentrum", sub: "Active", color: "border-[#c9a84c]/40 bg-[#c9a84c]/5" },
                  { label: "Intra-City DR", sub: "Active (HyperMetro)", color: "border-[#c9a84c]/40 bg-[#c9a84c]/5" },
                  { label: "Remote DR", sub: "Async Replikation", color: "border-white/10 bg-white/[0.02]" },
                ].map((center, i) => (
                  <div key={center.label} className={`border ${center.color} p-4 text-center relative`}>
                    {i < 2 && (
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[#c9a84c] text-xs z-10">⟷</div>
                    )}
                    {i === 1 && (
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs z-10">→</div>
                    )}
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

          {/* Fazit */}
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
              <p className="text-gray-500 text-xs">Ferrion — IT-Systemhaus · Huawei Gold Partner</p>
            </div>
            <Link
              href="/#kontakt"
              className="shrink-0 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-5 py-2.5 text-xs font-bold tracking-widest uppercase"
            >
              {t.conclusion.ctaBtn}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="bg-[#080d12] border-t border-white/10 py-6 mt-16">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Ferrion IT Systemhaus</p>
          <Link href="/" className="text-gray-600 text-xs hover:text-[#c9a84c] transition-colors">← Zurück zur Homepage</Link>
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
  return (
    <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">{children}</p>
  );
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
