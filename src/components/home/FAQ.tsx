"use client";

import { useState } from "react";
import { type Locale } from "@/lib/i18n/translations";
import FadeIn from "@/components/FadeIn";

const content = {
  de: {
    tag: "FAQ",
    headline: "Häufige Fragen",
    sub: "Antworten auf die Fragen, die uns am häufigsten gestellt werden.",
    items: [
      {
        q: "Wie schnell reagiert Ferrion auf Anfragen?",
        a: "Auf Beratungs- und Kontaktanfragen melden wir uns in der Regel innerhalb von 24 Stunden. Im Rahmen von Managed-Services-Verträgen gelten die vereinbarten SLA-Reaktionszeiten — bei kritischen Störungen reagieren wir deutlich schneller.",
      },
      {
        q: "Welche SLAs bietet Ferrion an?",
        a: "Wir bieten gestufte Service-Level vom Standard-Support (Reaktion < 24h, Servicezeit Mo–Fr) bis hin zu Premium-Verträgen mit 24/7-Monitoring und garantierten Reaktionszeiten unter 4 Stunden. Die konkrete Ausgestaltung richtet sich nach Ihrer Infrastruktur und Kritikalität.",
      },
      {
        q: "Unterstützt Ferrion bei der NIS2-Compliance?",
        a: "Ja. Wir begleiten Sie von der initialen Risikoanalyse über die technische Härtung (Immutable Backups, Air-Gap, Segmentierung) bis zur Dokumentation und Audit-Vorbereitung. Ein typisches NIS2-Readiness-Projekt setzen wir in rund 10 Wochen um. Eine kostenlose Erstbewertung ist möglich.",
      },
      {
        q: "Bleiben unsere Daten in Österreich?",
        a: "Für datenschutzkritische Workloads — etwa im Healthcare- oder Public-Sektor — setzen wir bewusst auf On-Premise- und Private-Cloud-Architekturen. Ihre Daten verlassen Ihr Rechenzentrum bzw. österreichische Standorte nicht, auch nicht bei AI-Workloads.",
      },
      {
        q: "Mit welchen Herstellern arbeitet Ferrion?",
        a: "Wir sind zertifizierter Partner von Huawei (Storage & Data Center), Pure Storage (Premium All-Flash) und Commvault (Data Protection). Im AI-Umfeld setzen wir auf NVIDIA-Infrastruktur. Wir beraten herstellerübergreifend und vermeiden bewusst Vendor-Lock-in.",
      },
      {
        q: "Können Sie bestehende Systeme ohne Downtime migrieren?",
        a: "In den allermeisten Fällen ja. Unser bewährtes Migrations-Playbook auf Basis von Storage-Replikation und Rolling-Failover ermöglicht unterbrechungsfreie Umzüge — auch im 24/7-Produktionsbetrieb. Eine 500-TB-Migration haben wir zuletzt mit null Minuten ungeplanter Downtime abgeschlossen.",
      },
    ],
  },
  en: {
    tag: "FAQ",
    headline: "Frequently Asked Questions",
    sub: "Answers to the questions we're asked most often.",
    items: [
      {
        q: "How quickly does Ferrion respond to enquiries?",
        a: "We typically respond to consultation and contact requests within 24 hours. Under managed services contracts, the agreed SLA response times apply — for critical incidents we respond significantly faster.",
      },
      {
        q: "What SLAs does Ferrion offer?",
        a: "We offer tiered service levels from standard support (response < 24h, service hours Mon–Fri) to premium contracts with 24/7 monitoring and guaranteed response times under 4 hours. The specific arrangement depends on your infrastructure and its criticality.",
      },
      {
        q: "Does Ferrion support NIS2 compliance?",
        a: "Yes. We guide you from the initial risk analysis through technical hardening (immutable backups, air-gap, segmentation) to documentation and audit preparation. We deliver a typical NIS2 readiness project in around 10 weeks. A free initial assessment is available.",
      },
      {
        q: "Does our data stay in Austria?",
        a: "For privacy-critical workloads — such as in the healthcare or public sector — we deliberately rely on on-premise and private cloud architectures. Your data does not leave your data centre or Austrian sites, not even for AI workloads.",
      },
      {
        q: "Which vendors does Ferrion work with?",
        a: "We are a certified partner of Huawei (storage & data center), Pure Storage (premium all-flash) and Commvault (data protection). In the AI space we rely on NVIDIA infrastructure. We advise across vendors and deliberately avoid vendor lock-in.",
      },
      {
        q: "Can you migrate existing systems without downtime?",
        a: "In the vast majority of cases, yes. Our proven migration playbook based on storage replication and rolling failover enables non-disruptive moves — even in 24/7 production. We recently completed a 500 TB migration with zero minutes of unplanned downtime.",
      },
    ],
  },
};

export default function FAQ({ locale }: { locale: Locale }) {
  const t = content[locale];
  const [open, setOpen] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section id="faq" className="bg-[#0d1117] py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn className="text-center mb-14">
          <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-3">{t.tag}</p>
          <h2 className="text-4xl font-bold text-white mb-4">{t.headline}</h2>
          <p className="text-gray-500 text-sm">{t.sub}</p>
        </FadeIn>

        <div className="space-y-3">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <FadeIn key={item.q} delay={i * 50}>
                <div className="bg-[#111827] border border-white/10 hover:border-white/20 transition-colors">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm font-bold transition-colors ${isOpen ? "text-[#c9a84c]" : "text-white"}`}>
                      {item.q}
                    </span>
                    <span
                      className={`shrink-0 text-[#c9a84c] text-xl leading-none transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? "320px" : "0px" }}
                  >
                    <p className="text-gray-400 text-sm leading-relaxed px-6 pb-5">{item.a}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
