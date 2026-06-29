import { translations, type Locale } from "@/lib/i18n/translations";

export default function Services({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const s = t.services;

  const services = [
    { icon: "☁", title: s.cloud.title, desc: s.cloud.desc },
    { icon: "🗄", title: s.storage.title, desc: s.storage.desc },
    { icon: "🛡", title: s.backup.title, desc: s.backup.desc },
    { icon: "⚙", title: s.managed.title, desc: s.managed.desc },
  ];

  const sectionTitle = locale === "de" ? "Unsere Lösungen" : "Our Solutions";
  const sectionHeading = locale === "de" ? "IT-Services aus einer Hand" : "IT Services from a Single Source";

  return (
    <section id="loesungen" className="bg-[#111820] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{sectionTitle}</p>
          <h2 className="text-4xl font-bold text-white">{sectionHeading}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-[#0d1117] border border-white/10 p-6 hover:border-[#c9a84c]/40 transition-colors group">
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-white font-bold mb-2 text-sm group-hover:text-[#c9a84c] transition-colors">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
