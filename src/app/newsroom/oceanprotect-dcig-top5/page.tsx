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
  return articleMetadata("oceanprotect-dcig-top5", searchParams);
}

const content = {
  de: {
    tag: "Huawei",
    date: "16. Juli 2026",
    readTime: "5 Min. Lesezeit",
    headline: "Huawei OceanProtect unter den DCIG TOP 5 Cyber Resilient PBBAs 2026–27",
    intro: "Die Data Center Intelligence Group (DCIG) hat ihren Report 2026–27 veröffentlicht — und Huaweis OceanProtect-Datensicherungslösungen zählen zu den fünf widerstandsfähigsten Backup-Appliances weltweit. Die Auszeichnung ist mehr als eine Formsache: DCIG hat über 250 Merkmale von 35 marktführenden Backup-Appliances geprüft, erstmals inklusive All-Flash-Hardware und KI-gestützter Bedrohungsanalyse als eigene Bewertungskriterien.",
    sections: [
      {
        title: "1. Der Hintergrund: Ransomware ist längst Alltag",
        body: `Laut mehreren im Report zitierten Umfragen waren über 80 % der Unternehmen im vergangenen Jahr von einem Ransomware-Angriff betroffen. Backup-Appliances sind damit nicht mehr nur Datensicherung im klassischen Sinn, sondern die letzte Verteidigungslinie, wenn alle anderen Schutzmechanismen versagt haben.\n\nGenau deshalb hat DCIG seine Bewertungskriterien für 2026–27 erweitert: Neben klassischen Backup- und Recovery-Kennzahlen fließen erstmals All-Flash-Hardware-Deployment und KI-basierte Bedrohungsanalyse in die Bewertung ein — ein Signal, wohin sich der Markt für Cyber-Resilienz entwickelt.`,
      },
      {
        title: "2. Die Platzierungen im Detail",
        body: `Zwei Modelle aus der OceanProtect-Familie wurden ausgezeichnet:\n\n**OceanProtect X9000 Backup Appliance:** Platz 1 in der Kategorie All-Flash Edition — bewertet nach Recovery-Performance.\n**OceanProtect X6000 Backup Appliance:** Platz 1 in der Kategorie 3PB+ Logical Global Edition — bewertet nach Kosteneffizienz.\n\nDamit belegt Huawei in zwei unterschiedlichen Einsatzszenarien — performancekritische All-Flash-Umgebungen und großskalige Multi-Petabyte-Landschaften — jeweils die Spitzenposition.`,
      },
      {
        title: "3. Was die Lösung technisch leistet",
        body: `Die Basis der Auszeichnung ist eine integrierte Hardware-Software-Lösung mit mehrschichtigem Schutzkonzept:\n\n**Air-Gap-Technologie:** Physische Isolation mit automatischen Isolationsrichtlinien verhindert die laterale Ausbreitung von Ransomware im Netzwerk.\n**Mehrschichtige Erkennung:** Kombination aus Ransomware-Signaturerkennung und I/O-Verhaltensanalyse mit einer Erkennungsgenauigkeit von 99,99 %.\n**All-Flash-Architektur:** Skalierung auf bis zu 16 Knoten im Cluster, 200 TB/h Backup-Durchsatz und 100 TB/h Recovery-Bandbreite.\n**Datenreduktion:** Bis zu 90:1 Kompressionsverhältnis durch Preprocessing, Deduplizierung, Feature-Kompression und Space Reduction.\n**Active-Active-HA-Design:** Durchgängiger Datenschutz im 24/7-Betrieb ohne Unterbrechung.`,
      },
      {
        title: "Fazit: Cyber-Resilienz ist keine Kür mehr",
        body: `Die DCIG-Platzierung bestätigt, was sich im Markt längst abzeichnet: Backup-Appliances müssen heute mehr leisten als reine Datensicherung — sie müssen aktiv gegen Ransomware bestehen, dabei performant genug für All-Flash-Workloads sein und sich wirtschaftlich in großskalige Umgebungen einfügen. Mit OceanProtect X9000 und X6000 zeigt Huawei, dass sich diese drei Anforderungen nicht gegenseitig ausschließen.\n\nAls zertifizierter Huawei-Partner beraten wir Sie gerne dazu, wie sich OceanProtect in Ihre bestehende Backup- und Security-Strategie integrieren lässt.`,
      },
    ],
    facts: [
      { label: "Erkennungsgenauigkeit", value: "99,99 %" },
      { label: "Backup-Durchsatz", value: "200 TB/h" },
      { label: "Datenreduktion", value: "bis 90:1" },
      { label: "Cluster-Skalierung", value: "16 Knoten" },
    ],
    cta: "Beratung zu OceanProtect anfragen →",
    back: "← Zurück zum Newsroom",
    source: "Quelle: Huawei",
  },
  en: {
    tag: "Huawei",
    date: "July 16, 2026",
    readTime: "5 min read",
    headline: "Huawei OceanProtect Named Among the DCIG TOP 5 Cyber Resilient PBBAs 2026–27",
    intro: "The Data Center Intelligence Group (DCIG) has published its 2026–27 report — and Huawei's OceanProtect data protection solutions rank among the five most cyber resilient backup appliances worldwide. The recognition is more than a formality: DCIG evaluated more than 250 features across 35 mainstream backup appliances globally, for the first time including all-flash storage hardware deployment and AI-based threat analysis as dedicated evaluation criteria.",
    sections: [
      {
        title: "1. The Backdrop: Ransomware Is Now Business as Usual",
        body: `According to multiple surveys cited in the report, over 80% of enterprises experienced a ransomware attack in the past year. Backup appliances are therefore no longer just data protection in the classic sense — they are the last line of defence once every other safeguard has failed.\n\nThat is exactly why DCIG expanded its evaluation criteria for 2026–27: alongside classic backup and recovery metrics, all-flash hardware deployment and AI-based threat analysis now factor into the assessment for the first time — a clear signal of where the cyber-resilience market is heading.`,
      },
      {
        title: "2. The Rankings in Detail",
        body: `Two models from the OceanProtect family were recognised:\n\n**OceanProtect X9000 Backup Appliance:** Ranked #1 in the All-Flash Edition category, evaluated for recovery performance.\n**OceanProtect X6000 Backup Appliance:** Ranked #1 in the 3PB+ Logical Global Edition category, evaluated for cost-effectiveness.\n\nHuawei therefore takes the top spot in two distinct deployment scenarios — performance-critical all-flash environments and large-scale multi-petabyte landscapes.`,
      },
      {
        title: "3. What the Solution Delivers Technically",
        body: `The recognition rests on an integrated hardware-software solution with a multi-layer protection concept:\n\n**Air Gap technology:** Physical isolation with automatic isolation policies prevents the lateral spread of ransomware across the network.\n**Multi-layer detection:** A combination of ransomware signature identification and I/O behaviour anomaly detection reaching 99.99% accuracy.\n**All-flash architecture:** Scale-out to a 16-node cluster, 200 TB/hour backup throughput and 100 TB/hour recovery bandwidth.\n**Data reduction:** Up to a 90:1 compression ratio through preprocessing, deduplication, feature compression and space reduction.\n**Active-active HA design:** Uninterrupted 24/7 data protection.`,
      },
      {
        title: "Conclusion: Cyber Resilience Is No Longer Optional",
        body: `The DCIG ranking confirms a trend that has been building across the market: backup appliances today must do more than plain data protection — they must actively withstand ransomware, remain performant enough for all-flash workloads, and scale economically into large environments. With the OceanProtect X9000 and X6000, Huawei shows that these three requirements are not mutually exclusive.\n\nAs a certified Huawei partner, we are happy to advise you on how OceanProtect fits into your existing backup and security strategy.`,
      },
    ],
    facts: [
      { label: "Detection accuracy", value: "99.99%" },
      { label: "Backup throughput", value: "200 TB/h" },
      { label: "Data reduction", value: "up to 90:1" },
      { label: "Cluster scale-out", value: "16 nodes" },
    ],
    cta: "Request OceanProtect Consultation →",
    back: "← Back to Newsroom",
    source: "Source: Huawei",
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

export default function OceanProtectDcigArticle({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <ArticleJsonLd slug="oceanprotect-dcig-top5" locale={locale} />
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
            <Link href="/beratung" className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors mb-6">
              {t.cta}
            </Link>
            <p className="text-gray-600 text-xs">
              {t.source}:{" "}
              <a href="https://www.huawei.com/en/news/2026/7/ocean-protect-dcig" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">
                huawei.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
