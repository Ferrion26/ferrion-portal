import Link from "next/link";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/agb",
    locale: resolveLocale(searchParams),
    titleDe: "AGB — Ferrion IT Systemhaus",
    titleEn: "Terms & Conditions — Ferrion IT Systems House",
    descDe: "Allgemeine Geschäftsbedingungen der Ferrion IT Systemhaus GmbH.",
    descEn: "General Terms and Conditions of Ferrion IT Systemhaus GmbH.",
  });
}

const listItem = (text: string) => (
  <li className="flex gap-2 items-start"><span className="text-[#c9a84c] shrink-0 mt-0.5">·</span><span>{text}</span></li>
);

const content = {
  de: {
    label: "Rechtliche Informationen",
    title: "Allgemeine Geschäftsbedingungen",
    subtitle: "Stand: August 2026",
    back: "← Homepage",
    notice: "Hinweis: Dieser Text ist ein Muster-Beispieltext zur Veranschaulichung und ersetzt keine individuelle Rechtsberatung. Vor Verwendung als verbindliche AGB empfehlen wir eine Prüfung durch eine Rechtsanwältin bzw. einen Rechtsanwalt.",
    sections: [
      {
        heading: "1. Geltungsbereich",
        body: (
          <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Verträge zwischen der Ferrion IT Systemhaus GmbH, Wien, Österreich (nachfolgend „Ferrion") und ihren Kundinnen und Kunden (nachfolgend „Kunde") über den Verkauf von Hardware, Software und Lizenzen sowie die Erbringung von IT-Dienstleistungen, insbesondere Beratung, Implementierung und Managed Services. Abweichende, entgegenstehende oder ergänzende Bedingungen des Kunden werden nur dann Vertragsbestandteil, wenn Ferrion ihrer Geltung ausdrücklich schriftlich zugestimmt hat. Diese AGB gelten ausschließlich gegenüber Unternehmern im Sinne des § 1 UGB.</p>
        ),
      },
      {
        heading: "2. Vertragsschluss",
        body: (
          <>
            <p className="mb-3">Angebote von Ferrion sind freibleibend und unverbindlich, sofern nicht ausdrücklich als bindend bezeichnet. Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung von Ferrion oder durch tatsächliche Ausführung der Leistung zustande.</p>
            <p>Nebenabreden, Änderungen und Ergänzungen des Vertrages bedürfen der Schriftform. Dies gilt auch für ein Abgehen von diesem Schriftformerfordernis selbst.</p>
          </>
        ),
      },
      {
        heading: "3. Leistungsumfang",
        body: (
          <>
            <p className="mb-3">Art und Umfang der von Ferrion zu erbringenden Leistungen ergeben sich aus dem jeweiligen Angebot bzw. der Auftragsbestätigung. Änderungen des Leistungsumfangs (Change Requests) bedürfen der schriftlichen Vereinbarung und können sich auf Preis sowie Zeitplan auswirken.</p>
            <ul className="space-y-2">{[
              "Bei Managed Services richtet sich der konkrete Leistungsumfang nach der gewählten Servicestufe (z. B. Care Monitor, Care Operate, Care Complete) gemäß gesondertem Leistungsschein.",
              "Herstellergarantien und -support Dritter (z. B. Huawei, Everpure, Commvault) bleiben von dieser Vereinbarung unberührt und gelten zusätzlich zu den Leistungen von Ferrion.",
            ].map(listItem)}</ul>
          </>
        ),
      },
      {
        heading: "4. Preise und Zahlungsbedingungen",
        body: (
          <>
            <p className="mb-3">Alle Preise verstehen sich in Euro, netto zzgl. der jeweils gültigen gesetzlichen Umsatzsteuer, sofern nicht anders angegeben. Rechnungen sind, sofern nicht abweichend vereinbart, innerhalb von 14 Tagen ab Rechnungsdatum ohne Abzug zur Zahlung fällig.</p>
            <p>Bei Zahlungsverzug ist Ferrion berechtigt, Verzugszinsen in gesetzlicher Höhe sowie angemessene Mahn- und Inkassospesen zu verrechnen. Bei wiederkehrenden Leistungen (z. B. Managed Services) erfolgt die Verrechnung, sofern nicht anders vereinbart, monatlich im Voraus.</p>
          </>
        ),
      },
      {
        heading: "5. Liefer- und Leistungszeiten",
        body: (
          <p>Angegebene Liefer- und Leistungstermine sind, sofern nicht ausdrücklich als „Fixtermin" vereinbart, voraussichtliche Termine. Ferrion haftet nicht für Verzögerungen, die auf höhere Gewalt, Lieferengpässe von Herstellern oder unzureichende Mitwirkung des Kunden zurückzuführen sind. Bei absehbaren Verzögerungen informiert Ferrion den Kunden unverzüglich.</p>
        ),
      },
      {
        heading: "6. Mitwirkungspflichten des Kunden",
        body: (
          <>
            <p className="mb-3">Der Kunde stellt Ferrion die für die Leistungserbringung erforderlichen Informationen, Zugänge und Ressourcen (z. B. Systemzugriff, Ansprechpersonen, Räumlichkeiten) rechtzeitig und in geeigneter Form zur Verfügung.</p>
            <p>Verzögerungen oder Mängel, die auf unzureichende Mitwirkung des Kunden zurückzuführen sind, gehen nicht zulasten von Ferrion; vereinbarte Termine verschieben sich in diesem Fall angemessen.</p>
          </>
        ),
      },
      {
        heading: "7. Gewährleistung",
        body: (
          <p>Ferrion gewährleistet die vertragsgemäße Erbringung der Leistungen nach den Regeln der Technik. Für gelieferte Hardware und Software gelten primär die Gewährleistungs- und Garantiebedingungen des jeweiligen Herstellers; Ferrion tritt die entsprechenden Ansprüche gegen den Hersteller an den Kunden ab bzw. macht sie treuhändig für den Kunden geltend. Mängel sind unverzüglich nach Entdeckung schriftlich anzuzeigen. Die gesetzliche Gewährleistungsfrist beträgt für Unternehmer gemäß § 933 ABGB ein Jahr ab Übergabe, sofern nicht abweichend vereinbart.</p>
        ),
      },
      {
        heading: "8. Haftung",
        body: (
          <>
            <p className="mb-3">Ferrion haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach den Bestimmungen des Produkthaftungsgesetzes. Für leichte Fahrlässigkeit haftet Ferrion nur bei Verletzung wesentlicher Vertragspflichten und der Höhe nach begrenzt auf den vorhersehbaren, vertragstypischen Schaden.</p>
            <p>Die Haftung für entgangenen Gewinn, mittelbare Schäden und Datenverlust ist bei leichter Fahrlässigkeit ausgeschlossen, soweit gesetzlich zulässig. Der Kunde ist für die regelmäßige, dem Stand der Technik entsprechende Datensicherung selbst verantwortlich, unbeschadet gesondert beauftragter Backup-Leistungen durch Ferrion.</p>
          </>
        ),
      },
      {
        heading: "9. Laufzeit und Kündigung bei Managed Services",
        body: (
          <>
            <p className="mb-3">Verträge über Managed Services werden auf unbestimmte Zeit bzw. mit der im Angebot genannten Mindestlaufzeit geschlossen und verlängern sich automatisch um jeweils zwölf Monate, sofern nicht unter Einhaltung einer Frist von drei Monaten zum Laufzeitende schriftlich gekündigt wird.</p>
            <p>Das Recht beider Parteien zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt, insbesondere bei erheblichem Zahlungsverzug des Kunden oder wiederholter, wesentlicher Schlechtleistung von Ferrion nach erfolgloser Nachfristsetzung.</p>
          </>
        ),
      },
      {
        heading: "10. Geheimhaltung und Datenschutz",
        body: (
          <p>Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erlangten vertraulichen Informationen der jeweils anderen Partei streng vertraulich zu behandeln und nur zum Zweck der Vertragserfüllung zu verwenden. Die Verarbeitung personenbezogener Daten erfolgt gemäß der{" "}
            <Link href="/datenschutz" className="text-[#c9a84c] hover:underline">Datenschutzerklärung</Link>{" "}von Ferrion sowie, soweit erforderlich, auf Basis eines gesonderten Auftragsverarbeitungsvertrags (Art. 28 DSGVO).</p>
        ),
      },
      {
        heading: "11. Schlussbestimmungen",
        body: (
          <>
            <p className="mb-3">Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts (CISG). Als Gerichtsstand für sämtliche Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag wird das sachlich zuständige Gericht in Wien vereinbart, soweit gesetzlich zulässig.</p>
            <p>Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt. An die Stelle der unwirksamen Bestimmung tritt eine dem wirtschaftlichen Zweck möglichst nahekommende, wirksame Regelung.</p>
          </>
        ),
      },
    ],
    legalLinks: [{ label: "Impressum", href: "/impressum" }, { label: "Datenschutz", href: "/datenschutz" }, { label: "AGB", href: "/agb" }],
    copyright: "Ferrion IT Systemhaus",
  },
  en: {
    label: "Legal Information",
    title: "General Terms and Conditions",
    subtitle: "As of: August 2026",
    back: "← Homepage",
    notice: "Note: This text is a sample/example provided for illustration and does not replace individual legal advice. Before using it as binding terms and conditions, we recommend a review by a qualified lawyer.",
    sections: [
      {
        heading: "1. Scope",
        body: (
          <p>These General Terms and Conditions (T&Cs) apply to all contracts between Ferrion IT Systemhaus GmbH, Vienna, Austria (hereinafter "Ferrion") and its customers (hereinafter "Customer") for the sale of hardware, software and licences as well as the provision of IT services, in particular consulting, implementation and managed services. Deviating, conflicting or supplementary terms of the Customer shall only become part of the contract if Ferrion has expressly agreed to their validity in writing. These T&Cs apply exclusively to businesses within the meaning of § 1 of the Austrian Commercial Code (UGB).</p>
        ),
      },
      {
        heading: "2. Conclusion of Contract",
        body: (
          <>
            <p className="mb-3">Offers made by Ferrion are non-binding unless expressly stated otherwise. A contract is only concluded upon written confirmation of order by Ferrion or through actual performance of the service.</p>
            <p>Side agreements, amendments and supplements to the contract require written form. This also applies to any waiver of this written form requirement itself.</p>
          </>
        ),
      },
      {
        heading: "3. Scope of Services",
        body: (
          <>
            <p className="mb-3">The type and scope of services to be provided by Ferrion result from the respective offer or order confirmation. Changes to the scope of services (change requests) require written agreement and may affect price and schedule.</p>
            <ul className="space-y-2">{[
              "For Managed Services, the specific scope is determined by the selected service tier (e.g. Care Monitor, Care Operate, Care Complete) as per a separate service description.",
              "Third-party manufacturer warranties and support (e.g. Huawei, Everpure, Commvault) remain unaffected by this agreement and apply in addition to Ferrion's services.",
            ].map(listItem)}</ul>
          </>
        ),
      },
      {
        heading: "4. Prices and Payment Terms",
        body: (
          <>
            <p className="mb-3">All prices are quoted in euros, net of the applicable statutory value-added tax, unless stated otherwise. Unless otherwise agreed, invoices are due for payment without deduction within 14 days of the invoice date.</p>
            <p>In the event of late payment, Ferrion is entitled to charge statutory default interest as well as reasonable reminder and collection fees. For recurring services (e.g. Managed Services), billing occurs monthly in advance unless otherwise agreed.</p>
          </>
        ),
      },
      {
        heading: "5. Delivery and Performance Times",
        body: (
          <p>Stated delivery and performance dates are estimated dates unless expressly agreed as a "fixed date". Ferrion is not liable for delays caused by force majeure, manufacturer supply shortages, or insufficient cooperation by the Customer. In the event of foreseeable delays, Ferrion will inform the Customer without undue delay.</p>
        ),
      },
      {
        heading: "6. Customer's Duty to Cooperate",
        body: (
          <>
            <p className="mb-3">The Customer shall provide Ferrion with the information, access and resources required for service delivery (e.g. system access, contact persons, premises) in a timely manner and in suitable form.</p>
            <p>Delays or defects resulting from insufficient cooperation by the Customer shall not be to Ferrion's detriment; agreed deadlines shall be extended accordingly in such cases.</p>
          </>
        ),
      },
      {
        heading: "7. Warranty",
        body: (
          <p>Ferrion warrants that services are provided in accordance with the contract and generally accepted technical standards. For delivered hardware and software, the warranty and guarantee terms of the respective manufacturer primarily apply; Ferrion assigns the corresponding claims against the manufacturer to the Customer or asserts them on the Customer's behalf. Defects must be reported in writing without undue delay after discovery. The statutory warranty period for businesses is one year from delivery pursuant to § 933 of the Austrian Civil Code (ABGB), unless otherwise agreed.</p>
        ),
      },
      {
        heading: "8. Liability",
        body: (
          <>
            <p className="mb-3">Ferrion is liable without limitation for intent and gross negligence, as well as under the Austrian Product Liability Act. For slight negligence, Ferrion is only liable in the event of a breach of material contractual obligations and limited in amount to the foreseeable, typical damage for this type of contract.</p>
            <p>Liability for loss of profit, indirect damages and data loss is excluded in cases of slight negligence to the extent permitted by law. The Customer is responsible for regular, state-of-the-art data backups, without prejudice to backup services separately commissioned from Ferrion.</p>
          </>
        ),
      },
      {
        heading: "9. Term and Termination of Managed Services",
        body: (
          <>
            <p className="mb-3">Managed Services contracts are concluded for an indefinite period or for the minimum term stated in the offer, and automatically renew for successive twelve-month periods unless terminated in writing with three months' notice before the end of the term.</p>
            <p>Both parties' right to extraordinary termination for good cause remains unaffected, in particular in the event of significant payment default by the Customer or repeated, material poor performance by Ferrion after an unsuccessful grace period.</p>
          </>
        ),
      },
      {
        heading: "10. Confidentiality and Data Protection",
        body: (
          <p>Both parties undertake to treat all confidential information obtained from the other party in the course of the collaboration as strictly confidential and to use it only for the purpose of fulfilling the contract. Personal data is processed in accordance with Ferrion's{" "}
            <Link href="/datenschutz" className="text-[#c9a84c] hover:underline">Privacy Policy</Link>{" "}and, where required, on the basis of a separate data processing agreement (Art. 28 GDPR).</p>
        ),
      },
      {
        heading: "11. Final Provisions",
        body: (
          <>
            <p className="mb-3">Austrian law applies, excluding the UN Convention on Contracts for the International Sale of Goods (CISG). The competent court in Vienna is agreed as the place of jurisdiction for all disputes arising from or in connection with this contract, to the extent permitted by law.</p>
            <p>Should any provision of these T&Cs be or become invalid, the validity of the remaining provisions shall remain unaffected. The invalid provision shall be replaced by a valid provision that comes as close as possible to its economic purpose.</p>
          </>
        ),
      },
    ],
    legalLinks: [{ label: "Legal Notice", href: "/impressum" }, { label: "Privacy Policy", href: "/datenschutz" }, { label: "Terms", href: "/agb" }],
    copyright: "Ferrion IT Systemhaus",
  },
};

export default function AgbPage({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/"><img src="/logos/ferrion-full.webp" alt="Ferrion" className="h-9 w-auto" /></Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{t.title}</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">{t.back}</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.label}</p>
        <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-gray-500 text-xs mb-8">{t.subtitle}</p>

        <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 px-5 py-4 mb-12 text-xs text-gray-400 leading-relaxed">
          {t.notice}
        </div>

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
