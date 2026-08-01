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
  return articleMetadata("cosmosescape-azure-masterkey", searchParams);
}

const SOURCES = [
  { label: "heise.de", url: "https://www.heise.de/news/CosmosEscape-ermoeglichte-Uebernahme-aller-Microsoft-Azure-Datenbanken-11388708.html" },
  { label: "golem.de", url: "https://www.golem.de/news/microsoft-forscher-finden-masterkey-fuer-vollzugriff-auf-azure-datenbanken-2607-211473.html" },
  { label: "wiz.io", url: "https://www.wiz.io/blog/cosmosescape-taking-over-every-database-in-azure-cosmos-db" },
];

const content = {
  de: {
    tag: "Security",
    date: "31. Juli 2026",
    readTime: "6 Min. Lesezeit",
    headline: "CosmosEscape: Wie ein „Master Key“ Zugriff auf sämtliche Azure-Cosmos-DB-Datenbanken ermöglichte",
    intro: "Sicherheitsforscher von Wiz haben eine Schwachstellenkette in Microsoft Azure Cosmos DB aufgedeckt, die im Ernstfall Lese- und Schreibzugriff auf praktisch jede Cosmos-DB-Datenbank weltweit ermöglicht hätte — über Mandantengrenzen und Regionen hinweg. Betroffen wären unter anderem Datenbanken hinter Entra ID, Teams und Copilot gewesen. Microsoft hat die Lücke behoben; laut eigenen Angaben gibt es keine Hinweise auf eine Ausnutzung durch Dritte.",
    sections: [
      {
        title: "1. Der Angriffsweg: Vom Gremlin-Query zum Master Key",
        body: `Die als „CosmosEscape“ bezeichnete Kette begann mit präparierten Gremlin-Abfragen, die gezielt .NET-Ausnahmen in der Query-Kompilierung auslösten. Über schwach abgesicherte Sandboxes gelang es den Forschern, aus diesen Abfragen heraus eigenen Code auszuführen — ein klassischer Sandbox-Escape.\n\nDamit erlangten sie Zugriff auf den sogenannten DB-Gateway-Dienst, der Kundenanfragen auf gemeinsam genutzten Service-Fabric-Clustern verarbeitet. Von dort aus stießen sie auf ein plattformweites Signiergeheimnis sowie ein regionales Verzeichnis mit Konten-, Abonnement- und Mandanten-IDs.`,
      },
      {
        title: "2. Der eigentliche Fund: ein Generalschlüssel für alle Konten",
        body: `Das kritische Ergebnis war ein plattformweiter „Cosmos Master Key“ — nicht an ein einzelnes Kundenkonto gebunden, sondern gültig über Mandanten, Regionen und APIs hinweg (SQL, MongoDB, Cassandra, Gremlin). Mit diesem Schlüssel ließ sich der primäre Zugriffsschlüssel jedes beliebigen Cosmos-DB-Kontos abrufen.\n\nIn Kombination mit dem regionalen Konten-Verzeichnis genügte damit theoretisch das Auffinden eines Zielkontos, um vollen Lese- und Schreibzugriff auf dessen Daten zu erhalten — unabhängig davon, welchem Kunden oder welcher Region die Datenbank zugeordnet war.`,
      },
      {
        title: "3. Reaktion und Behebung",
        body: `Wiz meldete den Fund am 20. November 2025 an Microsoft. Bereits 48 Stunden später — am 22. November 2025 — hatte Microsoft den verwundbaren Gremlin-Einstiegspunkt blockiert und damit den unmittelbaren Angriffsweg geschlossen. Die vollständige, architektonische Lösung, die den plattformweiten Schlüssel grundsätzlich eliminiert, wurde bis Juli 2026 in allen Regionen ausgerollt.\n\nMicrosoft erklärte, es lägen keine Protokolleinträge vor, die auf eine Ausnutzung der Lücke außerhalb der Tests der Sicherheitsforscher hindeuten. Für CosmosEscape wurde keine CVE-Nummer vergeben und kein CVSS-Score veröffentlicht.`,
      },
      {
        title: "Fazit: Auch Cloud-Infrastruktur ist nur so sicher wie ihre schwächste Schnittstelle",
        body: `CosmosEscape zeigt exemplarisch, wie aus einer einzelnen Schwachstelle in einer Abfrage-Sandbox — über mehrere Eskalationsstufen hinweg — ein Generalschlüssel für eine der zentralen Datenbank-Plattformen von Microsoft Azure werden kann. Die schnelle Erstreaktion (48 Stunden) zeigt, dass Cloud-Anbieter auf kritische Meldungen reagieren können; die Monate bis zur vollständigen architektonischen Lösung zeigen zugleich, wie aufwendig es ist, plattformweite Geheimnisse dauerhaft zu eliminieren.\n\nFür Unternehmen, die Azure Cosmos DB oder vergleichbare Managed-Database-Dienste nutzen, unterstreicht der Fall die Bedeutung von Mandantentrennung, minimalen Berechtigungen und einer aktiven Beobachtung von Herstellerankündigungen — auch wenn der Anbieter selbst die Infrastruktur betreibt. Wir unterstützen Sie gerne bei der Absicherung Ihrer Cloud- und Datenbankumgebungen.`,
      },
    ],
    facts: [
      { label: "Entdeckt von", value: "Wiz" },
      { label: "Erste Mitigation", value: "48 Std." },
      { label: "Vollständiger Fix", value: "Juli 2026" },
      { label: "CVE vergeben", value: "Nein" },
    ],
    cta: "Security-Beratung anfragen →",
    back: "← Zurück zum Newsroom",
    sourceLabel: "Quellen",
  },
  en: {
    tag: "Security",
    date: "July 31, 2026",
    readTime: "6 min read",
    headline: "CosmosEscape: How a “Master Key” Enabled Access to Every Azure Cosmos DB Database",
    intro: "Security researchers at Wiz uncovered a vulnerability chain in Microsoft Azure Cosmos DB that could have granted read and write access to virtually every Cosmos DB database worldwide — across tenants and regions. Affected databases would have included those behind Entra ID, Teams and Copilot. Microsoft has fixed the issue; the company states there is no evidence of exploitation by third parties.",
    sections: [
      {
        title: "1. The Attack Path: From a Gremlin Query to a Master Key",
        body: `The chain, dubbed “CosmosEscape,” began with crafted Gremlin queries designed to trigger .NET exceptions during query compilation. Through weakly secured sandboxes, the researchers were able to execute their own code from within these queries — a classic sandbox escape.\n\nThis gave them access to the DB Gateway service, which processes customer requests on shared Service Fabric clusters. From there, they found a platform-wide signing secret along with a regional registry containing account, subscription and tenant IDs.`,
      },
      {
        title: "2. The Real Finding: A Master Key for Every Account",
        body: `The critical discovery was a platform-wide “Cosmos Master Key” — not tied to a single customer account, but valid across tenants, regions and APIs (SQL, MongoDB, Cassandra, Gremlin). With this key, the primary access key of any Cosmos DB account could be retrieved.\n\nCombined with the regional account registry, this meant that simply locating a target account was theoretically enough to gain full read and write access to its data — regardless of which customer or region the database belonged to.`,
      },
      {
        title: "3. Response and Remediation",
        body: `Wiz reported the finding to Microsoft on November 20, 2025. Just 48 hours later — on November 22, 2025 — Microsoft had blocked the vulnerable Gremlin entry point, closing the immediate attack path. The complete architectural fix, which eliminates the platform-wide key altogether, was rolled out across all regions by July 2026.\n\nMicrosoft stated that no logs indicated exploitation beyond the security researchers' own testing. No CVE identifier was assigned to CosmosEscape and no CVSS score was published.`,
      },
      {
        title: "Conclusion: Cloud Infrastructure Is Only as Secure as Its Weakest Interface",
        body: `CosmosEscape is a striking example of how a single vulnerability in a query sandbox can — through several escalation steps — become a master key to one of Microsoft Azure's central database platforms. The fast initial response (48 hours) shows that cloud providers can react quickly to critical reports; the months required for the full architectural fix show how difficult it is to permanently eliminate platform-wide secrets.\n\nFor organisations using Azure Cosmos DB or comparable managed database services, this case underscores the importance of tenant isolation, least-privilege access and actively monitoring vendor disclosures — even when the provider itself operates the infrastructure. We are happy to support you in securing your cloud and database environments.`,
      },
    ],
    facts: [
      { label: "Discovered by", value: "Wiz" },
      { label: "Initial mitigation", value: "48 hrs" },
      { label: "Full fix", value: "July 2026" },
      { label: "CVE assigned", value: "No" },
    ],
    cta: "Request Security Consultation →",
    back: "← Back to Newsroom",
    sourceLabel: "Sources",
  },
};

function renderBody(text: string) {
  return text.split("\n\n").map((para, i) => (
    <p key={i} className="text-gray-400 text-sm leading-relaxed mb-3">{para}</p>
  ));
}

export default function CosmosEscapeArticle({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <ArticleJsonLd slug="cosmosescape-azure-masterkey" locale={locale} />
      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/newsroom" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
            {t.back}
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] text-red-300 border border-red-500/40 bg-red-900/20 px-2 py-0.5 font-bold tracking-wide uppercase">{t.tag}</span>
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
              {t.sourceLabel}:{" "}
              {SOURCES.map((s, i) => (
                <span key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">{s.label}</a>
                  {i < SOURCES.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
