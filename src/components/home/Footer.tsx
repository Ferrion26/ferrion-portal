import Link from "next/link";

export default function Footer() {
  return (
    <footer id="kontakt" className="bg-[#080d12] border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded bg-[#4ade80] flex items-center justify-center">
                <span className="text-black font-bold text-xs">F</span>
              </div>
              <span className="font-bold text-white tracking-widest text-sm">FERRION</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              IT SYSTEMHAUS | SERVICES | MANAGED SERVICES
            </p>
          </div>

          {/* Lösungen */}
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-4">Lösungen</p>
            <ul className="space-y-2">
              {["Cloud & Virtualisierung", "Storage & Data Management", "Backup & Security", "Managed Services"].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-gray-500 text-xs hover:text-[#4ade80] transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Unternehmen */}
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-4">Unternehmen</p>
            <ul className="space-y-2">
              {["Über uns", "Newsroom", "Karriere", "Kundenbereich"].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-gray-500 text-xs hover:text-[#4ade80] transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <p className="text-white font-bold text-xs tracking-widest uppercase mb-4">Kontakt</p>
            <ul className="space-y-2 text-gray-500 text-xs">
              <li>📞 +49 123 456789-0</li>
              <li>✉ info@ferrion.de</li>
              <li>📍 Musterstraße 1, 12345 Musterstadt</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Ferrion IT Systemhaus. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6">
            {["Impressum", "Datenschutz", "AGB"].map((l) => (
              <Link key={l} href="#" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
