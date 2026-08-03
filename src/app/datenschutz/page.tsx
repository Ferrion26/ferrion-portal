import Link from "next/link";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/datenschutz",
    locale: resolveLocale(searchParams),
    titleDe: "Datenschutz — Ferrion IT Systemhaus",
    titleEn: "Privacy Policy — Ferrion IT Systems House",
    descDe: "Datenschutzerklärung der Ferrion IT Systemhaus GmbH gemäß DSGVO / DSG 2018.",
    descEn: "Privacy policy of Ferrion IT Systemhaus GmbH in accordance with GDPR / Austrian DSG 2018.",
  });
}

export default function DatenschutzPage({ searchParams }: SP) {
  const locale = resolveLocale(searchParams);

  const t = locale === "en" ? en : de;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/"><img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" /></Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{t.navLabel}</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">{t.back}</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.label}</p>
        <h1 className="text-3xl font-bold text-white mb-4">{t.title}</h1>
        <p className="text-gray-500 text-xs mb-12">{t.subtitle}</p>

        <section className="space-y-10 text-sm text-gray-300 leading-relaxed">
          {t.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">{s.heading}</h2>
              {s.body}
            </div>
          ))}
        </section>

        <p className="text-gray-600 text-xs mt-12">{t.date}</p>
      </main>

      <footer className="border-t border-white/10 py-4 px-6 flex items-center justify-between">
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Ferrion IT Systemhaus</p>
        <div className="flex gap-6">
          {t.legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-gray-600 text-xs hover:text-gray-400">{l.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

const listItem = (text: string) => (
  <li className="flex gap-2 items-start"><span className="text-[#c9a84c] shrink-0 mt-0.5">·</span><span>{text}</span></li>
);

const de = {
  navLabel: "Datenschutz",
  back: "← Homepage",
  label: "Rechtliche Informationen",
  title: "Datenschutzerklärung",
  subtitle: "Gemäß DSGVO (EU) 2016/679 und DSG 2018",
  date: "Stand: August 2026",
  legalLinks: [{ label: "Impressum", href: "/impressum" }, { label: "Datenschutz", href: "/datenschutz" }, { label: "AGB", href: "/agb" }],
  sections: [
    {
      heading: "1. Verantwortlicher",
      body: <p>Ferrion IT Systemhaus GmbH · Wien, Österreich · <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a></p>,
    },
    {
      heading: "2. Erhebung und Verarbeitung personenbezogener Daten",
      body: (
        <>
          <p className="mb-3">Wir erheben personenbezogene Daten nur, wenn Sie uns diese im Rahmen einer Kontaktaufnahme oder Nutzung unserer Dienste freiwillig mitteilen:</p>
          <ul className="space-y-2">{[
            "Beratungsanfragen: Name, Unternehmen, E-Mail, Telefon (optional), Projektbeschreibung",
            "Kundenportal: E-Mail-Adresse, Passwort (verschlüsselt gespeichert)",
            "Server-Logs: IP-Adresse, Zeitstempel, aufgerufene Seite (für 7 Tage)",
          ].map(listItem)}</ul>
        </>
      ),
    },
    {
      heading: "3. Zweck der Datenverarbeitung",
      body: (
        <>
          <ul className="space-y-2 mb-3">{[
            "Bearbeitung und Beantwortung von Beratungsanfragen",
            "Bereitstellung des Kundenportals",
            "Technischen Betrieb und Sicherheit der Website",
          ].map(listItem)}</ul>
          <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie lit. f DSGVO (berechtigtes Interesse).</p>
        </>
      ),
    },
    {
      heading: "4. Weitergabe an Dritte",
      body: (
        <>
          <p className="mb-3">Ihre Daten werden nicht verkauft. Weitergabe nur an technische Dienstleister im Rahmen der Auftragsverarbeitung:</p>
          <ul className="space-y-2">{[
            "Vercel Inc. (Hosting, Serverstandort Frankfurt/Deutschland) — als US-Unternehmen zusätzlich abgesichert durch Standardvertragsklauseln gemäß Art. 46 DSGVO",
            "Vercel Inc. (Vercel Web Analytics) — cookie-lose Reichweitenmessung, Standardvertragsklauseln gemäß Art. 46 DSGVO, siehe Abschnitt 6",
            "Supabase Inc. (Datenbank, Serverstandort London/Vereinigtes Königreich) — Angemessenheitsbeschluss der EU-Kommission gemäß Art. 45 DSGVO, zusätzlich Auftragsverarbeitungsvertrag",
            "Resend Inc. (E-Mail-Versand, Serverstandort Irland/EU) — als US-Unternehmen zusätzlich abgesichert durch Standardvertragsklauseln gemäß Art. 46 DSGVO",
            "Umami Software Inc. (Web-Analytics, Datenregion EU) — cookie-lose, datensparsame Reichweitenmessung, siehe Abschnitt 6",
          ].map(listItem)}</ul>
        </>
      ),
    },
    {
      heading: "5. Cookies",
      body: (
        <>
          <p className="mb-3">Wir verwenden ausschließlich technisch notwendige Cookies:</p>
          <ul className="space-y-2">{[
            "Session-Cookie (next-auth.session-token): Für die Anmeldung im Kundenportal. Wird beim Abmelden gelöscht.",
            "Sprach-Cookie (locale): Speichert Ihre Sprachpräferenz (DE/EN) für 1 Jahr.",
          ].map(listItem)}</ul>
          <p className="mt-3">Marketing- oder Tracking-Cookies werden nicht verwendet.</p>
        </>
      ),
    },
    {
      heading: "6. Web-Analytics (Umami & Vercel Analytics)",
      body: (
        <>
          <p className="mb-3">
            Zur anonymisierten Reichweitenmessung setzen wir zwei datenschutzfreundliche, cookie-lose Webanalyse-Dienste ein:
          </p>
          <ul className="space-y-2 mb-3">{[
            "Umami (Umami Software Inc.) — Datenregion EU, d. h. die Analyse-Daten werden auf Servern innerhalb der EU verarbeitet und gespeichert.",
            "Vercel Web Analytics (Vercel Inc.) — ergänzende Reichweitenmessung über das Vercel-Hosting-Netzwerk.",
          ].map(listItem)}</ul>
          <p className="mb-3">Für beide Dienste gilt:</p>
          <ul className="space-y-2">{[
            "Keine Cookies, keine geräteübergreifende Wiedererkennung einzelner Besucher.",
            "IP-Adressen werden nur kurzzeitig zur Ermittlung von Land/Region verarbeitet und nicht gespeichert.",
            "Erfasst werden ausschließlich aggregierte Nutzungsdaten (aufgerufene Seiten, Verweisquelle, Gerätetyp).",
          ].map(listItem)}</ul>
          <p className="mt-3">
            Da hierbei keine personenbezogenen, wiedererkennbaren Daten gespeichert werden, ist für den Einsatz dieser Dienste
            keine Einwilligung über das Cookie-Banner erforderlich (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO,
            berechtigtes Interesse an der Analyse der Websitenutzung).
          </p>
        </>
      ),
    },
    {
      heading: "7. Ihre Rechte",
      body: (
        <>
          <ul className="space-y-2 mb-3">{[
            "Auskunft (Art. 15 DSGVO)", "Berichtigung (Art. 16 DSGVO)", "Löschung (Art. 17 DSGVO)",
            "Einschränkung der Verarbeitung (Art. 18 DSGVO)", "Datenübertragbarkeit (Art. 20 DSGVO)", "Widerspruch (Art. 21 DSGVO)",
          ].map(listItem)}</ul>
          <p>Kontakt: <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a> · Beschwerden: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">www.dsb.gv.at</a></p>
        </>
      ),
    },
    {
      heading: "8. Speicherdauer",
      body: <p>Beratungsanfragen werden für die Dauer der Geschäftsbeziehung gespeichert (danach gemäß gesetzlicher Aufbewahrungsfristen, i.d.R. 7 Jahre). Server-Logs nach 7 Tagen automatisch gelöscht. Umami speichert keine wiedererkennbaren Besucherdaten, daher entfällt hierfür eine Löschfrist.</p>,
    },
  ],
};

const en = {
  navLabel: "Privacy",
  back: "← Homepage",
  label: "Legal Information",
  title: "Privacy Policy",
  subtitle: "Pursuant to GDPR (EU) 2016/679 and DSG 2018",
  date: "Last updated: August 2026",
  legalLinks: [{ label: "Legal Notice", href: "/impressum" }, { label: "Privacy Policy", href: "/datenschutz" }, { label: "Terms", href: "/agb" }],
  sections: [
    {
      heading: "1. Data Controller",
      body: <p>Ferrion IT Systemhaus GmbH · Vienna, Austria · <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a></p>,
    },
    {
      heading: "2. Collection and Processing of Personal Data",
      body: (
        <>
          <p className="mb-3">We only collect personal data that you voluntarily provide when contacting us or using our services:</p>
          <ul className="space-y-2">{[
            "Consultation requests: name, company, email, phone (optional), project description",
            "Customer portal: email address, password (stored encrypted)",
            "Server logs: IP address, timestamp, page accessed (retained for 7 days)",
          ].map(listItem)}</ul>
        </>
      ),
    },
    {
      heading: "3. Purpose of Data Processing",
      body: (
        <>
          <ul className="space-y-2 mb-3">{[
            "Processing and responding to consultation requests",
            "Providing the customer portal",
            "Technical operation and security of the website",
          ].map(listItem)}</ul>
          <p>Legal basis: Art. 6(1)(b) GDPR (pre-contractual measures) and Art. 6(1)(f) GDPR (legitimate interest).</p>
        </>
      ),
    },
    {
      heading: "4. Disclosure to Third Parties",
      body: (
        <>
          <p className="mb-3">Your data is not sold. Disclosure only to technical service providers under data processing agreements:</p>
          <ul className="space-y-2">{[
            "Vercel Inc. (Hosting, server location Frankfurt/Germany) — as a US company, additionally safeguarded by Standard Contractual Clauses pursuant to Art. 46 GDPR",
            "Vercel Inc. (Vercel Web Analytics) — cookie-less traffic measurement, Standard Contractual Clauses pursuant to Art. 46 GDPR, see Section 6",
            "Supabase Inc. (Database, server location London/United Kingdom) — adequacy decision by the EU Commission pursuant to Art. 45 GDPR, additionally a Data Processing Agreement",
            "Resend Inc. (Email delivery, server location Ireland/EU) — as a US company, additionally safeguarded by Standard Contractual Clauses pursuant to Art. 46 GDPR",
            "Umami Software Inc. (Web analytics, EU data region) — cookie-less, privacy-preserving traffic measurement, see Section 6",
          ].map(listItem)}</ul>
        </>
      ),
    },
    {
      heading: "5. Cookies",
      body: (
        <>
          <p className="mb-3">We use only technically necessary cookies:</p>
          <ul className="space-y-2">{[
            "Session cookie (next-auth.session-token): For login to the customer portal. Deleted on logout.",
            "Language cookie (locale): Stores your language preference (DE/EN) for 1 year.",
          ].map(listItem)}</ul>
          <p className="mt-3">No marketing or tracking cookies are used.</p>
        </>
      ),
    },
    {
      heading: "6. Web Analytics (Umami & Vercel Analytics)",
      body: (
        <>
          <p className="mb-3">
            For anonymised traffic measurement we use two privacy-friendly, cookie-less web analytics services:
          </p>
          <ul className="space-y-2 mb-3">{[
            "Umami (Umami Software Inc.) — EU data region, meaning analytics data is processed and stored on servers within the EU.",
            "Vercel Web Analytics (Vercel Inc.) — supplementary traffic measurement via the Vercel hosting network.",
          ].map(listItem)}</ul>
          <p className="mb-3">Both services share the following properties:</p>
          <ul className="space-y-2">{[
            "No cookies, no cross-device recognition of individual visitors.",
            "IP addresses are processed only briefly to derive country/region and are not stored.",
            "Only aggregated usage data is collected (pages viewed, referral source, device type).",
          ].map(listItem)}</ul>
          <p className="mt-3">
            Since no personal, re-identifiable data is stored, using these services does not require consent via the
            cookie banner (legal basis: Art. 6(1)(f) GDPR, legitimate interest in analysing website usage).
          </p>
        </>
      ),
    },
    {
      heading: "7. Your Rights",
      body: (
        <>
          <ul className="space-y-2 mb-3">{[
            "Right of access (Art. 15 GDPR)", "Right to rectification (Art. 16 GDPR)", "Right to erasure (Art. 17 GDPR)",
            "Right to restriction of processing (Art. 18 GDPR)", "Right to data portability (Art. 20 GDPR)", "Right to object (Art. 21 GDPR)",
          ].map(listItem)}</ul>
          <p>Contact: <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a> · Complaints: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">www.dsb.gv.at</a></p>
        </>
      ),
    },
    {
      heading: "8. Retention Periods",
      body: <p>Consultation requests are retained for the duration of the business relationship, then deleted in accordance with statutory retention periods (generally 7 years). Server logs are automatically deleted after 7 days. Umami does not store any re-identifiable visitor data, so no retention period applies.</p>,
    },
  ],
};
