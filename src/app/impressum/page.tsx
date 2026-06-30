import Link from "next/link";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/impressum",
    locale: resolveLocale(searchParams),
    titleDe: "Impressum — Ferrion IT Systemhaus",
    titleEn: "Legal Notice — Ferrion IT Systems House",
    descDe: "Impressum und rechtliche Informationen der Ferrion IT Systemhaus GmbH.",
    descEn: "Legal notice and company information of Ferrion IT Systemhaus GmbH.",
  });
}

const content = {
  de: {
    label: "Rechtliche Informationen",
    title: "Impressum",
    back: "← Homepage",
    sections: [
      {
        heading: "Angaben gemäß § 5 ECG",
        body: (
          <>
            <p className="font-medium text-white mb-1">Ferrion IT Systemhaus GmbH</p>
            <p>Wien, Österreich</p>
            <p className="mt-3">
              <span className="text-gray-500 text-xs uppercase tracking-widest">E-Mail</span><br />
              <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a>
            </p>
          </>
        ),
      },
      {
        heading: "Geschäftsführung",
        body: (
          <>
            <p>Geschäftsführer A — Sales & Alliances</p>
            <p>Geschäftsführer B — Technik & Pre-Sales</p>
          </>
        ),
      },
      {
        heading: "Unternehmensgegenstand",
        body: <p>Handel mit IT-Infrastruktur (Storage, Server, Netzwerk), IT-Dienstleistungen (Beratung, Implementierung, Managed Services) sowie Datenbankservices.</p>,
      },
      {
        heading: "Haftungsausschluss",
        body: <p>Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 ECG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>,
      },
      {
        heading: "Urheberrecht",
        body: <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>,
      },
      {
        heading: "Online-Streitbeilegung",
        body: (
          <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">ec.europa.eu/consumers/odr</a>
          </p>
        ),
      },
    ],
    legalLinks: [{ label: "Impressum", href: "/impressum" }, { label: "Datenschutz", href: "/datenschutz" }],
    copyright: "Ferrion IT Systemhaus",
  },
  en: {
    label: "Legal Information",
    title: "Legal Notice",
    back: "← Homepage",
    sections: [
      {
        heading: "Company Information pursuant to § 5 ECG",
        body: (
          <>
            <p className="font-medium text-white mb-1">Ferrion IT Systemhaus GmbH</p>
            <p>Vienna, Austria</p>
            <p className="mt-3">
              <span className="text-gray-500 text-xs uppercase tracking-widest">Email</span><br />
              <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a>
            </p>
          </>
        ),
      },
      {
        heading: "Managing Directors",
        body: (
          <>
            <p>Managing Director A — Sales & Alliances</p>
            <p>Managing Director B — Technology & Pre-Sales</p>
          </>
        ),
      },
      {
        heading: "Business Activities",
        body: <p>Trading in IT infrastructure (storage, servers, networking), IT services (consulting, implementation, managed services) and database services.</p>,
      },
      {
        heading: "Disclaimer",
        body: <p>The content of this website has been prepared with the utmost care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content. As a service provider, we are responsible for our own content on these pages in accordance with general legislation.</p>,
      },
      {
        heading: "Copyright",
        body: <p>The content and works on these pages created by the site operators are subject to Austrian copyright law. Reproduction, editing, distribution, and any kind of exploitation outside the limits of copyright law require the written consent of the respective author or creator.</p>,
      },
      {
        heading: "Online Dispute Resolution",
        body: (
          <p>The European Commission provides a platform for online dispute resolution (ODR):{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">ec.europa.eu/consumers/odr</a>
          </p>
        ),
      },
    ],
    legalLinks: [{ label: "Legal Notice", href: "/impressum" }, { label: "Privacy Policy", href: "/datenschutz" }],
    copyright: "Ferrion IT Systemhaus",
  },
};

export default function ImpressumPage({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/"><img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" /></Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{t.title}</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">{t.back}</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.label}</p>
        <h1 className="text-3xl font-bold text-white mb-12">{t.title}</h1>
        <section className="space-y-10 text-sm text-gray-300 leading-relaxed">
          {t.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">{s.heading}</h2>
              {s.body}
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 py-4 px-6 flex items-center justify-between">
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} {t.copyright}</p>
        <div className="flex gap-6">
          {t.legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-gray-600 text-xs hover:text-gray-400">{l.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
