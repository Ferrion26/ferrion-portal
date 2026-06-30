import { cookies } from "next/headers";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

const content = {
  de: {
    tag: "Huawei",
    date: "1. Oktober 2025",
    readTime: "7 Min. Lesezeit",
    headline: "Huawei OceanStor Dorado V7: Die neue Benchmark für All-Flash-Storage in der KI-Ära",
    intro: "Die digitale Transformation stellt Unternehmen vor immer größere Herausforderungen: Datenmengen wachsen exponentiell, KI-Anwendungen werden zum Standard und die Anforderungen an Verfügbarkeit, Performance und Sicherheit steigen kontinuierlich. Mit der neuen OceanStor Dorado V7-Serie präsentiert Huawei eine All-Flash-Storage-Plattform, die genau für diese Anforderungen entwickelt wurde — und dabei neue Maßstäbe in Sachen Performance, Intelligenz und Zukunftssicherheit setzt.",
    sections: [
      {
        title: "1. Performance und Architektur: Für die Anforderungen von morgen gebaut",
        body: `Die V7-Generation basiert auf einer komplett neuen Architektur, die speziell für KI- und datenintensive Workloads optimiert wurde. Mit bis zu 100 Millionen IOPS und einer Latenz von nur 0,03 ms (laut offiziellem Datenblatt) setzt die Plattform neue Standards für geschäftskritische Anwendungen. Möglich wird dies durch:\n\n**FlashLink®-Algorithmus:** Intelligente Zusammenarbeit zwischen Disk, Controller und DPU für maximale SSD-Ausnutzung.\n**Kunpeng-Prozessoren & PCIe 5.0:** Dreifache Systemleistung gegenüber der Vorgängergeneration.\n**End-to-End NVMe:** Volle Unterstützung für NVMe over RoCE, FC und TCP — für maximale Bandbreite und minimale Latenz.\n\nMit dieser Architektur sind Unternehmen bestens für die Integration von KI, Big Data und Echtzeit-Analysen gerüstet — und sichern sich einen klaren Wettbewerbsvorteil.`,
      },
      {
        title: "2. Konvergenz: Block, File und Object nativ vereint",
        body: `Die Dorado V7-Serie vereint erstmals Block-, File- und Object-Storage in einer einzigen, nativen Plattform. Für IT-Architekten bedeutet das:\n\n**Maximale Flexibilität:** Unterschiedlichste Workloads — von klassischen Datenbanken über Container bis hin zu KI-Anwendungen — laufen auf einer Infrastruktur.\n**Parallele Architektur:** Objekt-Workloads profitieren erstmals von der Performance und Zuverlässigkeit klassischer Enterprise-Storage-Systeme.\n\nDie Konvergenz reduziert Komplexität, vereinfacht das Management und ermöglicht eine konsistente Datenstrategie über alle Unternehmensbereiche hinweg.`,
      },
      {
        title: "3. Skalierbarkeit und Investitionsschutz",
        body: `Mit bis zu 128 Controllern und Exabyte-Skalierung ist die Dorado V7-Serie für das Datenwachstum der kommenden Jahre ausgelegt. Die FlashEver-Technologie ermöglicht:\n\n**Nahtlose Upgrades:** Neue und alte Generationen können im selben System betrieben werden.\n**Zero-Data-Migration:** Upgrades erfolgen ohne Serviceunterbrechung oder Datenverluste.\n\nDas bedeutet maximale Investitionssicherheit und eine Infrastruktur, die mit den Anforderungen des Unternehmens mitwächst.`,
      },
      {
        title: "4. Intelligente Sicherheit und Betrieb",
        body: `Sicherheit und Betriebseffizienz stehen im Fokus der neuen Generation:\n\n**KI-basierte Ransomware-Erkennung:** 99,99 % Erkennungsrate durch Analyse von I/O-Verhalten und Dateiinhalten.\n**AIOps & DME:** Proaktive Fehlererkennung, automatisierte Analysen und effizientes Management.\n**DPU-basierte SmartNICs:** Trennung von Daten- und Kontrollfluss für optimale Performance und Sicherheit.\n\nDiese Features ermöglichen einen hochautomatisierten, sicheren und resilienten Betrieb — auch in komplexen Multi-Cloud- und Hybrid-Umgebungen.`,
      },
      {
        title: "5. Enterprise-Zuverlässigkeit und Nachhaltigkeit",
        body: `Die neue SmartMatrix Full-Mesh-Architektur bietet:\n\n**Höchste Ausfallsicherheit:** Toleranz von bis zu 7 von 8 Controller-Ausfällen — ohne Datenverlust oder Serviceunterbrechung.\n**RAID 2.0+ mit RAID-TP:** Schutz vor dem gleichzeitigen Ausfall von bis zu drei Festplatten.\n**Energieeffizienz & Datenreduktion:** Nachhaltigkeit und niedrige Betriebskosten.`,
      },
      {
        title: "Fazit: Zukunftssichere Dateninfrastruktur für die KI-Ära",
        body: `Mit der OceanStor Dorado V7-Serie liefert Huawei eine Plattform, die nicht nur aktuelle, sondern auch zukünftige Anforderungen an Performance, Sicherheit und Flexibilität erfüllt: maximale Investitionssicherheit, höchste Verfügbarkeit und eine Infrastruktur, die Innovationen wie KI und Big Data optimal unterstützt.\n\nAls zertifizierter Huawei-Partner beraten wir Sie gerne persönlich und individuell zu Einsatzmöglichkeiten, Architektur und Migration der neuen Dorado V7-Serie.`,
      },
    ],
    facts: [
      { label: "IOPS", value: "100 Mio." },
      { label: "Latenz", value: "0,03 ms" },
      { label: "Controller", value: "bis 128" },
      { label: "Ransomware-Erkennung", value: "99,99 %" },
    ],
    cta: "Beratung zu Dorado V7 anfragen →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    tag: "Huawei",
    date: "October 1, 2025",
    readTime: "7 min read",
    headline: "Huawei OceanStor Dorado V7: The New Benchmark for All-Flash Storage in the AI Era",
    intro: "Digital transformation confronts companies with ever greater challenges: data volumes grow exponentially, AI applications become standard, and requirements for availability, performance and security rise continuously. With the new OceanStor Dorado V7 series, Huawei presents an all-flash storage platform built for exactly these demands — setting new standards in performance, intelligence and future-readiness.",
    sections: [
      {
        title: "1. Performance and Architecture: Built for Tomorrow's Demands",
        body: `The V7 generation is based on a completely new architecture optimised specifically for AI and data-intensive workloads. With up to 100 million IOPS and a latency of just 0.03 ms (per the official datasheet), the platform sets new standards for business-critical applications. This is made possible by:\n\n**FlashLink® algorithm:** Intelligent collaboration between disk, controller and DPU for maximum SSD utilisation.\n**Kunpeng processors & PCIe 5.0:** Triple the system performance compared to the previous generation.\n**End-to-end NVMe:** Full support for NVMe over RoCE, FC and TCP — for maximum bandwidth and minimal latency.\n\nWith this architecture, companies are well equipped for the integration of AI, big data and real-time analytics — securing a clear competitive advantage.`,
      },
      {
        title: "2. Convergence: Block, File and Object Natively Unified",
        body: `For the first time, the Dorado V7 series unifies block, file and object storage in a single, native platform. For IT architects, this means:\n\n**Maximum flexibility:** The most diverse workloads — from classic databases through containers to AI applications — run on one infrastructure.\n**Parallel architecture:** Object workloads benefit for the first time from the performance and reliability of classic enterprise storage systems.\n\nConvergence reduces complexity, simplifies management and enables a consistent data strategy across all business areas.`,
      },
      {
        title: "3. Scalability and Investment Protection",
        body: `With up to 128 controllers and exabyte scaling, the Dorado V7 series is designed for the data growth of the coming years. FlashEver technology enables:\n\n**Seamless upgrades:** New and old generations can operate in the same system.\n**Zero-data migration:** Upgrades occur without service interruption or data loss.\n\nThis means maximum investment security and an infrastructure that grows with the company's requirements.`,
      },
      {
        title: "4. Intelligent Security and Operations",
        body: `Security and operational efficiency are at the heart of the new generation:\n\n**AI-based ransomware detection:** 99.99% detection rate through analysis of I/O behaviour and file content.\n**AIOps & DME:** Proactive fault detection, automated analyses and efficient management.\n**DPU-based SmartNICs:** Separation of data and control flow for optimal performance and security.\n\nThese features enable highly automated, secure and resilient operations — even in complex multi-cloud and hybrid environments.`,
      },
      {
        title: "5. Enterprise Reliability and Sustainability",
        body: `The new SmartMatrix full-mesh architecture offers:\n\n**Highest fault tolerance:** Tolerance of up to 7 out of 8 controller failures — without data loss or service interruption.\n**RAID 2.0+ with RAID-TP:** Protection against the simultaneous failure of up to three disks.\n**Energy efficiency & data reduction:** Sustainability and low operating costs.`,
      },
      {
        title: "Conclusion: Future-Proof Data Infrastructure for the AI Era",
        body: `With the OceanStor Dorado V7 series, Huawei delivers a platform that meets not only current but also future requirements for performance, security and flexibility: maximum investment security, highest availability and an infrastructure that optimally supports innovations such as AI and big data.\n\nAs a certified Huawei partner, we are happy to advise you personally and individually on use cases, architecture and migration of the new Dorado V7 series.`,
      },
    ],
    facts: [
      { label: "IOPS", value: "100M" },
      { label: "Latency", value: "0.03 ms" },
      { label: "Controllers", value: "up to 128" },
      { label: "Ransomware detection", value: "99.99%" },
    ],
    cta: "Request Dorado V7 Consultation →",
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

export default function DoradoV7Article() {
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
