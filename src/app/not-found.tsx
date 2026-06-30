import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <img src="/logos/ferrion.svg" alt="Ferrion" className="h-10 w-auto mx-auto mb-12 opacity-60" />

        {/* 404 */}
        <p className="text-[120px] font-bold text-white/5 leading-none select-none mb-0" aria-hidden>
          404
        </p>
        <div className="-mt-8">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-4">Seite nicht gefunden</p>
          <h1 className="text-3xl font-bold text-white mb-4">Diese Seite existiert nicht.</h1>
          <p className="text-gray-500 text-sm mb-10">
            Die gesuchte Seite wurde möglicherweise verschoben oder gelöscht.
            <br />
            Kehren Sie zur Startseite zurück oder nehmen Sie Kontakt auf.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:bg-[#e0bc5a] transition-colors"
          >
            Zur Startseite →
          </Link>
          <Link
            href="/kontakt"
            className="inline-block border border-white/20 text-white text-xs font-bold tracking-widest uppercase px-7 py-3.5 hover:border-white/40 transition-colors"
          >
            Kontakt
          </Link>
        </div>

        <p className="text-gray-700 text-xs mt-12">© {new Date().getFullYear()} Ferrion IT Systemhaus</p>
      </div>
    </main>
  );
}
