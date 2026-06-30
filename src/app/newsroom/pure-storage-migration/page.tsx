import { cookies } from "next/headers";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

const content = {
  de: {
    tag: "Storage",
    date: "22. März 2024",
    readTime: "6 Min. Lesezeit",
    headline: "500 TB in 68 Stunden: Zero-Downtime-Migration auf Pure Storage FlashArray",
    intro: "Alpin Logistik AG betreibt eines der größten Kühllogistik-Netzwerke Österreichs. Ihr Rechenzentrum ist 24/7 in Betrieb — Stillstand bedeutet Millionenverlust. Als das Legacy-Storage-System das Ende des Supports erreicht, ist eine Migration unvermeidlich. Ferrion übernimmt das Projekt mit einem Versprechen: null Minuten ungeplante Downtime.",
    sections: [
      {
        title: "Das Problem: Legacy am Limit",
        body: `Das bestehende Storage-System — ein 7 Jahre altes Hybrid-Array eines Tier-2-Herstellers — war in mehrfacher Hinsicht am Limit:\n\n**End of Support:** Ab Herbst 2024 würde es keine Sicherheitsupdates mehr geben. In einem NIS2-pflichtigen Umfeld ist das inakzeptabel.\n\n**Performance-Bottleneck:** Die SQL-Server-Workload hatte das System an seine Grenzen gebracht. Query-Laufzeiten von 8–15 Sekunden für geschäftskritische Reports waren der Normalzustand.\n\n**Kapazitätsgrenze:** Von 500 TB nutzbarem Speicher waren 487 TB belegt. Erweiterungen wären mit dem Alt-System nicht wirtschaftlich gewesen.`,
      },
      {
        title: "Warum Pure Storage FlashArray?",
        body: `Pure Storage FlashArray//XL wurde aus drei Gründen gewählt:\n\n**Pure//Fusion:** Das Speicherbetriebssystem von Pure erlaubt Non-Disruptive Upgrades und Controller-Wechsel ohne Downtime — ein entscheidender Vorteil für den laufenden Betrieb.\n\n**Evergreen-Modell:** Pure Storage garantiert kostenfreie Controller-Upgrades alle 3 Jahre im Rahmen des Evergreen-Supportmodells. Das eliminiert zukünftige Migrationsrisiken.\n\n**Compression & Deduplizierung:** Pure Storage erreicht in der Logistik-Umgebung einen Datenreduktionsfaktor von 4:1 — aus 500 TB Rohdaten werden effektiv 125 TB auf dem Array. Das schafft sofort Kapazitätspuffer.`,
      },
      {
        title: "Das Migrations-Playbook",
        body: `Ferrion entwickelte ein mehrstufiges Migrationskonzept, das auf dem Pure Storage ActiveCluster-Framework basiert:\n\n**Schritt 1 — Spiegelung:** Das neue FlashArray wird parallel zum Alt-System in Betrieb genommen. Alle Volumes werden via Storage-Replikation gespiegelt. Schreiboperationen erfolgen synchron auf beiden Arrays.\n\n**Schritt 2 — Umschaltung:** Pro Applikations-Cluster (insgesamt 14) wird ein Rolling-Failover durchgeführt. Jeder Schwenk dauert im Schnitt 4 Minuten und ist für die Anwendung transparent.\n\n**Schritt 3 — Validierung:** Nach jedem Failover erfolgt eine automatisierte Datenintegritätsprüfung. Das Gesamtprojekt läuft über ein Wochenende (Freitagabend bis Sonntagnacht).`,
      },
      {
        title: "Ergebnis: Freitagabend gestartet, Montagmorgen fertig",
        body: `Start: Freitagabend 22:00 Uhr.\nEnde: Sonntag 18:07 Uhr — 68 Stunden später.\nUngeplante Downtime: 0 Minuten.\n\nDie Performance-Verbesserungen übertrafen die Erwartungen: Die durchschnittliche SQL-Query-Zeit sank von 11 Sekunden auf 0,7 Sekunden — ein Faktor von 15,7×. Das Lager-Management-System der Alpin Logistik reagiert seither messbar schneller, was sich direkt auf die Kommissionierungsgeschwindigkeit auswirkt.\n\nDer erste Kapazitätspuffer: Das System meldet aktuell 31 % Belegung — von 487/500 TB auf 155/500 TB durch den 4:1-Reduktionsfaktor.`,
      },
    ],
    facts: [
      { label: "Migrationszeit", value: "68 Stunden" },
      { label: "Ungeplante Downtime", value: "0 min" },
      { label: "Performance-Gewinn", value: "15,7×" },
      { label: "Kapazitätsreserve", value: "69 %" },
    ],
    cta: "Storage-Beratung anfragen →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    tag: "Storage",
    date: "March 22, 2024",
    readTime: "6 min read",
    headline: "500 TB in 68 Hours: Zero-Downtime Migration to Pure Storage FlashArray",
    intro: "Alpin Logistik AG operates one of Austria's largest refrigerated logistics networks. Their data centre runs 24/7 — downtime means millions in losses. When the legacy storage system reaches end of support, migration is unavoidable. Ferrion takes on the project with one promise: zero minutes of unplanned downtime.",
    sections: [
      {
        title: "The Problem: Legacy at Its Limit",
        body: `The existing storage system — a 7-year-old hybrid array from a Tier 2 vendor — was at its limit in several ways:\n\n**End of Support:** From autumn 2024, there would be no more security updates. In a NIS2-obligated environment, this is unacceptable.\n\n**Performance Bottleneck:** The SQL Server workload had pushed the system to its limits. Query runtimes of 8–15 seconds for business-critical reports were the norm.\n\n**Capacity Limit:** Of 500 TB of usable storage, 487 TB were occupied. Expansion would not have been economical with the old system.`,
      },
      {
        title: "Why Pure Storage FlashArray?",
        body: `Pure Storage FlashArray//XL was chosen for three reasons:\n\n**Pure//Fusion:** Pure's storage operating system allows non-disruptive upgrades and controller changes without downtime — a decisive advantage for ongoing operations.\n\n**Evergreen Model:** Pure Storage guarantees free controller upgrades every 3 years under the Evergreen support model. This eliminates future migration risks.\n\n**Compression & Deduplication:** Pure Storage achieves a 4:1 data reduction ratio in the logistics environment — 500 TB of raw data effectively becomes 125 TB on the array. This immediately creates capacity headroom.`,
      },
      {
        title: "The Migration Playbook",
        body: `Ferrion developed a multi-stage migration concept based on the Pure Storage ActiveCluster framework:\n\n**Step 1 — Mirroring:** The new FlashArray is commissioned in parallel with the old system. All volumes are mirrored via storage replication. Write operations occur synchronously on both arrays.\n\n**Step 2 — Switchover:** A rolling failover is performed per application cluster (14 in total). Each switchover takes an average of 4 minutes and is transparent to the application.\n\n**Step 3 — Validation:** After each failover, an automated data integrity check is performed. The overall project runs over a weekend (Friday evening to Sunday night).`,
      },
      {
        title: "Result: Started Friday Evening, Finished Monday Morning",
        body: `Start: Friday evening 10:00 PM.\nEnd: Sunday 6:07 PM — 68 hours later.\nUnplanned downtime: 0 minutes.\n\nPerformance improvements exceeded expectations: average SQL query time dropped from 11 seconds to 0.7 seconds — a factor of 15.7×. Alpin Logistik's warehouse management system has been measurably faster ever since, directly impacting picking speed.\n\nFirst capacity headroom: the system currently shows 31% utilisation — from 487/500 TB to 155/500 TB thanks to the 4:1 reduction factor.`,
      },
    ],
    facts: [
      { label: "Migration time", value: "68 hours" },
      { label: "Unplanned downtime", value: "0 min" },
      { label: "Performance gain", value: "15.7×" },
      { label: "Capacity reserve", value: "69%" },
    ],
    cta: "Request Storage Consultation →",
    back: "← Back to Newsroom",
  },
};

function renderBody(text: string) {
  return text.split("\n\n").map((para, i) => {
    const lines = para.split("\n").map((line, j) => {
      const html = line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong class="text-white">${t}</strong>`);
      return <p key={j} className="text-gray-400 text-sm leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: html }} />;
    });
    return <div key={i} className="mb-4">{lines}</div>;
  });
}

export default function PureStorageArticle() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
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
                <span className="inline-block w-4 h-px bg-[#c9a84c]" />
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
