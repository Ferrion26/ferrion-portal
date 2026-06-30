import { cookies } from "next/headers";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

const content = {
  de: {
    tag: "AI-Infrastruktur",
    date: "30. April 2024",
    readTime: "7 Min. Lesezeit",
    headline: "Private AI Cluster für Klinikgruppe: NVIDIA GPU On-Premise statt Cloud",
    intro: "Medizinische Daten gehören nicht in die Public Cloud — das ist für die MedAustria Klinikgruppe mit 8 Standorten und über 2.400 Mitarbeitern keine Frage. Als das Team beginnt, KI für die Analyse medizinischer Bilddaten einzusetzen, braucht es eine On-Premise-Lösung, die GPU-Power der Cloud-Riesen mit den Datenschutzanforderungen eines Krankenhauses vereint. Ferrion lieferte den privaten AI-Cluster in 6 Wochen.",
    sections: [
      {
        title: "Warum keine Cloud?",
        body: `Die MedAustria Klinikgruppe verarbeitet täglich tausende medizinische Bilder: CT-Scans, MRT-Aufnahmen, Röntgenbilder. KI-Modelle können Ärzte bei der Befundung unterstützen und Auffälligkeiten innerhalb von Sekunden markieren. Die Public Cloud scheidet jedoch aus mehreren Gründen aus:\n\n**DSGVO & Krankenhaus-Datenschutz:** Patientendaten dürfen österreichische Rechenzentren nicht verlassen. AWS, Azure und Google Cloud erfüllen diese Anforderung strukturell nicht — unabhängig von vertraglich zugesicherten Datenschutzgarantien.\n\n**Latenz:** Ein radiologisches KI-Modell muss in Echtzeit antworten. Cloud-Latenz von 50–200 ms ist für den klinischen Alltag nicht akzeptabel.\n\n**Kosten bei Scale:** Bei der geplanten Workload-Größe (180.000 Bildanalysen pro Jahr) wäre Cloud-GPU deutlich teurer als ein eigener Cluster — bereits ab Jahr 2 amortisiert sich der CapEx.`,
      },
      {
        title: "Die Architektur: NVIDIA + Huawei + VMware",
        body: `Ferrion designte eine dreischichtige Architektur:\n\n**Compute-Schicht:** 4× NVIDIA DGX H100 Server mit je 8× H100 80GB GPUs. Gesamtleistung: 32 GPUs mit 2.560 GB GPU-RAM. Die H100-Architektur (Hopper) ist speziell für AI-Inferenz in skalierbaren Clustern optimiert.\n\n**Storage-Schicht:** Huawei OceanStor A800 All-Flash-Array mit 200 TB NVMe-Kapazität. Trainings-Datasets und Modellartefakte werden direkt aus Flash-Storage geladen — Trainingszeiten sinken um 60 % gegenüber klassischem NAS.\n\n**Orchestrierung:** Kubernetes mit NVIDIA GPU Operator für automatische GPU-Zuteilung an Workloads. MLflow für Experiment-Tracking. Vollständige Isolation zwischen Modell-Training (R&D) und Inferenz-Produktion.`,
      },
      {
        title: "Deployment in 6 Wochen",
        body: `Woche 1–2: Hardware-Planung, Rack-Design, Bestellung und Lieferkoordination.\nWoche 3–4: Rack-Integration, Verkabelung (InfiniBand für GPU-Interconnect, 100GbE Uplinks), BIOS-Hardening.\nWoche 5: Kubernetes-Setup, NVIDIA GPU Operator, Netzwerk-Policies, VLAN-Segmentierung.\nWoche 6: Übergabe, Team-Training (2-tägiger Workshop), Go-Live mit dem ersten Produktions-Workload.\n\nDer erste medizinische KI-Workload — ein Modell zur Erkennung von Lungenknoten in CT-Scans — lief pünktlich zum geplanten Go-Live-Datum.`,
      },
      {
        title: "Ergebnis: KI Made in Austria",
        body: `Sechs Monate nach Go-Live analysiert der Cluster täglich 800–1.200 Bilder in der Produktion. Die Inferenz-Latenz liegt bei durchschnittlich 280 ms pro Bild — 40× schneller als die zuvor getestete Cloud-Alternative. Alle Daten verlassen zu keinem Zeitpunkt das eigene Rechenzentrum.\n\nDas R&D-Team der Klinikgruppe trainiert parallel drei neue Modelle. Die GPU-Auslastung liegt bei 78 % — ein Indikator für gesunde Kapazitätsplanung ohne Verschwendung.`,
      },
    ],
    facts: [
      { label: "GPU-Einheiten", value: "32×H100" },
      { label: "GPU-Speicher gesamt", value: "2.560 GB" },
      { label: "Inferenz-Latenz", value: "280 ms" },
      { label: "Deployment", value: "6 Wochen" },
    ],
    cta: "AI-Infrastruktur anfragen →",
    back: "← Zurück zum Newsroom",
  },
  en: {
    tag: "AI Infrastructure",
    date: "April 30, 2024",
    readTime: "7 min read",
    headline: "Private AI Cluster for Hospital Group: NVIDIA GPU On-Premise instead of Cloud",
    intro: "Medical data does not belong in the public cloud — for MedAustria Hospital Group with 8 sites and over 2,400 employees, that is not a question. When the team begins using AI to analyse medical imaging data, it needs an on-premise solution that combines the GPU power of cloud giants with the data protection requirements of a hospital. Ferrion delivered the private AI cluster in 6 weeks.",
    sections: [
      {
        title: "Why No Cloud?",
        body: `MedAustria processes thousands of medical images daily: CT scans, MRI images, X-rays. AI models can assist doctors in reporting and flag anomalies within seconds. However, public cloud is ruled out for several reasons:\n\n**GDPR & Hospital Data Protection:** Patient data must not leave Austrian data centres. AWS, Azure and Google Cloud do not structurally fulfil this requirement — regardless of contractually guaranteed data protection assurances.\n\n**Latency:** A radiological AI model must respond in real time. Cloud latency of 50–200 ms is not acceptable for clinical daily practice.\n\n**Cost at Scale:** At the planned workload size (180,000 image analyses per year), cloud GPU would be significantly more expensive than an in-house cluster — CapEx amortises from year 2 onwards.`,
      },
      {
        title: "The Architecture: NVIDIA + Huawei + VMware",
        body: `Ferrion designed a three-layer architecture:\n\n**Compute layer:** 4× NVIDIA DGX H100 servers with 8× H100 80GB GPUs each. Total capacity: 32 GPUs with 2,560 GB GPU RAM. The H100 architecture (Hopper) is specifically optimised for AI inference in scalable clusters.\n\n**Storage layer:** Huawei OceanStor A800 All-Flash Array with 200 TB NVMe capacity. Training datasets and model artefacts are loaded directly from flash storage — training times drop by 60% compared to conventional NAS.\n\n**Orchestration:** Kubernetes with NVIDIA GPU Operator for automatic GPU allocation to workloads. MLflow for experiment tracking. Full isolation between model training (R&D) and inference production.`,
      },
      {
        title: "Deployment in 6 Weeks",
        body: `Weeks 1–2: Hardware planning, rack design, ordering and delivery coordination.\nWeeks 3–4: Rack integration, cabling (InfiniBand for GPU interconnect, 100GbE uplinks), BIOS hardening.\nWeek 5: Kubernetes setup, NVIDIA GPU Operator, network policies, VLAN segmentation.\nWeek 6: Handover, team training (2-day workshop), go-live with the first production workload.\n\nThe first medical AI workload — a model for detecting pulmonary nodules in CT scans — went live on the planned go-live date.`,
      },
      {
        title: "Result: AI Made in Austria",
        body: `Six months after go-live, the cluster analyses 800–1,200 images daily in production. Inference latency averages 280 ms per image — 40× faster than the previously tested cloud alternative. All data never leaves the in-house data centre.\n\nThe hospital group's R&D team is simultaneously training three new models. GPU utilisation stands at 78% — an indicator of healthy capacity planning without waste.`,
      },
    ],
    facts: [
      { label: "GPU units", value: "32×H100" },
      { label: "Total GPU memory", value: "2,560 GB" },
      { label: "Inference latency", value: "280 ms" },
      { label: "Deployment", value: "6 weeks" },
    ],
    cta: "Request AI Infrastructure →",
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

export default function PrivateAIArticle() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;
  const t = content[locale];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/#newsroom" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
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
