import { cookies } from "next/headers";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

const content = {
  de: {
    meta: "NIS2-Compliance: Wie ein österreichisches Industrieunternehmen in 10 Wochen audit-ready wurde",
    tag: "Backup & Security",
    date: "6. Mai 2024",
    readTime: "8 Min. Lesezeit",
    headline: "NIS2-Compliance in 10 Wochen: Von der Risikoanalyse bis zum bestandenen Audit",
    intro: "Als die NIS2-Richtlinie der EU im Oktober 2024 in österreichisches Recht überführt wurde, standen viele mittelständische Unternehmen unter enormem Druck. Für die Bergbau & Rohstoff Austria GmbH — ein Industrieunternehmen mit 450 Mitarbeitern und kritischer Infrastruktur — war die Frist nicht verhandelbar. Ferrion übernahm das Projekt im Februar 2024 und lieferte innerhalb von 10 Wochen eine vollständige NIS2-Readiness.",
    sections: [
      {
        title: "Die Ausgangslage: Drei kritische Lücken",
        body: `Das IT-Audit zu Projektbeginn offenbarte drei strukturelle Schwächen, die unter NIS2 als kritisch eingestuft wurden:\n\n**Backup ohne Sicherheitsnetz:** Die bestehende Backup-Infrastruktur verwendete keine Immutable-Storage-Technologie. Ransomware hätte Backup-Daten zerstören können — ein Szenario, das NIS2 explizit adressiert.\n\n**Fehlender Incident-Response-Plan:** Weder eine dokumentierte Meldekette noch definierte Eskalationsstufen existierten. NIS2 schreibt eine Meldung an die zuständige Behörde innerhalb von 24 Stunden vor.\n\n**Unvollständiges Asset-Inventar:** Kritische OT-Systeme (Operational Technology) waren nicht lückenlos dokumentiert — eine Grundvoraussetzung für jede NIS2-konforme Risikoanalyse.`,
      },
      {
        title: "Die Lösung: Drei Phasen in 10 Wochen",
        body: `**Phase 1 (Woche 1–3): Bestandsaufnahme & Risikoanalyse**\nFerrion führte ein vollständiges Asset-Discovery durch, inklusive OT-Integration. Alle 847 inventarisierten Assets wurden nach NIS2-Kritikalität klassifiziert. Das Ergebnis war ein vollständiges Risikoregister als Basis für alle weiteren Maßnahmen.\n\n**Phase 2 (Woche 4–7): Technische Härtung**\nKernstück war die Implementierung von Commvault Complete Backup & Recovery mit Air-Gap-Technologie. Backup-Daten werden auf unveränderlichen (immutable) Speicher geschrieben und sind für 90 Tage nicht löschbar — auch nicht für Administratoren. Ergänzend: Multi-Faktor-Authentifizierung auf allen kritischen Systemen, Network Segmentation zwischen IT und OT, sowie Logging und SIEM-Integration.\n\n**Phase 3 (Woche 8–10): Dokumentation & Audit-Vorbereitung**\nErstellung des vollständigen Incident-Response-Plans inklusive Meldekette, Kommunikationsmatrix und Simulationsübung. Alle technischen Maßnahmen wurden in einem NIS2-Compliance-Dokument nach ISO/IEC 27001-Struktur festgehalten.`,
      },
      {
        title: "Das Ergebnis: Audit ohne Beanstandung",
        body: `Der externe NIS2-Audit durch einen akkreditierten Prüfer im April 2024 endete ohne einzige kritische Beanstandung. Drei Empfehlungen wurden ausgesprochen (alle non-critical), die Bergbau & Rohstoff Austria GmbH erhielt die NIS2-Compliance-Bestätigung.\n\nDarüber hinaus konnte das IT-Team einen messbaren Effizienzgewinn verzeichnen: Die Recovery Time Objective (RTO) sank von 48 Stunden auf unter 4 Stunden. Das neue Backup-System sichert täglich 12 TB Produktionsdaten mit einer Backup-Erfolgsrate von 99,98%.`,
      },
      {
        title: "Fazit",
        body: `NIS2 ist kein Papiertiger — die Anforderungen sind konkret, die Fristen eng, und die Bußgelder bei Verstoß erheblich (bis zu 10 Mio. Euro oder 2 % des weltweiten Jahresumsatzes). Für Unternehmen, die noch nicht begonnen haben, ist jetzt der richtige Zeitpunkt. Ferrion bietet eine kostenlose NIS2-Erstbewertung an — sprechen Sie uns an.`,
      },
    ],
    facts: [
      { label: "Projektdauer", value: "10 Wochen" },
      { label: "Assets inventarisiert", value: "847" },
      { label: "RTO nach Projekt", value: "< 4 Stunden" },
      { label: "Backup-Erfolgsrate", value: "99,98 %" },
    ],
    cta: "NIS2-Beratung anfragen →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    meta: "NIS2 Compliance: How an Austrian industrial company became audit-ready in 10 weeks",
    tag: "Backup & Security",
    date: "May 6, 2024",
    readTime: "8 min read",
    headline: "NIS2 Compliance in 10 Weeks: From Risk Analysis to Passed Audit",
    intro: "When the EU's NIS2 directive was transposed into Austrian law in October 2024, many mid-sized companies faced enormous pressure. For Bergbau & Rohstoff Austria GmbH — an industrial company with 450 employees and critical infrastructure — the deadline was non-negotiable. Ferrion took over the project in February 2024 and delivered full NIS2 readiness within 10 weeks.",
    sections: [
      {
        title: "The Starting Point: Three Critical Gaps",
        body: `The IT audit at project start revealed three structural weaknesses classified as critical under NIS2:\n\n**Backup without a safety net:** The existing backup infrastructure used no immutable storage technology. Ransomware could have destroyed backup data — a scenario NIS2 explicitly addresses.\n\n**Missing incident response plan:** Neither a documented escalation chain nor defined escalation levels existed. NIS2 mandates reporting to the relevant authority within 24 hours.\n\n**Incomplete asset inventory:** Critical OT systems (Operational Technology) were not comprehensively documented — a fundamental prerequisite for any NIS2-compliant risk analysis.`,
      },
      {
        title: "The Solution: Three Phases in 10 Weeks",
        body: `**Phase 1 (Weeks 1–3): Inventory & Risk Analysis**\nFerrion conducted a full asset discovery including OT integration. All 847 inventoried assets were classified by NIS2 criticality. The result was a complete risk register as the foundation for all subsequent measures.\n\n**Phase 2 (Weeks 4–7): Technical Hardening**\nThe centrepiece was implementing Commvault Complete Backup & Recovery with air-gap technology. Backup data is written to immutable storage and cannot be deleted for 90 days — not even by administrators. Additionally: multi-factor authentication on all critical systems, network segmentation between IT and OT, and logging plus SIEM integration.\n\n**Phase 3 (Weeks 8–10): Documentation & Audit Preparation**\nCreation of the full incident response plan including escalation chain, communication matrix and simulation exercise. All technical measures were documented in a NIS2 compliance document following ISO/IEC 27001 structure.`,
      },
      {
        title: "The Result: Audit Without Finding",
        body: `The external NIS2 audit by an accredited auditor in April 2024 concluded with zero critical findings. Three recommendations were made (all non-critical); Bergbau & Rohstoff Austria GmbH received NIS2 compliance confirmation.\n\nAdditionally, the IT team recorded measurable efficiency gains: Recovery Time Objective (RTO) dropped from 48 hours to under 4 hours. The new backup system protects 12 TB of production data daily with a backup success rate of 99.98%.`,
      },
      {
        title: "Conclusion",
        body: `NIS2 is not a paper tiger — the requirements are concrete, the deadlines tight, and the fines for non-compliance significant (up to €10 million or 2% of global annual turnover). For companies that haven't started yet, now is the right time. Ferrion offers a free NIS2 initial assessment — get in touch.`,
      },
    ],
    facts: [
      { label: "Project duration", value: "10 weeks" },
      { label: "Assets inventoried", value: "847" },
      { label: "RTO after project", value: "< 4 hours" },
      { label: "Backup success rate", value: "99.98%" },
    ],
    cta: "Request NIS2 Consultation →",
    back: "← Back to Newsroom",
  },
};

function renderBody(text: string) {
  return text.split("\n\n").map((para, i) => {
    const lines = para.split("\n").map((line, j) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong class="text-white">${t}</strong>`);
      return <p key={j} className={j === 0 && line.startsWith("<strong") ? "text-white font-bold mb-1" : "text-gray-400 text-sm leading-relaxed mb-2"} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
    return <div key={i} className="mb-4">{lines}</div>;
  });
}

export default function NIS2Article() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          {/* Back */}
          <Link href="/#newsroom" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
            {t.back}
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5 font-bold tracking-wide uppercase">{t.tag}</span>
            <span className="text-gray-500 text-xs">{t.date}</span>
            <span className="text-gray-600 text-xs">{t.readTime}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-snug mb-6">{t.headline}</h1>
          <p className="text-gray-300 text-base leading-relaxed mb-10 border-l-2 border-[#c9a84c] pl-5">{t.intro}</p>

          {/* Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mb-12 border border-white/5">
            {t.facts.map((f) => (
              <div key={f.label} className="bg-[#0d1117] px-5 py-4 text-center">
                <p className="text-xl font-bold text-[#c9a84c]">{f.value}</p>
                <p className="text-gray-500 text-[10px] mt-1">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Sections */}
          {t.sections.map((s) => (
            <div key={s.title} className="mb-10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <span className="inline-block w-4 h-px bg-[#c9a84c]" />
                {s.title}
              </h2>
              {renderBody(s.body)}
            </div>
          ))}

          {/* CTA */}
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
