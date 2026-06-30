import Link from "next/link";
import { type Locale } from "@/lib/i18n/translations";

const content = {
  de: {
    tagline: "Inhabergeführtes IT-Systemhaus mit Fokus auf Infrastruktur, Datenbank-Expertise und Managed Services.",
    solutions: "Lösungen",
    solutionLinks: [
      { label: "Storage & Infrastruktur", href: "/loesungen/storage" },
      { label: "Backup & Security", href: "/loesungen/backup" },
      { label: "AI-Infrastruktur", href: "/loesungen/ai-infrastruktur" },
      { label: "Managed Services", href: "/loesungen/managed-services" },
    ],
    company: "Unternehmen",
    companyLinks: [
      { label: "Über uns", href: "/#ueber-uns" },
      { label: "Newsroom", href: "/#newsroom" },
      { label: "Karriere", href: "/karriere" },
      { label: "FAQ", href: "/#faq" },
      { label: "Kontakt", href: "/kontakt" },
    ],
    contact: "Kontakt",
    founders: "Gründer",
    copyright: "Ferrion IT Systemhaus. Alle Rechte vorbehalten.",
    legal: [{ label: "Impressum", href: "/impressum" }, { label: "Datenschutz", href: "/datenschutz" }, { label: "AGB", href: "#" }],
    madeWith: "— build to endure",
  },
  en: {
    tagline: "Owner-managed IT systems house focused on infrastructure, database expertise and managed services.",
    solutions: "Solutions",
    solutionLinks: [
      { label: "Storage & Infrastructure", href: "/loesungen/storage" },
      { label: "Backup & Security", href: "/loesungen/backup" },
      { label: "AI Infrastructure", href: "/loesungen/ai-infrastruktur" },
      { label: "Managed Services", href: "/loesungen/managed-services" },
    ],
    company: "Company",
    companyLinks: [
      { label: "About Us", href: "/#ueber-uns" },
      { label: "Newsroom", href: "/#newsroom" },
      { label: "Careers", href: "/karriere" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/kontakt" },
    ],
    contact: "Contact",
    founders: "Founders",
    copyright: "Ferrion IT Systemhaus. All rights reserved.",
    legal: [{ label: "Imprint", href: "/impressum" }, { label: "Privacy Policy", href: "/datenschutz" }, { label: "Terms", href: "#" }],
    madeWith: "— build to endure",
  },
};

export default function Footer({ locale = "de" }: { locale?: Locale }) {
  const t = content[locale];

  return (
    <footer id="kontakt" className="bg-[#080d12] border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto mb-4" />
            <p className="text-gray-500 text-xs leading-relaxed mt-2 mb-4">{t.tagline}</p>
            <p className="text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase">{t.madeWith}</p>
          </div>

          {/* Lösungen */}
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-4">{t.solutions}</p>
            <ul className="space-y-2">
              {t.solutionLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-xs hover:text-[#c9a84c] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-4">{t.company}</p>
            <ul className="space-y-2">
              {t.companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-xs hover:text-[#c9a84c] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt & Team */}
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-4">{t.contact}</p>
            <ul className="space-y-2 text-gray-500 text-xs mb-6">
              <li>✉ info@ferrion.at</li>
              <li>📍 Wien, Österreich</li>
            </ul>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-3">{t.founders}</p>
            <ul className="space-y-1 text-gray-500 text-xs">
              <li>Geschäftsführer A — Sales & Alliances</li>
              <li>Geschäftsführer B — Technik & Pre-Sales</li>
            </ul>
          </div>
        </div>

        {/* Partners row */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-4">
            {locale === "de" ? "Zertifizierte Partner" : "Certified Partners"}
          </p>
          <div className="flex items-center gap-8 flex-wrap">
            <img src="/logos/Huawei_Standard_logo.svg.png" alt="Huawei" className="h-5 w-auto opacity-30 hover:opacity-60 transition-opacity" style={{ mixBlendMode: "screen" }} />
            <img src="/logos/Pure Storage Bug Orange_undefined.PNG" alt="Pure Storage" className="h-5 w-auto opacity-30 hover:opacity-60 transition-opacity" style={{ mixBlendMode: "screen" }} />
            <img src="/logos/cropped-favicon-commvault-1.png" alt="Commvault" className="h-5 w-auto opacity-30 hover:opacity-60 transition-opacity" style={{ mixBlendMode: "screen" }} />
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} {t.copyright}
          </p>
          <div className="flex gap-6">
            {t.legal.map((l) => (
              <Link key={l.label} href={l.href} className="text-gray-600 text-xs hover:text-gray-400 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
