import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { articleMetadata } from "@/lib/seo";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return articleMetadata("vmware-migration-huawei-dcs", searchParams);
}

const content = {
  de: {
    tag: "Virtualisierung",
    date: "9. Juni 2026",
    readTime: "9 Min. Lesezeit",
    headline: "Von VMware zu Huawei DCS: Wie eine Migration wirklich abläuft — Woche für Woche",
    intro: "Über Alternativen zu VMware wird viel geschrieben. Über die Migration selbst erstaunlich wenig — und wenn, dann meist in der Tonlage „reibungslos und in wenigen Tagen erledigt“. Das ist nicht unsere Erfahrung. Eine Migration ist gut planbar, aber sie ist Arbeit, sie hat Wartungsfenster, und es gibt Systeme, die man besser nicht anfasst.",
    facts: [
      { label: "DCIG-Bewertung 2024–25", value: "Top 5 von 24" },
      { label: "Einstiegsgröße", value: "ab 2 Knoten" },
      { label: "Typische Projektdauer", value: "8–12 Wochen" },
      { label: "Kostenlose Umgebungsanalyse", value: "60 Min." },
    ],
    series: {
      label: "Teil 2 / 2",
      note: "Noch nicht sicher, ob sich der Wechsel überhaupt lohnt?",
      linkLabel: "Zurück zu: VMware-Kosten 2026",
      href: "/newsroom/vmware-kosten-2026",
    },
    sections: [
      {
        title: "Was Huawei DCS technisch ist",
        body: `Damit die Ausgangslage klar ist, kurz zur Plattform. Huawei DCS (Datacenter Virtualization Solution) ist eine vollständige Virtualisierungsplattform. Kern ist FusionCompute mit dem UVP-Hypervisor auf KVM-Basis — derselbe Unterbau, den auch Proxmox verwendet, allerdings als Bare-Metal-Architektur ohne zwischengeschaltetes Host-Betriebssystem, ähnlich wie ESXi.\n\nDie wesentlichen Bestandteile:\n\n- **CNA (Computing Node Agent):** läuft auf jedem physischen Server, stellt den Hypervisor bereit, verwaltet die VMs lokal.\n- **VRM (Virtual Resource Manager):** die zentrale Verwaltungsinstanz — Ressourcenplanung, VM-Lebenszyklus, IP- und VLAN-Zuordnung, Weboberfläche. Läuft aktiv/passiv mit automatischer Übernahme innerhalb von ein bis zwei Minuten.\n- **eDME:** übergreifendes Management über den gesamten DCS-Stack.\n- **UltraVR:** orchestrierte Wiederherstellung über mehrere Standorte, inklusive Aktiv-Aktiv-Szenarien mit automatisiertem Failover — funktional das Gegenstück zum Site Recovery Manager, der bei VMware ein kostenpflichtiges Zusatzprodukt ist.\n- **eBackup:** inkrementelle Sicherung über Changed Block Tracking.\n\nZwei Eigenschaften sind für den Mittelstand besonders relevant: Die Plattform startet ab zwei Knoten und wächst mit — Sie müssen also nicht in eine Enterprise-Dimension einsteigen, um überhaupt anfangen zu können. Und die Data Center Intelligence Group hat DCS in ihrem Bericht „2024–25 TOP 5 Enterprise VMware vSphere Alternatives“ unter die fünf besten von 24 untersuchten Lösungen eingeordnet, mit Stärken bei Flexibilität, Leistung und Verfügbarkeit.`,
      },
      {
        title: "Der Ablauf: Woche für Woche",
        body: `Der folgende Plan beschreibt eine typische Umgebung im österreichischen Mittelstand: vier Hosts, rund 60 virtuelle Maschinen, ein Standort, ein zweiter Raum für die Sicherung.\n\n**Woche 0 — Aufnahme und Entscheidung.** Bevor irgendetwas gekauft wird, wird inventarisiert — vollständig, nicht ungefähr: alle VMs mit Betriebssystem, Ressourcen, Abhängigkeiten und Betriebszeiten; tatsächlich genutzte VMware-Funktionen; Third-Party-Software mit Anbindung an die Virtualisierungsschicht; Anwendungen mit Herstellerzertifizierung auf ESXi; realistisch verfügbare Wartungsfenster. Das häufigste Überraschungsergebnis: ein Skript oder Automatisierungsprozess, den seit Jahren niemand angefasst hat und der direkt gegen die vCenter-Schnittstelle arbeitet — besser jetzt gefunden als in Woche 6. Ergebnis: Zielarchitektur, Migrationswellen, Risikoliste, Rückfallplan.\n\n**Woche 1–2 — Aufbau der Zielumgebung.** Die neue Plattform wird parallel aufgebaut, die alte läuft unangetastet weiter. Das ist der wichtigste Punkt des gesamten Vorgehens: Es gibt keinen Stichtag, an dem umgeschaltet wird, sondern einen Zeitraum, in dem zwei Plattformen parallel laufen. In diesen zwei Wochen: Hardware aufbauen und verkabeln, Hypervisor installieren, Cluster bilden, Storage anbinden, Netzwerk konfigurieren, Verwaltungsschicht aufsetzen, Sicherung und Monitoring anbinden, Berechtigungen einrichten. Am Ende steht ein funktionsfähiger Zielcluster ohne produktive Last.\n\n**Woche 3 — Pilotmigration.** Fünf bis zehn unkritische VMs wandern, bewusst gewählt: eine Windows-VM, eine Linux-VM, eine mit hohem I/O, eine mit Fachanwendung, eine mit ungewöhnlicher Netzwerkkonfiguration. Gemessen wird die tatsächliche Übertragungsdauer pro Gigabyte, das Verhalten nach dem Treiberwechsel, ob Lizenzbindungen anschlagen, ob Sicherung und Monitoring die migrierte VM sauber erfassen. Erst nach der Pilotwoche steht der belastbare Zeitplan — alles davor ist Schätzung.\n\n**Woche 4–8 — Migration in Wellen.** Die produktiven Systeme wandern in Gruppen, sortiert nach Abhängigkeit und Wartungsfenster: zuerst Test- und Entwicklungssysteme, dann interne Dienste, dann Fachanwendungen, zuletzt Datenbanken und alles, was mit Produktion oder ERP zusammenhängt. Pro Welle: Migration im Wartungsfenster, Funktionsprüfung durch den Fachbereich am Folgetag, dann erst die nächste Welle. Wer zwei Wellen in einem Wochenende macht, spart einen Tag und riskiert eine Woche.\n\n**Woche 9 — Abnahme und Rückbau.** Funktionsprüfung, Wiederherstellungstest aus der Sicherung — nicht optional, das ist der Moment, in dem sich zeigt, ob die neue Sicherungskette wirklich funktioniert —, Dokumentation, Übergabe, dann Rückbau der Altumgebung. Die Altumgebung wird nicht sofort abgebaut: Planen Sie zwei bis vier Wochen Nachlauf ein, in denen die alten Hosts noch stehen. Das ist Ihr Rückfallszenario und kostet nur Strom.`,
      },
    ],
    downtime: {
      title: "Ausfallzeiten: die ehrliche Antwort",
      intro: "Für eine Kaltmigration — VM herunterfahren, Datenträger übertragen, auf der Zielplattform starten — gilt als Faustregel:",
      colSize: "VM-Größe",
      colWindow: "Realistisches Wartungsfenster",
      rows: [
        ["bis 100 GB", "20–40 Minuten"],
        ["100–500 GB", "45–90 Minuten"],
        ["über 1 TB", "2–4 Stunden, abhängig vom Netzwerk"],
      ],
      note: "Die dominierende Größe ist die Übertragungsgeschwindigkeit zwischen Quell- und Zielspeicher, nicht die Software. Mit 10-Gigabit-Anbindung sieht die Rechnung deutlich freundlicher aus als mit 1 Gigabit — dieser eine Punkt entscheidet oft darüber, ob ein Wochenende reicht oder drei. Für Systeme, die kein Wartungsfenster erlauben, gibt es Verfahren mit Datenspiegelung und kurzem Umschaltmoment. Die sind aufwendiger in der Vorbereitung und werden gezielt für einzelne Systeme eingesetzt, nicht für sechzig.",
    },
    section2: {
      title: "Sechs Stellen, an denen es unangenehm wird",
      body: `**1. Der Treiberwechsel im Gastsystem.** Die virtuellen Geräte ändern sich. Bei Windows bedeutet das neue Netzwerkkarten — eine statisch konfigurierte IP-Adresse kommt nicht automatisch mit. Beherrschbar, aber bei jeder VM ein Handgriff.\n\n**2. Softwarelizenzen, die an die Hardware gebunden sind.** Manche Fachanwendungen binden ihre Lizenz an Merkmale der virtuellen Maschine. Nach der Migration ist die Lizenz ungültig, der Hersteller muss sie neu ausstellen — der häufigste Grund für Verzögerungen ist die Bearbeitungszeit beim Softwarehersteller, nicht die Technik. Klären Sie das in Woche 0, nicht in Woche 5.\n\n**3. Die Sicherung.** Ihre bestehende Sicherungslösung muss die neue Plattform unterstützen — prüfen Sie das vor dem Kauf. Wenn Sie ohnehin über eine Erneuerung der Datensicherung nachdenken, ist der Migrationszeitpunkt der richtige: zwei Umstellungen in einem Projekt sind billiger als zwei Projekte.\n\n**4. Skripte und Automatisierung.** Alles, was gegen die vCenter-Schnittstelle arbeitet, muss umgeschrieben werden. In den meisten Häusern ist das weniger, als befürchtet — aber es ist nie null.\n\n**5. Die Gewöhnung der Administration.** Andere Oberfläche, andere Begriffe, andere Handgriffe. Rechnen Sie mit zwei bis drei Monaten, bis das Team wieder so schnell arbeitet wie vorher — kein Produktmangel, sondern Lernkurve, die in die Projektplanung gehört.\n\n**6. Die Dokumentation.** Betriebshandbücher, Notfallpläne und Wiederanlaufbeschreibungen beziehen sich auf die alte Plattform. Wer das nicht mitzieht, hat nach der Migration eine technisch saubere Umgebung und ein wertloses Notfallkonzept. Unter dem NISG 2026 ist das nicht nur ärgerlich, sondern ein Nachweisproblem.`,
    },
    section3: {
      title: "Was besser bleibt, wo es ist",
      body: `Nicht jede VM sollte wandern. Vier Fälle, in denen wir davon abraten:\n\n- **Anwendungen mit Herstellerzertifizierung ausschließlich auf ESXi** — häufig bei produktionsnahen Systemen, medizinischen Anwendungen und einzelnen ERP-Modulen. Ein Wechsel entwertet Ihren Supportvertrag.\n- **Tiefe NSX-Nutzung.** Wenn Mikrosegmentierung produktiv im Einsatz ist, ist der Nachbau machbar, aber ein eigenständiges Projekt.\n- **VDI über Horizon.** Eigenes Thema, eigene Entscheidung, eigener Zeitplan.\n- **Systeme kurz vor der Abschaltung.** Eine Anwendung, die in achtzehn Monaten ersetzt wird, migriert man nicht.\n\nDer Regelfall im Mittelstand ist deshalb nicht der vollständige Wechsel, sondern die geteilte Landschaft: Der Großteil wandert, ein kleiner, klar definierter Rest bleibt. Das ist kein Kompromiss aus Schwäche, sondern die wirtschaftlich richtige Antwort — Sie lizenzieren dann nur noch für die Systeme, die es wirklich brauchen.`,
    },
    raci: {
      title: "Wer macht was",
      colTask: "Aufgabe",
      colFerrion: "Ferrion",
      colCustomer: "Kunde",
      rows: [
        { task: "Aufnahme und Zielarchitektur", ferrion: "führt", customer: "liefert Informationen", emphasize: false },
        { task: "Hardwareaufbau und Grundinstallation", ferrion: "führt", customer: "stellt Raum, Strom, Netzwerk", emphasize: false },
        { task: "Netzwerkkonfiguration", ferrion: "führt", customer: "Abstimmung mit Netzwerkverantwortlichem", emphasize: false },
        { task: "Migration der VMs", ferrion: "führt", customer: "Wartungsfenster, Zustimmung Fachbereich", emphasize: false },
        { task: "Lizenzklärung mit Softwareherstellern", ferrion: "unterstützt", customer: "führt — der Vertrag liegt beim Kunden", emphasize: true },
        { task: "Funktionsprüfung der Anwendungen", ferrion: "unterstützt", customer: "führt — nur der Fachbereich kann das beurteilen", emphasize: true },
        { task: "Dokumentation und Übergabe", ferrion: "führt", customer: "nimmt ab", emphasize: false },
        { task: "Betrieb danach", ferrion: "optional über Care", customer: "oder intern", emphasize: false },
      ],
      note: "Die fett markierten Zeilen sind erfahrungsgemäß die, die Projekte verzögern. Klären Sie früh, wer beim Kunden dafür Zeit hat — nicht, wer zuständig ist.",
    },
    conclusion: {
      title: "Fazit",
      body: "Eine Migration von VMware auf Huawei DCS ist für eine mittelständische Umgebung ein Projekt von acht bis zwölf Wochen, davon vier bis sechs Wochen mit produktiven Wartungsfenstern. Sie ist gut planbar, sie ist rückrollbar, und sie erfordert eine ehrliche Bestandsaufnahme am Anfang.\n\nWas sie nicht ist: ein Wochenendprojekt, ein reines Technikthema oder etwas, das man unter Zeitdruck kurz vor dem Vertragsende erledigt. Wenn Ihr Renewal in weniger als drei Monaten liegt, verlängern Sie kurz und migrieren danach in Ruhe. Das kostet einmalig Lizenzgeld und spart Ihnen ein schlecht geplantes Projekt.",
    },
    ctaTitle: "Der nächste Schritt",
    ctaText: "Wir schauen uns Ihre Umgebung in 60 Minuten an und sagen Ihnen, welche Systeme problemlos wandern, welche Aufwand machen und welche besser bleiben. Sie bekommen eine Machbarkeitsampel auf zwei Seiten — kostenfrei und unabhängig davon, ob wir danach zusammenarbeiten.",
    ctaBtn: "Migrationscheck vereinbaren →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    tag: "Virtualization",
    date: "June 9, 2026",
    readTime: "9 min read",
    headline: "From VMware to Huawei DCS: How a Migration Really Goes — Week by Week",
    intro: "A lot gets written about alternatives to VMware. Surprisingly little gets written about the migration itself — and when it does, it's usually pitched as \"smooth and done in a few days.\" That's not our experience. A migration is very plannable, but it's work, it has maintenance windows, and there are systems you're better off not touching.",
    facts: [
      { label: "DCIG rating 2024–25", value: "Top 5 of 24" },
      { label: "Entry size", value: "from 2 nodes" },
      { label: "Typical project length", value: "8–12 weeks" },
      { label: "Free environment review", value: "60 min" },
    ],
    series: {
      label: "Part 2 / 2",
      note: "Not yet sure whether switching is even worth it?",
      linkLabel: "Back to: VMware Costs 2026",
      href: "/newsroom/vmware-kosten-2026",
    },
    sections: [
      {
        title: "What Huawei DCS Actually Is",
        body: `To set the stage, a quick look at the platform. Huawei DCS (Datacenter Virtualization Solution) is a complete virtualization platform. Its core is FusionCompute with the UVP hypervisor built on KVM — the same foundation Proxmox uses, but implemented as a bare-metal architecture with no intermediate host OS, similar to ESXi.\n\nThe key components:\n\n- **CNA (Computing Node Agent):** runs on every physical server, provides the hypervisor, manages VMs locally.\n- **VRM (Virtual Resource Manager):** the central management instance — resource planning, VM lifecycle, IP and VLAN assignment, web interface. Runs active/passive with automatic takeover within one to two minutes.\n- **eDME:** cross-cutting management across the entire DCS stack.\n- **UltraVR:** orchestrated recovery across multiple sites, including active-active scenarios with automated failover — functionally the counterpart to VMware's Site Recovery Manager, which is a paid add-on there.\n- **eBackup:** incremental backup via changed block tracking.\n\nTwo properties are particularly relevant for mid-sized companies: the platform starts at two nodes and grows with you, so you don't need to buy into an enterprise footprint just to get started. And the Data Center Intelligence Group ranked DCS among the top five of 24 solutions evaluated in its "2024–25 TOP 5 Enterprise VMware vSphere Alternatives" report, citing strengths in flexibility, performance and availability.`,
      },
      {
        title: "The Process: Week by Week",
        body: `The following plan describes a typical environment in Austrian mid-market companies: four hosts, roughly 60 virtual machines, one site, a second room for backup.\n\n**Week 0 — Discovery and decision.** Before anything is purchased, everything gets inventoried — completely, not roughly: every VM with OS, resources, dependencies and operating hours; VMware features actually in use; third-party software hooked into the virtualization layer; applications with vendor certification on ESXi; realistically available maintenance windows. The most common surprise: a script or automation process nobody has touched in years that talks directly to the vCenter API — better to find it now than in week 6. Output: target architecture, migration waves, risk list, fallback plan.\n\n**Week 1–2 — Building the target environment.** The new platform is built in parallel; the old one keeps running untouched. This is the single most important point of the whole approach: there is no cutover date where everything switches at once — there's a period where two platforms run side by side. What happens in these two weeks: racking and cabling hardware, installing the hypervisor, forming the cluster, connecting storage, configuring the network, setting up the management layer, connecting backup and monitoring, setting up permissions. At the end you have a working target cluster carrying no production load.\n\n**Week 3 — Pilot migration.** Five to ten non-critical VMs move, deliberately chosen: one Windows VM, one Linux VM, one with high I/O, one running a line-of-business application, one with an unusual network configuration. What gets measured: actual transfer time per gigabyte, behaviour after the driver swap, whether any licence bindings trigger, whether backup and monitoring pick up the migrated VM cleanly. Only after the pilot week do you have a reliable schedule — everything before that is an estimate.\n\n**Week 4–8 — Migration in waves.** Production systems move in groups, sequenced by dependency and maintenance window: first test and development systems, then internal services, then line-of-business applications, and last, databases and everything tied to production or the ERP. Per wave: migrate in the maintenance window, have the business unit verify functionality the next day, only then start the next wave. Cramming two waves into one weekend saves a day and risks a week.\n\n**Week 9 — Acceptance and decommissioning.** Functional verification, a restore test from backup — not optional, this is the moment that shows whether the new backup chain actually works —, documentation, handover, then decommissioning of the old environment. The old environment isn't torn down immediately: plan for two to four weeks of overlap where the old hosts are still standing. That's your fallback scenario, and it only costs electricity.`,
      },
    ],
    downtime: {
      title: "Downtime: The Honest Answer",
      intro: "For a cold migration — shut down the VM, transfer the disk, start it on the target platform — the rule of thumb is:",
      colSize: "VM size",
      colWindow: "Realistic maintenance window",
      rows: [
        ["up to 100 GB", "20–40 minutes"],
        ["100–500 GB", "45–90 minutes"],
        ["over 1 TB", "2–4 hours, depending on the network"],
      ],
      note: "The dominant factor is transfer speed between source and target storage, not the software. With a 10-gigabit connection the math looks considerably friendlier than with 1 gigabit — this single factor often decides whether a weekend is enough, or three are needed. For systems that can't tolerate any maintenance window, there are approaches using data mirroring with a short cutover moment. These are more involved to prepare and are used selectively for individual systems, not for sixty at once.",
    },
    section2: {
      title: "Six Places Where It Gets Uncomfortable",
      body: `**1. The driver swap inside the guest.** Virtual devices change. On Windows, that means new network adapters — a statically configured IP address doesn't automatically come along. Manageable, but it's a manual step on every single VM.\n\n**2. Software licences tied to hardware.** Some line-of-business applications bind their licence to characteristics of the virtual machine. After migration, the licence is invalid and the vendor has to reissue it — the most common cause of delays is the vendor's turnaround time, not the technology. Clarify this in week 0, not week 5.\n\n**3. Backup.** Your existing backup solution needs to support the new platform — verify this before you buy, not after. If you're already considering renewing your data protection anyway, the migration is the right moment to do it: two changes in one project are cheaper than two separate projects.\n\n**4. Scripts and automation.** Anything that talks to the vCenter API has to be rewritten. In most organisations this is less than feared — but it's never zero.\n\n**5. Administrator ramp-up.** Different interface, different terminology, different muscle memory. Budget two to three months before the team is back to its previous speed — that's not a product shortcoming, it's a learning curve, and it belongs in the project plan and in leadership's expectations.\n\n**6. Documentation.** Operations manuals, emergency plans and recovery runbooks reference the old platform. Anyone who doesn't carry these forward ends up with a technically clean environment and a worthless emergency plan after migration. Under Austria's NISG 2026, that's not just annoying — it's an evidence problem.`,
    },
    section3: {
      title: "What's Better Left Where It Is",
      body: `Not every VM should move. Four cases where we advise against it:\n\n- **Applications with vendor certification exclusively on ESXi** — common with production-adjacent systems, medical applications and individual ERP modules. Switching invalidates your support contract.\n- **Deep NSX usage.** If micro-segmentation is in production use, rebuilding it is feasible, but it's its own standalone project.\n- **VDI on Horizon.** Its own topic, its own decision, its own timeline.\n- **Systems nearing decommission.** An application being replaced in eighteen months doesn't get migrated.\n\nThe typical outcome for mid-sized companies is therefore not a full switch, but a split landscape: the bulk moves, a small, clearly defined remainder stays. That's not a compromise born of weakness — it's the economically correct answer, because you then only license the systems that genuinely need it.`,
    },
    raci: {
      title: "Who Does What",
      colTask: "Task",
      colFerrion: "Ferrion",
      colCustomer: "Customer",
      rows: [
        { task: "Discovery and target architecture", ferrion: "leads", customer: "provides information", emphasize: false },
        { task: "Hardware build and base install", ferrion: "leads", customer: "provides space, power, network", emphasize: false },
        { task: "Network configuration", ferrion: "leads", customer: "coordinates with network owner", emphasize: false },
        { task: "VM migration", ferrion: "leads", customer: "maintenance windows, business sign-off", emphasize: false },
        { task: "Licence clarification with software vendors", ferrion: "supports", customer: "leads — the contract sits with the customer", emphasize: true },
        { task: "Functional verification of applications", ferrion: "supports", customer: "leads — only the business unit can judge this", emphasize: true },
        { task: "Documentation and handover", ferrion: "leads", customer: "signs off", emphasize: false },
        { task: "Operations afterwards", ferrion: "optional via Care", customer: "or in-house", emphasize: false },
      ],
      note: "The two rows in bold are, by experience, the ones that delay projects. Clarify early who on the customer side has time for this — not just who's nominally responsible.",
    },
    conclusion: {
      title: "Summary",
      body: "For a mid-sized environment, a migration from VMware to Huawei DCS is an eight-to-twelve-week project, of which four to six weeks involve production maintenance windows. It's very plannable, it's rollback-able, and it requires an honest inventory at the start.\n\nWhat it isn't: a weekend project, a purely technical topic, or something you do under time pressure right before contract end. If your renewal is due in less than three months, renew briefly and migrate afterwards without the time pressure. That costs one-off licence money and saves you a badly planned project.",
    },
    ctaTitle: "The Next Step",
    ctaText: "We'll look at your environment in 60 minutes and tell you which systems move without issues, which take effort, and which are better left alone. You'll get a two-page feasibility traffic light — free, and regardless of whether we end up working together.",
    ctaBtn: "Schedule a Migration Check →",
    back: "← Back to Newsroom",
  },
};

function renderBody(text: string) {
  return text.split("\n\n").map((block, i) => {
    const lines = block.split("\n");
    const isList = lines.every((l) => l.startsWith("- "));
    const withBold = (line: string) =>
      line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong class="text-white">${t}</strong>`);

    if (isList) {
      return (
        <ul key={i} className="space-y-2.5 mb-4">
          {lines.map((line, j) => (
            <li key={j} className="text-gray-400 text-sm leading-relaxed flex items-start gap-2">
              <span className="text-[#c9a84c] mt-0.5 shrink-0">▸</span>
              <span dangerouslySetInnerHTML={{ __html: withBold(line.slice(2)) }} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div key={i} className="mb-4">
        {lines.map((line, j) => (
          <p key={j} className="text-gray-400 text-sm leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: withBold(line) }} />
        ))}
      </div>
    );
  });
}

export default function VMwareMigrationDCSArticle({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <ArticleJsonLd slug="vmware-migration-huawei-dcs" locale={locale} />
      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/newsroom" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
            {t.back}
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 font-bold tracking-wide uppercase">{t.tag}</span>
            <span className="text-gray-500 text-xs">{t.date}</span>
            <span className="text-gray-600 text-xs">{t.readTime}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-snug mb-6">{t.headline}</h1>
          <p className="text-gray-300 text-base leading-relaxed mb-10 border-l-2 border-[#c9a84c] pl-5">{t.intro}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mb-10 border border-white/5">
            {t.facts.map((f) => (
              <div key={f.label} className="bg-[#0d1117] px-5 py-4 text-center">
                <p className="text-xl font-bold text-[#c9a84c] break-words">{f.value}</p>
                <p className="text-gray-500 text-[10px] mt-1 leading-snug">{f.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-12 border border-white/10 px-5 py-4">
            <span className="text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase shrink-0">{t.series.label}</span>
            <span className="text-gray-400 text-xs">{t.series.note}</span>
            <Link href={t.series.href} className="text-[#c9a84c] text-xs font-bold hover:underline sm:ml-auto shrink-0">
              {t.series.linkLabel} →
            </Link>
          </div>

          {t.sections.map((s) => (
            <div key={s.title} className="mb-10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <span className="inline-block w-4 h-px bg-[#c9a84c]" />
                {s.title}
              </h2>
              {renderBody(s.body)}
            </div>
          ))}

          {/* Downtime table */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-4 h-px bg-[#c9a84c]" />
              {t.downtime.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{t.downtime.intro}</p>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.downtime.colSize}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.downtime.colWindow}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.downtime.rows.map((row, i) => (
                    <tr key={row[0]} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                      <td className="px-4 py-3 text-[#c9a84c] font-medium text-xs whitespace-nowrap">{row[0]}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs leading-relaxed">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t.downtime.note}</p>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-4 h-px bg-[#c9a84c]" />
              {t.section2.title}
            </h2>
            {renderBody(t.section2.body)}
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-4 h-px bg-[#c9a84c]" />
              {t.section3.title}
            </h2>
            {renderBody(t.section3.body)}
          </div>

          {/* RACI table */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-4 h-px bg-[#c9a84c]" />
              {t.raci.title}
            </h2>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.raci.colTask}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.raci.colFerrion}</th>
                    <th className="text-left px-4 py-3 text-gray-500 text-xs font-bold tracking-widest uppercase">{t.raci.colCustomer}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.raci.rows.map((row, i) => (
                    <tr key={row.task} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""} ${row.emphasize ? "bg-[#c9a84c]/[0.05]" : ""}`}>
                      <td className={`px-4 py-3 text-xs ${row.emphasize ? "text-white font-bold" : "text-gray-300 font-medium"}`}>{row.task}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{row.ferrion}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs leading-relaxed">{row.customer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">{t.raci.note}</p>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <span className="inline-block w-4 h-px bg-[#c9a84c]" />
              {t.conclusion.title}
            </h2>
            {renderBody(t.conclusion.body)}
          </div>

          <div className="mt-14 border-t border-white/10 pt-10">
            <h2 className="text-lg font-bold text-white mb-3">{t.ctaTitle}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-2xl">{t.ctaText}</p>
            <Link href="/beratung" className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors">
              {t.ctaBtn}
            </Link>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
