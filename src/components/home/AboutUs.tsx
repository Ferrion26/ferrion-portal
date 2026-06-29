import { type Locale } from "@/lib/i18n/translations";

const content = {
  de: {
    tag: "Über uns",
    headline: "Infrastruktur-Expertise trifft Datenbank-Know-how",
    sub: "Ferrion ist ein inhabergeführtes IT-Systemhaus mit Fokus auf anspruchsvolle Infrastruktur-Lösungen. Wir verbinden marktführende Technologien mit tiefem Fachwissen — für IT-Lösungen, die heute überzeugen und morgen tragen.",
    vision: {
      label: "Vision",
      text: "Wir werden der bevorzugte Infrastruktur-Partner für anspruchsvolle österreichische Unternehmen und Organisationen — mit der Datenbank-Kompetenz, die uns von klassischen Boxmovern unterscheidet, und einem Service-Versprechen, das über den reinen Verkauf hinausgeht.",
    },
    mission: {
      label: "Mission",
      text: "Wir verbinden marktführende Infrastruktur-Technologie (Huawei, Pure Storage, Commvault) mit eigenem Datenbank-Know-how und liefern sie als durchgängiges Paket aus Beratung, Implementierung und Managed Services. Wiederkehrende Erlöse sichern die Substanz, das Projektgeschäft das Wachstum.",
    },
    teamLabel: "Gründerteam",
    team: [
      {
        name: "Alexander Popek",
        role: "Geschäftsführer",
        focus: "Sales, Partner- & Alliance-Management, People-Management",
        desc: "Aufbau und Steuerung der Herstellerbeziehungen, Vertriebssteuerung und Recruiting.",
        initials: "AP",
      },
      {
        name: "Peter Häusler",
        role: "Geschäftsführer",
        focus: "Pre-Sales & technische Leitung",
        desc: "Lösungsdesign, Projektverantwortung, technische Qualitätssicherung und Aufbau des Delivery-Teams.",
        initials: "PH",
      },
    ],
    uspLabel: "Unsere Alleinstellung",
    usps: [
      { icon: "🗄", title: "Datenbank-Know-how", desc: "Tiefe DB-Kompetenz ist im klassischen Systemhaus selten. Sie verschafft uns Zugang zu geschäftskritischen Workloads — und von dort zur Infrastruktur." },
      { icon: "🤝", title: "Herstellerbeziehungen", desc: "Etablierte, persönliche Beziehungen zu Huawei, Pure Storage und Commvault — inkl. erster Funded-Head-Zusage von Huawei." },
      { icon: "✅", title: "Vollständige Zertifizierungen", desc: "Alle nötigen Hersteller- und Fachzertifizierungen vorhanden. Partner-Level-Anforderungen werden von Beginn an erfüllt." },
      { icon: "🏢", title: "Warmer Kundenpool", desc: "Wir starten nicht auf der grünen Wiese: Bestehender Kundenpool und eine konkrete Projekt-Pipeline ab Tag 1." },
      { icon: "⚡", title: "Inhabergeführt & schlank", desc: "Zwei Geschäftsführer mit komplementären Profilen ermöglichen kurze Wege, schnelle Entscheidungen und hohe Kundennähe." },
      { icon: "🤖", title: "AI-Infrastruktur-Fokus", desc: "GPU Server, Private AI Cluster, NVIDIA-Infrastruktur, Kubernetes für AI, AI Storage & AI Disaster Recovery — wir begleiten Ihren Weg in die KI." },
    ],
  },
  en: {
    tag: "About Us",
    headline: "Infrastructure Expertise meets Database Know-how",
    sub: "Ferrion is an owner-managed IT systems house focused on demanding infrastructure solutions. We combine leading technologies with deep expertise — for IT solutions that impress today and stand tomorrow.",
    vision: {
      label: "Vision",
      text: "We will become the preferred infrastructure partner for demanding Austrian companies and organisations — with the database expertise that sets us apart from classic box-movers, and a service promise that goes beyond mere sales.",
    },
    mission: {
      label: "Mission",
      text: "We combine leading infrastructure technology (Huawei, Pure Storage, Commvault) with our own database know-how and deliver it as a complete package of consulting, implementation and managed services. Recurring revenues secure the substance, project business drives growth.",
    },
    teamLabel: "Founding Team",
    team: [
      {
        name: "Alexander Popek",
        role: "Managing Director",
        focus: "Sales, Partner & Alliance Management, People Management",
        desc: "Building and managing vendor relationships, sales management and recruiting.",
        initials: "AP",
      },
      {
        name: "Peter Häusler",
        role: "Managing Director",
        focus: "Pre-Sales & Technical Management",
        desc: "Solution design, project responsibility, technical quality assurance and building the delivery team.",
        initials: "PH",
      },
    ],
    uspLabel: "Our Unique Selling Points",
    usps: [
      { icon: "🗄", title: "Database Know-how", desc: "Deep database expertise is rare in classic IT resellers. It gives us access to business-critical workloads — and from there to the underlying infrastructure." },
      { icon: "🤝", title: "Vendor Relationships", desc: "Established, personal relationships with Huawei, Pure Storage and Commvault — including a first funded head commitment from Huawei." },
      { icon: "✅", title: "Full Certifications", desc: "All necessary vendor and technical certifications in place. Partner level requirements fulfilled from day one." },
      { icon: "🏢", title: "Warm Customer Pool", desc: "We're not starting from scratch: existing customer pool and a concrete project pipeline from day one." },
      { icon: "⚡", title: "Owner-managed & lean", desc: "Two managing directors with complementary profiles enable short decision paths, fast decisions and close customer proximity." },
      { icon: "🤖", title: "AI Infrastructure Focus", desc: "GPU servers, private AI clusters, NVIDIA infrastructure, Kubernetes for AI, AI storage & AI disaster recovery — we guide your journey into AI." },
    ],
  },
};

export default function AboutUs({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section id="ueber-uns" className="bg-[#0d1117] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.tag}</p>
          <h2 className="text-4xl font-bold text-white mb-4">{t.headline}</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">{t.sub}</p>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {[t.vision, t.mission].map((item) => (
            <div key={item.label} className="bg-[#111827] border border-white/10 p-8 hover:border-[#c9a84c]/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-[#c9a84c]" />
                <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase">{item.label}</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="mb-20">
          <p className="text-white font-bold text-xs tracking-widest uppercase mb-8 text-center">{t.teamLabel}</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {t.team.map((member) => (
              <div key={member.name} className="bg-[#111827] border border-white/10 p-8 flex gap-5 hover:border-[#c9a84c]/30 transition-colors">
                <div className="shrink-0 w-14 h-14 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] font-bold text-sm">
                  {member.initials}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{member.name}</p>
                  <p className="text-[#c9a84c] text-[10px] font-bold tracking-widest uppercase mb-2">{member.role}</p>
                  <p className="text-gray-300 text-xs font-medium mb-1">{member.focus}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* USPs */}
        <div>
          <p className="text-white font-bold text-xs tracking-widest uppercase mb-8 text-center">{t.uspLabel}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.usps.map((usp) => (
              <div key={usp.title} className="bg-[#111827] border border-white/10 p-6 hover:border-[#c9a84c]/30 transition-colors group">
                <div className="text-2xl mb-3">{usp.icon}</div>
                <p className="text-white font-bold text-sm mb-2 group-hover:text-[#c9a84c] transition-colors">{usp.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
