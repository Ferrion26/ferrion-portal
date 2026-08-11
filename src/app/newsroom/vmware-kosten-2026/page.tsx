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
  return articleMetadata("vmware-kosten-2026", searchParams);
}

const content = {
  de: {
    tag: "Virtualisierung",
    date: "12. Mai 2026",
    readTime: "6 Min. Lesezeit",
    headline: "VMware-Kosten 2026: Was der Broadcom-Wechsel den österreichischen Mittelstand wirklich kostet",
    intro: "Es gibt zwei Arten, wie ein IT-Budget aus dem Ruder läuft. Die erste ist ein Projekt, das teurer wird als geplant. Die zweite ist eine Vertragsverlängerung, die aussieht wie Routine — und dann eine Zahl enthält, die niemand vorgesehen hat. Seit der Übernahme von VMware durch Broadcom im November 2023 erleben Unternehmen im deutschsprachigen Raum den zweiten Fall.",
    facts: [
      { label: "Dokumentierte Erhöhung (AT&T)", value: "1.050 %" },
      { label: "CISPE-Mitgliederbericht", value: "800–1.500 %" },
      { label: "vSphere-8-Support-Ende", value: "Ende 2027" },
      { label: "Typischer Faktor Mittelstand", value: "300–600 %" },
    ],
    series: {
      label: "Teil 1 / 2",
      note: "Sie wissen schon, was der Wechsel kostet, und wollen wissen, wie er abläuft?",
      linkLabel: "Weiter mit: Migration Woche für Woche",
      href: "/newsroom/vmware-migration-huawei-dcs",
    },
    sections: [
      {
        title: "Was sich geändert hat: vier Punkte",
        body: `**1. Unbefristete Lizenzen gibt es nicht mehr.** Das Modell „einmal kaufen, jährlich Wartung zahlen“ wurde vollständig abgeschafft. Alle Kunden wurden in ein Abonnement überführt. Aus einer Investition mit Restwert wurde eine laufende Verpflichtung ohne Restwert.\n\n**2. Aus rund 8.000 Artikeln wurden vier Produkte.** Das Portfolio wurde radikal zusammengestrichen auf VMware Cloud Foundation, vSphere Foundation, vSphere Standard und vSphere Essentials Plus. Wer bisher gezielt einzelne Komponenten lizenziert hat, kauft jetzt Pakete — inklusive Funktionen, die er nicht angefordert hat.\n\n**3. Die Mindestmenge wurde zum Problem der Kleinen.** Die Mindestanzahl lizenzierter Kerne wurde von 16 auf 72 angehoben und inzwischen wieder zurückgenommen. Genau das ist der beunruhigende Teil: Wer nicht abschätzen kann, zu welchen Bedingungen er in achtzehn Monaten verlängert, kann weder Budget noch Architektur seriös planen.\n\n**4. Das kleine Einstiegspaket ist ersatzlos entfallen.** Das frühere vSphere Essentials Kit hat keinen Nachfolger. Betroffene müssen auf deutlich teurere Editionen ausweichen — oder die Plattform verlassen.`,
      },
      {
        title: "Die dokumentierten Größenordnungen",
        body: `Über konkrete Zahlen wird viel spekuliert. Deshalb hier nur, was belegt ist:\n\n- AT&T dokumentierte in einer Gerichtsakte eine Erhöhung von 1.050 Prozent.\n- Der europäische Cloud-Verband CISPE berichtet bei seinen Mitgliedern von Steigerungen zwischen 800 und 1.500 Prozent und hat am 19. März 2026 Wettbewerbsbeschwerde bei der EU-Kommission eingereicht.\n- Für den DACH-Raum beziffern Branchenanalysen die Mehrkosten bei unveränderter Fortführung auf durchschnittlich rund 60 Prozent über sieben Jahre gegenüber dem alten Kauf-plus-Wartung-Modell.\n- Für mittelständische Vertragserneuerungen werden typischerweise Faktoren im Bereich 300 bis 600 Prozent berichtet.\n- Bereits eine kleinere Umgebung mit drei Hosts kann im neuen Lizenzmodell jährliche Lizenzkosten von rund 6.700 bis 7.700 Euro verursachen.\n\nDie Spannweite ist kein Zufall: Es hängt davon ab, welche Edition Sie hatten, wie viele Kerne Sie betreiben und in welches Bundle Sie fallen. Wir nennen hier bewusst keine Listenpreise — sie haben sich in den vergangenen zwei Jahren mehrfach geändert. Rechnen Sie mit Faktoren, nicht mit Preislisten, und rechnen Sie mit Ihren eigenen Kernen.`,
      },
      {
        title: "Das Datum, das die meisten übersehen",
        body: `Bis hierher ging es um Ihr Renewal. Es gibt aber ein zweites Datum, das unabhängig davon gilt: **Ende 2027 läuft der Support für vSphere 8 aus.** Version 9 und alle folgenden gibt es ausschließlich mit VVF- oder VCF-Lizenz.\n\nDas bedeutet: Auch wenn Sie gerade erst verlängert haben und das Thema für erledigt halten, steht Ihnen ein erzwungener Architekturwechsel bevor. Der Sprung auf die neue Plattformgeneration ist kein Update, sondern ein grundlegender Umbau, der bis in Ihr Betriebsmodell reicht. Damit stellt sich die Frage nicht mehr „wechseln oder bleiben“, sondern: In welche Architektur wechseln Sie — und zu welchen Konditionen?\n\nDer Markt hat diese Rechnung bereits gemacht: Gartner erwartet, dass bis 2028 rund 70 Prozent der VMware-Enterprise-Kunden mindestens die Hälfte ihrer Workloads migrieren.`,
      },
      {
        title: "Die drei Kostenfallen, die im Angebot nicht stehen",
        body: `**Erstens: Kerne, die Sie nicht nutzen.** Die Abrechnung erfolgt kernbasiert. Wenn Sie in den vergangenen Jahren auf leistungsfähigere, dichtere Server konsolidiert haben — also genau das getan haben, was betriebswirtschaftlich richtig war —, zahlen Sie heute dafür.\n\n**Zweitens: Funktionen im Bundle.** Sie kaufen ein Paket. Ob Sie die enthaltenen Netzwerk- und Automatisierungskomponenten je in Betrieb nehmen, spielt für den Preis keine Rolle. Für den Betriebsaufwand allerdings schon: Ungenutzte Komponenten müssen trotzdem gepatcht, dokumentiert und im Sicherheitskonzept berücksichtigt werden.\n\n**Drittens: Die Planungsunsicherheit selbst.** Das ist die teuerste Position, weil sie in keinem Angebot auftaucht. Wenn Sie nicht wissen, welche Konditionen in drei Jahren gelten, treffen Sie Übergangsentscheidungen — und die sind erfahrungsgemäß die teuersten.`,
      },
      {
        title: "Was jetzt zu tun ist — drei Schritte",
        body: `**Schritt 1 — Zwei Zahlen ermitteln.** Ihr Renewal-Datum und Ihre vSphere-Version. Beides steht in fünf Minuten fest und entscheidet, wie viel Zeit Sie haben.\n\n**Schritt 2 — Fünf Jahre rechnen, nicht ein Jahr.** Ein Vergleich über zwölf Monate führt fast immer zur Entscheidung, noch einmal zu verlängern. Über fünf Jahre kippt das Bild in vielen Fällen — weil Migrationskosten einmalig anfallen, Lizenzkosten aber jedes Jahr.\n\n**Schritt 3 — Die Alternative konkret durchrechnen, bevor Sie verhandeln.** Der beste Verhandlungshebel gegenüber jedem Anbieter ist eine belastbare Alternative. Nicht als Drohung — sondern weil Sie erst dann wissen, ob das Angebot vor Ihnen gut ist.`,
      },
      {
        title: "Und wann bleibt man?",
        body: `Es gibt gute Gründe, bei VMware zu bleiben, und wir nennen sie, weil wir Ihnen sonst nicht helfen:\n\n- Wenn Ihre zentrale Fachanwendung herstellerseitig nur auf ESXi supportet ist, entwertet ein Wechsel Ihren Supportvertrag.\n- Wenn Sie NSX für Mikrosegmentierung produktiv einsetzen, ist der Nachbau möglich — aber ein eigenes Projekt.\n- Wenn Sie VDI über Horizon betreiben, ist das ein separates Vorhaben.\n- Wenn Ihr Renewal in weniger als drei Monaten ansteht, verlängern Sie kurz und wechseln geordnet. Eine Migration unter Zeitdruck ist die teuerste Variante von allen.`,
      },
    ],
    disclosureLabel: "Offenlegung",
    disclosure: "Ferrion ist Huawei-Partner. Wir verdienen daran, wenn Sie wechseln. Genau deshalb steht dieser Abschnitt hier — Sie sollen unterscheiden können, wann wir beraten und wann wir verkaufen.",
    ctaTitle: "Der nächste Schritt",
    ctaText: "Wir rechnen Ihnen in 60 Minuten durch, was Bleiben und was Wechseln über fünf Jahre kostet. Sie brauchen dafür nur einen Screenshot Ihrer vCenter-Übersicht und Ihr letztes Lizenzangebot. Sie bekommen anschließend zwei Seiten mit drei Szenarien und einer Empfehlung — auch dann, wenn die Empfehlung lautet, dass Sie bleiben sollten. Kostenfrei, ohne Verkaufsgespräch, ohne Folgeverpflichtung.",
    ctaBtn: "VMware-Kostencheck vereinbaren →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    tag: "Virtualization",
    date: "May 12, 2026",
    readTime: "6 min read",
    headline: "VMware Costs 2026: What the Broadcom Transition Really Costs Austrian Mid-Market Companies",
    intro: "There are two ways an IT budget spirals out of control. The first is a project that ends up costing more than planned. The second is a contract renewal that looks like routine — and then contains a number nobody budgeted for. Since Broadcom's acquisition of VMware in November 2023, companies across the German-speaking market have been living the second case.",
    facts: [
      { label: "Documented increase (AT&T)", value: "1,050%" },
      { label: "CISPE member reports", value: "800–1,500%" },
      { label: "vSphere 8 end of support", value: "End of 2027" },
      { label: "Typical mid-market factor", value: "300–600%" },
    ],
    series: {
      label: "Part 1 / 2",
      note: "Already know what switching costs, and want to know how it actually works?",
      linkLabel: "Continue with: Migration Week by Week",
      href: "/newsroom/vmware-migration-huawei-dcs",
    },
    sections: [
      {
        title: "What Changed: Four Points",
        body: `**1. Perpetual licences no longer exist.** The "buy once, pay annual maintenance" model has been fully abolished. Every customer was moved to a subscription. An investment with residual value became a running obligation with none.\n\n**2. About 8,000 SKUs became four products.** The portfolio was radically consolidated into VMware Cloud Foundation, vSphere Foundation, vSphere Standard and vSphere Essentials Plus. Anyone who used to licence individual components now buys bundles — including features they never asked for.\n\n**3. The minimum order size became a problem for small deployments.** The minimum number of licensed cores was raised from 16 to 72, and has since been rolled back. That reversal is the actually unsettling part: if you can't predict the terms you'll renew under in eighteen months, you can't seriously plan budget or architecture.\n\n**4. The small entry-level package is gone, with no replacement.** The former vSphere Essentials Kit has no successor. Affected customers must move to significantly more expensive editions — or leave the platform.`,
      },
      {
        title: "The Documented Numbers",
        body: `A lot is speculated about concrete figures. So here is only what's documented:\n\n- AT&T documented a 1,050 percent increase in a court filing.\n- The European cloud association CISPE reports increases of 800 to 1,500 percent among its members and filed an antitrust complaint with the EU Commission on March 19, 2026.\n- For the DACH region, industry analyses put the added cost of an unchanged renewal at roughly 60 percent on average over seven years compared with the old buy-plus-maintenance model.\n- For mid-market contract renewals, factors in the range of 300 to 600 percent are typically reported.\n- Even a smaller three-host environment can generate annual licence costs of roughly €6,700 to €7,700 under the new model.\n\nThe spread isn't a coincidence: it depends heavily on which edition you had, how many cores you run, and which bundle you fall into. We deliberately don't quote list prices here — they've changed multiple times over the past two years. Plan around factors, not price lists, and plan around your own core count.`,
      },
      {
        title: "The Date Most Companies Are Missing",
        body: `Everything so far has been about your renewal. But there's a second date that applies regardless: **support for vSphere 8 ends at the end of 2027.** Version 9 and everything after it is available exclusively with a VVF or VCF licence.\n\nWhat this means: even if you just renewed and consider the topic closed, a forced architecture change is still ahead of you. The jump to the new platform generation isn't an update — it's a fundamental rebuild that reaches into your operating model. So the question is no longer "switch or stay," but: which architecture do you switch to — and on what terms?\n\nThe market has already done this math: Gartner expects that by 2028, around 70 percent of VMware enterprise customers will have migrated at least half of their workloads.`,
      },
      {
        title: "The Three Cost Traps That Aren't in the Quote",
        body: `**First: cores you don't use.** Billing is core-based. If you've consolidated onto more powerful, denser servers in recent years — exactly the operationally correct thing to do — you now pay for it.\n\n**Second: features in the bundle.** You buy a package. Whether you ever turn on the included networking and automation components makes no difference to the price. It does make a difference to your operational overhead: unused components still need to be patched, documented, and accounted for in your security concept.\n\n**Third: planning uncertainty itself.** This is the most expensive line item, because it never appears on any quote. If you don't know what terms will apply in three years, you end up making stopgap decisions — and those are, by experience, the most expensive kind.`,
      },
      {
        title: "What to Do Now — Three Steps",
        body: `**Step 1 — Establish two numbers.** Your renewal date and your vSphere version. Both take five minutes to confirm and determine how much time you actually have.\n\n**Step 2 — Model five years, not one.** A twelve-month comparison almost always leads to renewing again. Over five years, the picture flips in many cases — because migration costs are one-off, while licence costs recur every year.\n\n**Step 3 — Cost out the alternative concretely before you negotiate.** The strongest leverage against any vendor is a credible alternative — not as a threat, but because only then do you know whether the offer in front of you is actually good.`,
      },
      {
        title: "And When Should You Stay?",
        body: `There are good reasons to stay on VMware, and we name them, because otherwise we wouldn't be helping you:\n\n- If your core line-of-business application is only vendor-supported on ESXi, switching invalidates your support contract.\n- If you run NSX for micro-segmentation in production, rebuilding it is possible — but it's its own project.\n- If you run VDI on Horizon, that's a separate undertaking with its own timeline.\n- If your renewal is due in less than three months, renew briefly and switch in an orderly fashion afterwards. A migration under time pressure is the most expensive variant of all.`,
      },
    ],
    disclosureLabel: "Disclosure",
    disclosure: "Ferrion is a Huawei partner. We earn money if you switch. That's exactly why this section is here — so you can tell when we're advising and when we're selling.",
    ctaTitle: "The Next Step",
    ctaText: "We'll work out, in 60 minutes, what staying and what switching costs over five years. All you need is a screenshot of your vCenter overview and your latest licence quote. You'll get two pages back with three scenarios and a recommendation — even if that recommendation is to stay. Free, no sales pitch, no follow-up obligation.",
    ctaBtn: "Schedule a VMware Cost Check →",
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
            <li
              key={j}
              className="text-gray-400 text-sm leading-relaxed flex items-start gap-2"
            >
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
          <p
            key={j}
            className="text-gray-400 text-sm leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: withBold(line) }}
          />
        ))}
      </div>
    );
  });
}

export default function VMwareKosten2026Article({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <ArticleJsonLd slug="vmware-kosten-2026" locale={locale} />
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

          <div className="bg-[#111827] border border-white/10 p-5 mb-12">
            <p className="text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase mb-2">{t.disclosureLabel}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{t.disclosure}</p>
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
