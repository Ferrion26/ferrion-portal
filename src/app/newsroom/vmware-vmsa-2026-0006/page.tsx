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
  return articleMetadata("vmware-vmsa-2026-0006", searchParams);
}

const SOURCES = [
  { label: "heise.de", url: "https://www.heise.de/news/VMware-ESX-vCenter-Workstation-und-Fusion-Updates-schliessen-kritische-Luecken-11386401.html" },
  { label: "Broadcom (VMSA-2026-0006)", url: "https://knowledge.broadcom.com/external/article/449886/vmware-telco-cloud-response-to-vmsa20260.html" },
];

type Severity = "critical" | "high" | "low";

const cves: {
  id: string;
  cvss: string;
  severity: Severity;
  type: { de: string; en: string };
  affects: { de: string; en: string };
}[] = [
  {
    id: "CVE-2026-59309",
    cvss: "9.8",
    severity: "critical",
    type: { de: "Authentifizierungs-Umgehung im VMware Directory Service", en: "Authentication bypass in VMware Directory Service" },
    affects: { de: "vCenter Server — aus dem Netz, ohne Anmeldedaten ausnutzbar", en: "vCenter Server — exploitable over the network without credentials" },
  },
  {
    id: "CVE-2026-59310",
    cvss: "9.8",
    severity: "critical",
    type: { de: "Path Traversal im Syslog-Server, führt zu Remote Code Execution", en: "Path traversal in the syslog server, leading to remote code execution" },
    affects: { de: "vCenter Server — aus dem Netz, ohne Anmeldedaten ausnutzbar", en: "vCenter Server — exploitable over the network without credentials" },
  },
  {
    id: "CVE-2026-47876",
    cvss: "9.3",
    severity: "critical",
    type: { de: "Pufferüberlauf im virtuellen Netzwerkadapter VMXNET3", en: "Buffer overflow in the VMXNET3 virtual network adapter" },
    affects: { de: "ESX — lokale VM-Administratoren können auf das Hostsystem ausbrechen", en: "ESX — local VM administrators can break out to the host system" },
  },
  {
    id: "CVE-2026-41703",
    cvss: "7.6",
    severity: "high",
    type: { de: "Out-of-Bounds Read (Speicher-Überlesen)", en: "Out-of-bounds memory read" },
    affects: { de: "ESX, Workstation, Fusion — Risiko von Informationsabfluss oder Denial of Service", en: "ESX, Workstation, Fusion — risk of information disclosure or denial of service" },
  },
  {
    id: "CVE-2026-41709",
    cvss: "2.7",
    severity: "low",
    type: { de: "Unvollständige Protokollierung", en: "Incomplete logging" },
    affects: { de: "ESX — Administratoren können Operationen ohne Protokolleintrag ausführen", en: "ESX — administrators can perform operations without a log entry" },
  },
];

const affected = [
  "VMware Cloud Foundation & vSphere Foundation",
  "VMware ESX / ESXi",
  "VMware vCenter Server",
  "VMware Workstation & Fusion",
  "VMware Telco Cloud Platform & Telco Cloud Infrastructure",
];

const fixed = [
  "Cloud Foundation / vSphere Foundation 9.1.0.0300, 9.0.2.0100",
  "ESXi-9.1.0.0200-25557999, ESXi-9.0.2.0100-25595025, ESXi80U3i-25205845",
  "vCenter Cloud Foundation 8.0 U3k (ESXi80U3k-25595708)",
  "VMware Workstation & Fusion 26H1",
  "Cloud Foundation 5.2.3",
];

const content = {
  de: {
    tag: "Security",
    date: "30. Juli 2026",
    readTime: "5 Min. Lesezeit",
    headline: "VMSA-2026-0006: Kritische Lücken in VMware ESX, vCenter, Workstation und Fusion",
    intro: "Broadcom hat mit dem Security-Advisory VMSA-2026-0006 fünf Schwachstellen in VMware ESX, vCenter Server, Workstation und Fusion veröffentlicht — zwei davon mit dem Höchstwert 9,8 auf der CVSS-Skala. Beide kritischen Lücken lassen sich ohne Anmeldedaten aus dem Netz ausnutzen und ermöglichen unautorisierten administrativen Zugriff bzw. Remote Code Execution auf vCenter Server. Für die kritischsten Schwachstellen gibt es laut Broadcom keine Workarounds — nur die bereitgestellten Updates schließen die Lücken.",
    cveLabel: "Die Schwachstellen im Überblick",
    colCvss: "CVSS",
    colAffects: "Betroffen / Risiko",
    affectedLabel: "Betroffene Produkte",
    fixedLabel: "Fix-Versionen",
    noWorkaroundLabel: "Kein Workaround",
    noWorkaroundBody: "Für CVE-2026-59309 und CVE-2026-59310 stellt Broadcom explizit keine Übergangslösung bereit. Der einzige Schutz ist das Einspielen der aktualisierten Versionen.",
    doLabel: "Was Sie jetzt tun sollten",
    doItems: [
      "Prüfen Sie, ob Ihre vCenter-, ESX-, Workstation- oder Fusion-Installationen betroffene Versionen einsetzen.",
      "Planen Sie das Update auf die bereitgestellten Fix-Versionen als Priorität ein — insbesondere für vCenter Server.",
      "Beschränken Sie den Netzwerkzugriff auf vCenter-Management-Schnittstellen, bis das Update eingespielt ist.",
      "Prüfen Sie ESX-Hosts mit VMXNET3-Adaptern auf besondere Isolationsanforderungen zwischen VMs.",
    ],
    helpLabel: "Unterstützung gewünscht?",
    helpBody: "Ferrion unterstützt Sie bei Bewertung, Patch-Planung und Härtung Ihrer VMware-Infrastruktur — sprechen Sie uns an.",
    cta: "Security-Beratung anfragen →",
    source: "Quellen",
    back: "← Zurück zum Newsroom",
    sevCritical: "Kritisch",
    sevHigh: "Hoch",
    sevLow: "Niedrig",
  },
  en: {
    tag: "Security",
    date: "July 30, 2026",
    readTime: "5 min read",
    headline: "VMSA-2026-0006: Critical Vulnerabilities in VMware ESX, vCenter, Workstation and Fusion",
    intro: "Broadcom has published security advisory VMSA-2026-0006, addressing five vulnerabilities in VMware ESX, vCenter Server, Workstation and Fusion — two of them rated at the maximum CVSS score of 9.8. Both critical flaws can be exploited over the network without credentials, enabling unauthorised administrative access or remote code execution on vCenter Server. Broadcom explicitly states there are no workarounds for the most critical issues — only the provided updates close the gaps.",
    cveLabel: "The Vulnerabilities at a Glance",
    colCvss: "CVSS",
    colAffects: "Affected / Risk",
    affectedLabel: "Affected Products",
    fixedLabel: "Fixed Versions",
    noWorkaroundLabel: "No Workaround",
    noWorkaroundBody: "Broadcom explicitly provides no interim mitigation for CVE-2026-59309 or CVE-2026-59310. The only protection is installing the updated versions.",
    doLabel: "What You Should Do Now",
    doItems: [
      "Check whether your vCenter, ESX, Workstation or Fusion installations run affected versions.",
      "Prioritise updating to the provided fixed versions — especially for vCenter Server.",
      "Restrict network access to vCenter management interfaces until the update is applied.",
      "Review ESX hosts using VMXNET3 adapters for additional isolation requirements between VMs.",
    ],
    helpLabel: "Need Support?",
    helpBody: "Ferrion supports you with assessment, patch planning and hardening of your VMware infrastructure — get in touch.",
    cta: "Request Security Consultation →",
    source: "Sources",
    back: "← Back to Newsroom",
    sevCritical: "Critical",
    sevHigh: "High",
    sevLow: "Low",
  },
};

const sevClass = (s: Severity) =>
  s === "critical"
    ? "text-red-300 border-red-500/40 bg-red-900/20"
    : s === "high"
    ? "text-amber-300 border-amber-500/40 bg-amber-900/10"
    : "text-gray-400 border-white/20 bg-white/5";

export default function VMwareVmsaArticle({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  const t = content[locale];
  const sevLabel = (s: Severity) => (s === "critical" ? t.sevCritical : s === "high" ? t.sevHigh : t.sevLow);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header locale={locale} />
      <ArticleJsonLd slug="vmware-vmsa-2026-0006" locale={locale} />
      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/newsroom" className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase hover:underline mb-10 block">
            {t.back}
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] text-red-400 border border-red-500/40 bg-red-900/20 px-2 py-0.5 font-bold tracking-wide uppercase">{t.tag}</span>
            <span className="text-gray-500 text-xs">{t.date}</span>
            <span className="text-gray-600 text-xs">{t.readTime}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-snug mb-6">{t.headline}</h1>
          <p className="text-gray-300 text-base leading-relaxed mb-10 border-l-2 border-red-500/60 pl-5">{t.intro}</p>

          {/* Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mb-12 border border-white/5">
            {[
              { v: "5", l: "CVEs" },
              { v: "9.8", l: "Max. CVSS" },
              { v: "0", l: locale === "de" ? "Workarounds" : "Workarounds" },
              { v: "Patch", l: locale === "de" ? "Verfügbar" : "Available" },
            ].map((f) => (
              <div key={f.l} className="bg-[#0d1117] px-5 py-4 text-center">
                <p className="text-xl font-bold text-[#c9a84c]">{f.v}</p>
                <p className="text-gray-500 text-[10px] mt-1">{f.l}</p>
              </div>
            ))}
          </div>

          {/* CVE list */}
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <span className="inline-block w-4 h-px bg-[#c9a84c] shrink-0" />
            {t.cveLabel}
          </h2>
          <div className="space-y-3 mb-12">
            {cves.map((c) => (
              <div key={c.id} className="bg-[#111827] border border-white/10 p-5">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-white font-bold text-sm font-mono">{c.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${sevClass(c.severity)}`}>
                    {t.colCvss} {c.cvss} · {sevLabel(c.severity)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{c.type[locale]}</p>
                <p className="text-gray-500 text-xs mt-2">
                  <span className="text-gray-600 uppercase tracking-wide text-[10px] font-bold">{t.colAffects}: </span>
                  {c.affects[locale]}
                </p>
              </div>
            ))}
          </div>

          {/* Affected + Fixed */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div>
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{t.affectedLabel}</h2>
              <ul className="space-y-2">
                {affected.map((a) => (
                  <li key={a} className="text-gray-400 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-red-400 mt-0.5">▸</span>{a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{t.fixedLabel}</h2>
              <ul className="space-y-2">
                {fixed.map((f) => (
                  <li key={f} className="text-gray-400 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-[#c9a84c] mt-0.5">▸</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* No workaround note */}
          <div className="bg-[#111827] border border-red-500/30 p-6 mb-12">
            <p className="text-red-300 text-xs font-bold tracking-widest uppercase mb-2">{t.noWorkaroundLabel}</p>
            <p className="text-gray-400 text-sm leading-relaxed">{t.noWorkaroundBody}</p>
          </div>

          {/* What to do */}
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <span className="inline-block w-4 h-px bg-[#c9a84c] shrink-0" />
            {t.doLabel}
          </h2>
          <ul className="space-y-3 mb-12">
            {t.doItems.map((d) => (
              <li key={d} className="text-gray-400 text-sm flex items-start gap-3 leading-relaxed">
                <span className="text-[#c9a84c] mt-0.5">▸</span>{d}
              </li>
            ))}
          </ul>

          {/* Help CTA */}
          <div className="bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-8 mb-8">
            <p className="text-white font-bold text-lg mb-2">{t.helpLabel}</p>
            <p className="text-gray-400 text-sm mb-6 max-w-lg">{t.helpBody}</p>
            <Link href="/beratung" className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors">
              {t.cta}
            </Link>
          </div>

          {/* Sources */}
          <p className="text-gray-500 text-xs">
            {t.source}:{" "}
            {SOURCES.map((s, i) => (
              <span key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">{s.label}</a>
                {i < SOURCES.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
