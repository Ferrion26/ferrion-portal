"use client";

import { useRef, useState } from "react";
import { type Locale } from "@/lib/i18n/translations";

const copy = {
  de: {
    eyebrow: "Imagefilm",
    headline: "Technologie,\ndie bewegt.",
    body: "Ferrion liefert keine Produkte — sondern Lösungen, die Unternehmen wachsen lassen. Erfahren Sie in unserem Imagefilm, wer wir sind und warum unsere Kunden uns vertrauen.",
    cta: "Beratung anfragen →",
    ctaHref: "/beratung",
    mute: "Ton an",
    unmute: "Ton aus",
  },
  en: {
    eyebrow: "Brand Film",
    headline: "Technology\nthat moves.",
    body: "Ferrion doesn't deliver products — it delivers solutions that help companies grow. Discover in our brand film who we are and why our clients trust us.",
    cta: "Request Consultation →",
    ctaHref: "/beratung",
    mute: "Unmute",
    unmute: "Mute",
  },
};

export default function Showreel({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  return (
    <section className="relative bg-[#0d1117] overflow-hidden py-24 lg:py-32">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gold glow behind video */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-80 h-[600px] bg-[#c9a84c]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <p className="text-[#c9a84c] text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-[#c9a84c]" />
              {t.eyebrow}
            </p>

            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-8 whitespace-pre-line">
              {t.headline}
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md">
              {t.body}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={t.ctaHref}
                className="inline-block border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-6 py-3 text-xs font-bold tracking-widest uppercase"
              >
                {t.cta}
              </a>
              <button
                onClick={toggleMute}
                className="inline-flex items-center gap-2 border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors px-6 py-3 text-xs font-bold tracking-widest uppercase"
              >
                {muted ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    {t.mute}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    {t.unmute}
                  </>
                )}
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-14 flex gap-10 border-t border-white/10 pt-10">
              {[
                { num: "15+", label: locale === "de" ? "Jahre Erfahrung" : "Years Experience" },
                { num: "200+", label: locale === "de" ? "Projekte" : "Projects" },
                { num: "98%", label: locale === "de" ? "Kundenzufriedenheit" : "Client Satisfaction" },
              ].map((s) => (
                <div key={s.num}>
                  <p className="text-3xl font-bold text-[#c9a84c]">{s.num}</p>
                  <p className="text-gray-500 text-xs tracking-wide mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — vertical video */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Outer glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-b from-[#c9a84c]/40 via-[#c9a84c]/10 to-transparent rounded-3xl blur-sm" />

              {/* Video card */}
              <div className="relative rounded-2xl overflow-hidden border border-[#c9a84c]/30 shadow-2xl"
                style={{ width: "260px", height: "462px" }}>

                <video
                  ref={videoRef}
                  src="/images/FERRION_Imagefilm_9x16.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                {/* Ferrion badge top */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">Ferrion</span>
                  </div>
                  <div className="bg-[#c9a84c]/90 px-2 py-1 rounded-full">
                    <span className="text-black text-[9px] font-bold tracking-wide uppercase">LIVE</span>
                  </div>
                </div>

                {/* Bottom label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
                    <p className="text-white text-[10px] font-bold">IT Systemhaus Wien</p>
                    <p className="text-[#c9a84c] text-[9px] tracking-wide mt-0.5">build to endure</p>
                  </div>
                </div>
              </div>

              {/* Decorative lines */}
              <div className="absolute -right-8 top-12 w-6 h-px bg-[#c9a84c]/40" />
              <div className="absolute -right-8 top-16 w-4 h-px bg-[#c9a84c]/20" />
              <div className="absolute -left-8 bottom-12 w-6 h-px bg-[#c9a84c]/40" />
              <div className="absolute -left-8 bottom-16 w-4 h-px bg-[#c9a84c]/20" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
