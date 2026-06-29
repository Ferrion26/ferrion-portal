import Link from "next/link";

export const metadata = {
  title: "Impressum — Ferrion IT Systemhaus",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/">
          <img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" />
        </Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Impressum</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">← Homepage</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">Rechtliche Informationen</p>
        <h1 className="text-3xl font-bold text-white mb-12">Impressum</h1>

        <section className="space-y-10 text-sm text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Angaben gemäß § 5 ECG</h2>
            <p className="font-medium text-white mb-1">Ferrion IT Systemhaus GmbH</p>
            <p>Wien, Österreich</p>
            <p className="mt-3">
              <span className="text-gray-500 text-xs uppercase tracking-widest">E-Mail</span><br />
              <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a>
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Geschäftsführung</h2>
            <p>Geschäftsführer A — Sales & Alliances</p>
            <p>Geschäftsführer B — Technik & Pre-Sales</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Unternehmensgegenstand</h2>
            <p>
              Handel mit IT-Infrastruktur (Storage, Server, Netzwerk), IT-Dienstleistungen (Beratung, Implementierung, Managed Services)
              sowie Datenbankservices.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Haftungsausschluss</h2>
            <p>
              Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
              der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 ECG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen
              des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Online-Streitbeilegung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">
                ec.europa.eu/consumers/odr
              </a>
            </p>
          </div>

        </section>
      </main>

      <footer className="border-t border-white/10 py-4 px-6 flex items-center justify-between">
        <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Ferrion IT Systemhaus</p>
        <div className="flex gap-6">
          <Link href="/impressum" className="text-gray-600 text-xs hover:text-gray-400">Impressum</Link>
          <Link href="/datenschutz" className="text-gray-600 text-xs hover:text-gray-400">Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
}
