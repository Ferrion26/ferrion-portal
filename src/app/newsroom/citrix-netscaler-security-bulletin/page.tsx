import { cookies } from "next/headers";
import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export const dynamic = "force-dynamic";

const SOURCE_URL =
  "https://support.citrix.com/external/article/CTX696604/netscaler-adc-and-netscaler-gateway-secu.html";

type Severity = "high" | "medium";

const cves: {
  id: string;
  cvss: string;
  severity: Severity;
  cwe: string;
  type: { de: string; en: string };
  pre: { de: string; en: string };
}[] = [
  {
    id: "CVE-2026-8451",
    cvss: "8.8",
    severity: "high",
    cwe: "CWE-125",
    type: { de: "Out-of-Bounds Read — Speicher-Überlesen durch unzureichende Eingabevalidierung", en: "Out-of-bounds read — memory overread via insufficient input validation" },
    pre: { de: "Konfiguration als SAML IdP", en: "Configured as SAML IdP" },
  },
  {
    id: "CVE-2026-8452",
    cvss: "8.8",
    severity: "high",
    cwe: "CWE-119",
    type: { de: "Speicherüberlauf — unvorhersehbares Verhalten und Denial of Service", en: "Memory overflow — unpredictable behaviour and denial of service" },
    pre: { de: "Gateway- oder AAA-Virtual-Server", en: "Gateway or AAA virtual server" },
  },
  {
    id: "CVE-2026-8655",
    cvss: "8.8",
    severity: "high",
    cwe: "CWE-119",
    type: { de: "Mehrere Speicherüberlauf-Schwachstellen", en: "Multiple memory overflow vulnerabilities" },
    pre: { de: "Oracle LB, DNS-Proxy oder rekursiver DNS-Resolver", en: "Oracle LB, DNS proxy or recursive DNS resolver" },
  },
  {
    id: "CVE-2026-13474",
    cvss: "8.7",
    severity: "high",
    cwe: "CWE-401",
    type: { de: "Denial of Service über manipulierte HTTP/2-Requests", en: "Denial of service via malformed HTTP/2 requests" },
    pre: { de: "HTTP/2 im HTTP-Profil aktiviert", en: "HTTP/2 enabled in HTTP profile" },
  },
  {
    id: "CVE-2026-10816",
    cvss: "7.1",
    severity: "medium",
    cwe: "CWE-73",
    type: { de: "Unauthentifiziertes Arbitrary File Read", en: "Unauthenticated arbitrary file read" },
    pre: { de: "Zugriff auf NSIP, Cluster-Management-IP oder SNIP mit aktiviertem Management", en: "Access to NSIP, cluster management IP or SNIP with management enabled" },
  },
  {
    id: "CVE-2026-10817",
    cvss: "6.9",
    severity: "medium",
    cwe: "CWE-125",
    type: { de: "Out-of-Bounds Read durch unzureichende Eingabevalidierung", en: "Out-of-bounds read via insufficient input validation" },
    pre: { de: "TCP-Timestamp im TCP-Profil aktiviert", en: "TCP timestamp enabled in TCP profile" },
  },
];

const affected = [
  "NetScaler ADC & Gateway 14.1 vor / before 14.1-72.61",
  "NetScaler ADC & Gateway 13.1 vor / before 13.1-63.18",
  "NetScaler ADC FIPS vor / before 14.1-72.61 FIPS",
  "NetScaler ADC FIPS & NDcPP vor / before 13.1-37.272",
];

const fixed = [
  "14.1-72.61 (oder neuer / or later)",
  "13.1-63.18 (oder neuer / or later)",
  "14.1-72.61 FIPS (oder neuer / or later)",
  "13.1-37.272 (FIPS / NDcPP, oder neuer / or later)",
];

const content = {
  de: {
    tag: "Security",
    date: "30. Juni 2026",
    readTime: "5 Min. Lesezeit",
    headline: "Citrix Security Bulletin: Sechs Schwachstellen in NetScaler ADC & Gateway (CTX696604)",
    intro: "Cloud Software Group (Citrix) hat ein Security Bulletin (CTX696604) für NetScaler ADC und NetScaler Gateway veröffentlicht, das sechs Schwachstellen mit CVSS-Werten von bis zu 8,8 adressiert. Mehrere davon können von nicht authentifizierten Angreifern aus dem Netz ausgenutzt werden — von Denial of Service bis zum unautorisierten Lesen von Dateien. Betreiber sollten umgehend auf die bereitgestellten Builds aktualisieren.",
    cveLabel: "Die Schwachstellen im Überblick",
    colCvss: "CVSS v4.0",
    colType: "Typ",
    colPre: "Voraussetzung",
    affectedLabel: "Betroffene Versionen",
    fixedLabel: "Empfohlene Builds (Fix)",
    note: "Wichtiger Hinweis zu CVE-2026-13474",
    noteBody: "Für den Schutz vor CVE-2026-13474 ist neben dem Update zusätzlich eine Konfiguration nötig (sofern keine Strict-Profile genutzt werden):",
    eolLabel: "Hinweis",
    eolBody: "Ältere, nicht mehr unterstützte Versionen (End-of-Life) erhalten keine Fixes mehr und sollten zwingend auf eine unterstützte Version migriert werden.",
    doLabel: "Was Sie jetzt tun sollten",
    doItems: [
      "Prüfen Sie, ob Ihre NetScaler-Appliances zu den betroffenen Versionen zählen.",
      "Planen Sie das Update auf einen der empfohlenen Builds zeitnah ein.",
      "Setzen Sie für CVE-2026-13474 die zusätzliche HTTP/2-Konfiguration um.",
      "Überprüfen Sie, welche der Voraussetzungen (SAML IdP, Gateway/AAA, DNS, Management-Zugriff) in Ihrer Umgebung zutreffen.",
    ],
    helpLabel: "Unterstützung gewünscht?",
    helpBody: "Ferrion unterstützt Sie bei Bewertung, Patch-Planung und Härtung Ihrer Infrastruktur — sprechen Sie uns an.",
    cta: "Security-Beratung anfragen →",
    source: "Quelle: Citrix Security Bulletin CTX696604",
    back: "← Zurück zum Newsroom",
    sevHigh: "Hoch",
    sevMedium: "Mittel",
  },
  en: {
    tag: "Security",
    date: "June 30, 2026",
    readTime: "5 min read",
    headline: "Citrix Security Bulletin: Six Vulnerabilities in NetScaler ADC & Gateway (CTX696604)",
    intro: "Cloud Software Group (Citrix) has published a security bulletin (CTX696604) for NetScaler ADC and NetScaler Gateway addressing six vulnerabilities with CVSS scores of up to 8.8. Several of them can be exploited by unauthenticated attackers over the network — ranging from denial of service to unauthorised file reads. Operators should update to the provided builds without delay.",
    cveLabel: "The Vulnerabilities at a Glance",
    colCvss: "CVSS v4.0",
    colType: "Type",
    colPre: "Precondition",
    affectedLabel: "Affected Versions",
    fixedLabel: "Recommended Builds (Fix)",
    note: "Important Note on CVE-2026-13474",
    noteBody: "To be protected against CVE-2026-13474, an additional configuration is required besides the update (unless strict profiles are used):",
    eolLabel: "Note",
    eolBody: "Older, no longer supported (end-of-life) versions receive no fixes and must be migrated to a supported version.",
    doLabel: "What You Should Do Now",
    doItems: [
      "Check whether your NetScaler appliances are among the affected versions.",
      "Schedule the update to one of the recommended builds promptly.",
      "Apply the additional HTTP/2 configuration for CVE-2026-13474.",
      "Review which preconditions (SAML IdP, Gateway/AAA, DNS, management access) apply in your environment.",
    ],
    helpLabel: "Need Support?",
    helpBody: "Ferrion supports you with assessment, patch planning and hardening of your infrastructure — get in touch.",
    cta: "Request Security Consultation →",
    source: "Source: Citrix Security Bulletin CTX696604",
    back: "← Back to Newsroom",
    sevHigh: "High",
    sevMedium: "Medium",
  },
};

export default function CitrixNetScalerArticle() {
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
            <span className="text-[10px] text-red-400 border border-red-500/40 bg-red-900/20 px-2 py-0.5 font-bold tracking-wide uppercase">{t.tag}</span>
            <span className="text-gray-500 text-xs">{t.date}</span>
            <span className="text-gray-600 text-xs">{t.readTime}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-snug mb-6">{t.headline}</h1>
          <p className="text-gray-300 text-base leading-relaxed mb-10 border-l-2 border-red-500/60 pl-5">{t.intro}</p>

          {/* Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mb-12 border border-white/5">
            {[
              { v: "6", l: "CVEs" },
              { v: "8.8", l: "Max. CVSS" },
              { v: "14.1 / 13.1", l: locale === "de" ? "Betroffene Branches" : "Affected branches" },
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${c.severity === "high" ? "text-red-300 border-red-500/40 bg-red-900/20" : "text-amber-300 border-amber-500/40 bg-amber-900/10"}`}>
                    {t.colCvss} {c.cvss} · {c.severity === "high" ? t.sevHigh : t.sevMedium}
                  </span>
                  <span className="text-gray-600 text-[10px] font-mono">{c.cwe}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{c.type[locale]}</p>
                <p className="text-gray-500 text-xs mt-2">
                  <span className="text-gray-600 uppercase tracking-wide text-[10px] font-bold">{t.colPre}: </span>
                  {c.pre[locale]}
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

          {/* Note CVE-2026-13474 */}
          <div className="bg-[#111827] border border-[#c9a84c]/30 p-6 mb-6">
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-2">{t.note}</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-3">{t.noteBody}</p>
            <pre className="bg-[#0d1117] border border-white/10 px-4 py-3 text-xs text-gray-300 overflow-x-auto"><code>set ns httpProfile &lt;profile_name&gt; -http2SmallWndTimeout &lt;value_in_seconds&gt;</code></pre>
          </div>

          {/* EOL note */}
          <div className="bg-[#0d1117] border border-white/10 p-5 mb-12">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">{t.eolLabel}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{t.eolBody}</p>
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

          {/* Source */}
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-gray-500 text-xs hover:text-[#c9a84c] transition-colors">
            {t.source} ↗
          </a>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
