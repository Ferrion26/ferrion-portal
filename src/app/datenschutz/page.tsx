import Link from "next/link";

export const metadata = {
  title: "Datenschutz — Ferrion IT Systemhaus",
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/">
          <img src="/logos/ferrion.svg" alt="Ferrion" className="h-9 w-auto" />
        </Link>
        <div className="h-5 w-px bg-white/20 mx-6" />
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Datenschutz</span>
        <Link href="/" className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">← Homepage</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">Rechtliche Informationen</p>
        <h1 className="text-3xl font-bold text-white mb-4">Datenschutzerklärung</h1>
        <p className="text-gray-500 text-xs mb-12">Gemäß DSGVO (EU) 2016/679 und DSG 2018</p>

        <section className="space-y-10 text-sm text-gray-300 leading-relaxed">

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der DSGVO ist:<br /><br />
              <span className="text-white font-medium">Ferrion IT Systemhaus GmbH</span><br />
              Wien, Österreich<br />
              <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a>
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
            <p className="mb-3">
              Wir erheben personenbezogene Daten nur, wenn Sie uns diese im Rahmen einer Kontaktaufnahme oder Nutzung unserer
              Dienste freiwillig mitteilen. Dies betrifft insbesondere:
            </p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300">Beratungsanfragen:</span> Name, Unternehmen, E-Mail-Adresse, Telefonnummer (optional), Projektbeschreibung</li>
              <li><span className="text-gray-300">Kundenportal:</span> E-Mail-Adresse, Passwort (verschlüsselt gespeichert)</li>
              <li><span className="text-gray-300">Server-Logs:</span> IP-Adresse, Zeitstempel, aufgerufene Seite (für 7 Tage)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">3. Zweck der Datenverarbeitung</h2>
            <p className="mb-3">Die erhobenen Daten werden ausschließlich verwendet für:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Bearbeitung und Beantwortung von Beratungsanfragen</li>
              <li>Bereitstellung des Kundenportals</li>
              <li>Technischen Betrieb und Sicherheit der Website</li>
            </ul>
            <p className="mt-3">Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung / Vertragserfüllung) sowie lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb).</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">4. Weitergabe an Dritte</h2>
            <p className="mb-3">Ihre Daten werden nicht an Dritte verkauft. Eine Weitergabe erfolgt nur an technische Dienstleister im Rahmen der Auftragsverarbeitung:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300">Vercel Inc.</span> (Hosting, USA) — Standardvertragsklauseln gemäß Art. 46 DSGVO</li>
              <li><span className="text-gray-300">Supabase Inc.</span> (Datenbank, EU-Region) — Auftragsverarbeitungsvertrag</li>
              <li><span className="text-gray-300">Resend Inc.</span> (E-Mail-Versand, USA) — Standardvertragsklauseln gemäß Art. 46 DSGVO</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">5. Cookies</h2>
            <p>
              Wir verwenden ausschließlich technisch notwendige Cookies:
            </p>
            <ul className="space-y-2 list-disc list-inside text-gray-400 mt-3">
              <li><span className="text-gray-300">Session-Cookie (next-auth.session-token):</span> Für die Anmeldung im Kundenportal. Wird beim Abmelden gelöscht.</li>
              <li><span className="text-gray-300">Sprach-Cookie (locale):</span> Speichert Ihre Sprachpräferenz (DE/EN) für 1 Jahr.</li>
            </ul>
            <p className="mt-3">Marketing- oder Tracking-Cookies werden nicht verwendet.</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">6. Ihre Rechte</h2>
            <p className="mb-3">Sie haben gemäß DSGVO folgende Rechte:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-3">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a href="mailto:info@ferrion.at" className="text-[#c9a84c] hover:underline">info@ferrion.at</a>
            </p>
            <p className="mt-3">
              Sie haben außerdem das Recht, sich bei der österreichischen Datenschutzbehörde zu beschweren:{" "}
              <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">
                www.dsb.gv.at
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">7. Speicherdauer</h2>
            <p>
              Beratungsanfragen werden für die Dauer der Geschäftsbeziehung gespeichert und danach nach gesetzlichen
              Aufbewahrungsfristen (in der Regel 7 Jahre) gelöscht. Server-Logs werden nach 7 Tagen automatisch gelöscht.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-xs tracking-widest uppercase mb-4 border-b border-white/10 pb-2">8. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie stets den aktuellen rechtlichen
              Anforderungen zu entsprechen. Die jeweils aktuelle Version ist auf dieser Seite verfügbar.
            </p>
          </div>

        </section>

        <p className="text-gray-600 text-xs mt-12">Stand: Juni 2026</p>
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
