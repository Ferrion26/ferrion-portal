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
  return articleMetadata("pure-storage-ki-plattform", searchParams);
}

const content = {
  de: {
    tag: "Pure Storage",
    date: "1. Oktober 2025",
    readTime: "6 Min. Lesezeit",
    headline: "Pure Storage: Die Plattform für das KI-Zeitalter — Innovationen für Ihre Datenstrategie von morgen",
    intro: "Die digitale Transformation schreitet unaufhaltsam voran — und mit ihr steigen die Anforderungen an moderne Speicherlösungen. Unternehmen stehen heute vor der Herausforderung, riesige Datenmengen effizient zu verwalten, KI-Workloads performant zu betreiben und gleichzeitig höchste Sicherheitsstandards zu erfüllen. Pure Storage begegnet diesen Anforderungen mit einer Plattform, die speziell für das KI-Zeitalter entwickelt wurde: intelligent, skalierbar, cloud-native und zukunftssicher.",
    sections: [
      {
        title: "Next-Gen FlashArray™: Leistung, die Maßstäbe setzt",
        body: `Die neuen FlashArray™-Systeme, insbesondere das FlashArray//XL™ und das brandneue FlashArray//ST™, bieten eine revolutionäre Performance für anspruchsvolle Unternehmens-Workloads. Mit einem schnelleren Controller und optimierter Architektur liefern sie Spitzenleistung für datenintensive Anwendungen — von Datenbanken über virtuelle Maschinen bis hin zu KI-Modellen.\n\nWas diese Systeme besonders macht:\n\n**Pure Fusion™ Integration:** Die intelligente Steuerungsebene erlaubt eine zentrale Verwaltung über alle Speicherumgebungen hinweg — ob lokal oder in der Cloud.\n**Erweiterte SLAs:** Kunden profitieren von garantierter Verfügbarkeit und vorhersehbaren Ergebnissen.\n**Automatisierung und Effizienz:** Routineaufgaben werden automatisiert, sodass sich IT-Teams auf strategische Themen konzentrieren können.`,
      },
      {
        title: "Pure Storage Cloud Azure Native: Die Cloud, wie sie sein sollte",
        body: `Mit der Pure Storage Cloud Azure Native Lösung bringt Pure Storage seine bewährte Speichertechnologie direkt in die Microsoft Azure Cloud. Unternehmen erhalten damit:\n\n**Native Integration:** Volle Kontrolle über Datenmanagement und Sicherheit in Azure-Workloads.\n**Skalierbarkeit und Flexibilität:** Optimal für KI- und Datenanalyseprojekte.\n**Einheitliche Benutzererfahrung:** Über On-Premises und Cloud hinweg — ohne Kompromisse bei Performance oder Sicherheit.\n\nDiese Lösung ist ideal für Unternehmen, die hybride oder vollständig cloudbasierte Architekturen betreiben und dabei keine Abstriche bei Effizienz und Governance machen wollen.`,
      },
      {
        title: "Intelligente Steuerung & vereinheitlichte Datenebene",
        body: `Die Pure Storage Plattform bietet eine intelligente Steuerungsebene, die es ermöglicht, Daten über alle Speicherorte hinweg zu verwalten — ohne die Komplexität traditioneller Speicherarchitekturen. Die vereinheitlichte Datenebene sorgt dafür, dass Daten konsistent, performant und sicher verfügbar sind — unabhängig davon, ob sie lokal, in der Cloud oder hybrid gespeichert sind.`,
      },
      {
        title: "Cyber Resilience und Zukunftssicherheit",
        body: `In Zeiten zunehmender Cyberbedrohungen ist Resilienz ein Muss. Pure Storage setzt hier neue Standards:\n\n**Ransomware-Schutz:** Integrierte Sicherheitsfunktionen schützen kritische Daten.\n**Nicht-disruptive Upgrades:** Speicher kann erweitert oder aktualisiert werden — ohne Ausfallzeiten.\n**As-a-Service-Modell:** Eine flexible, skalierbare Lösung mit planbaren Kosten und minimalem Verwaltungsaufwand.`,
      },
      {
        title: "Fazit: Eine Plattform, die mitdenkt — für Ihre Zukunft",
        body: `Pure Storage liefert nicht nur Speicher — sondern eine strategische Plattform, die Unternehmen dabei unterstützt, ihre Daten intelligent zu nutzen, Innovationen zu beschleunigen und Risiken zu minimieren. Für Kunden bedeutet das:\n\n**Mehr Agilität** bei der Umsetzung von KI-Strategien.\n**Weniger Komplexität** in der IT-Infrastruktur.\n**Höhere Sicherheit und bessere Performance** — heute und morgen.\n\nAls zertifizierter Pure Storage Partner stehen wir Ihnen jederzeit gerne für ein persönliches Gespräch zur Verfügung — ob technische Fragen, strategische Beratung oder konkrete Projektplanung.`,
      },
    ],
    facts: [
      { label: "Architektur", value: "All-Flash" },
      { label: "Modelle", value: "//XL & //ST" },
      { label: "Betrieb", value: "Hybrid & Cloud" },
      { label: "Upgrades", value: "Zero-Downtime" },
    ],
    cta: "Pure Storage Beratung anfragen →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    tag: "Pure Storage",
    date: "October 1, 2025",
    readTime: "6 min read",
    headline: "Pure Storage: The Platform for the AI Era — Innovations for Tomorrow's Data Strategy",
    intro: "Digital transformation is advancing inexorably — and with it, the demands on modern storage solutions are rising. Today, companies face the challenge of managing vast amounts of data efficiently, running AI workloads with high performance and meeting the highest security standards at the same time. Pure Storage addresses these demands with a platform built specifically for the AI era: intelligent, scalable, cloud-native and future-proof.",
    sections: [
      {
        title: "Next-Gen FlashArray™: Performance That Sets the Benchmark",
        body: `The new FlashArray™ systems, in particular the FlashArray//XL™ and the brand-new FlashArray//ST™, offer revolutionary performance for demanding enterprise workloads. With a faster controller and optimised architecture, they deliver top-tier performance for data-intensive applications — from databases through virtual machines to AI models.\n\nWhat makes these systems special:\n\n**Pure Fusion™ integration:** The intelligent control plane enables central management across all storage environments — whether on-premises or in the cloud.\n**Enhanced SLAs:** Customers benefit from guaranteed availability and predictable results.\n**Automation and efficiency:** Routine tasks are automated so IT teams can focus on strategic topics.`,
      },
      {
        title: "Pure Storage Cloud Azure Native: The Cloud As It Should Be",
        body: `With the Pure Storage Cloud Azure Native solution, Pure Storage brings its proven storage technology directly into the Microsoft Azure cloud. Companies gain:\n\n**Native integration:** Full control over data management and security within Azure workloads.\n**Scalability and flexibility:** Ideal for AI and data analytics projects.\n**Unified user experience:** Across on-premises and cloud — with no compromise on performance or security.\n\nThis solution is ideal for companies running hybrid or fully cloud-based architectures that don't want to make compromises on efficiency and governance.`,
      },
      {
        title: "Intelligent Control & Unified Data Plane",
        body: `The Pure Storage platform offers an intelligent control plane that makes it possible to manage data across all storage locations — without the complexity of traditional storage architectures. The unified data plane ensures that data is available consistently, performantly and securely — regardless of whether it is stored locally, in the cloud or hybrid.`,
      },
      {
        title: "Cyber Resilience and Future-Readiness",
        body: `In times of increasing cyber threats, resilience is a must. Pure Storage sets new standards here:\n\n**Ransomware protection:** Integrated security functions protect critical data.\n**Non-disruptive upgrades:** Storage can be expanded or updated — without downtime.\n**As-a-service model:** A flexible, scalable solution with predictable costs and minimal management overhead.`,
      },
      {
        title: "Conclusion: A Platform That Thinks Ahead — for Your Future",
        body: `Pure Storage delivers not just storage — but a strategic platform that helps companies use their data intelligently, accelerate innovation and minimise risk. For customers, this means:\n\n**More agility** in implementing AI strategies.\n**Less complexity** in IT infrastructure.\n**Higher security and better performance** — today and tomorrow.\n\nAs a certified Pure Storage partner, we are always happy to provide a personal consultation — whether technical questions, strategic advice or concrete project planning.`,
      },
    ],
    facts: [
      { label: "Architecture", value: "All-Flash" },
      { label: "Models", value: "//XL & //ST" },
      { label: "Operation", value: "Hybrid & Cloud" },
      { label: "Upgrades", value: "Zero-Downtime" },
    ],
    cta: "Request Pure Storage Consultation →",
    back: "← Back to Newsroom",
  },
};

function renderBody(text: string) {
  return text.split("\n\n").map((para, i) => {
    const lines = para.split("\n").map((line, j) => {
      const html = line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong class="text-white">${t}</strong>`);
      const isBullet = line.startsWith("**");
      return (
        <p
          key={j}
          className={`text-gray-400 text-sm leading-relaxed mb-2 ${isBullet ? "pl-5 border-l border-[#c9a84c]/30" : ""}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
    return <div key={i} className="mb-4">{lines}</div>;
  });
}

export default function PureStoragePlatformArticle({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <ArticleJsonLd slug="pure-storage-ki-plattform" locale={locale} />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mb-12 border border-white/5">
            {t.facts.map((f) => (
              <div key={f.label} className="bg-[#0d1117] px-5 py-4 text-center">
                <p className="text-xl font-bold text-[#c9a84c]">{f.value}</p>
                <p className="text-gray-500 text-[10px] mt-1">{f.label}</p>
              </div>
            ))}
          </div>
          {t.sections.map((s) => (
            <div key={s.title} className="mb-10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <span className="inline-block w-4 h-px bg-[#c9a84c] shrink-0" />
                {s.title}
              </h2>
              {renderBody(s.body)}
            </div>
          ))}
          <div className="mt-14 border-t border-white/10 pt-10">
            <Link href="/beratung" className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors">
              {t.cta}
            </Link>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
