"use client";

import { useState, useEffect } from "react";
import { type Locale } from "@/lib/i18n/translations";

const copy = {
  de: {
    text: "Wir verwenden Cookies, um die Website-Funktionalität sicherzustellen und unsere Dienste zu verbessern. Durch die weitere Nutzung stimmen Sie der Verwendung von Cookies gemäß unserer",
    policy: "Datenschutzerklärung",
    accept: "Akzeptieren",
    decline: "Nur notwendige",
  },
  en: {
    text: "We use cookies to ensure website functionality and improve our services. By continuing to use this site, you consent to our use of cookies as described in our",
    policy: "Privacy Policy",
    accept: "Accept All",
    decline: "Essential Only",
  },
};

export default function CookieBanner({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const t = copy[locale];

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "all");
    document.cookie = "cookie-consent=all; max-age=31536000; path=/; SameSite=Lax";
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "essential");
    document.cookie = "cookie-consent=essential; max-age=31536000; path=/; SameSite=Lax";
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-gray-400 text-xs leading-relaxed flex-1">
          {t.text}{" "}
          <a href="/datenschutz" className="text-[#c9a84c] hover:underline">
            {t.policy}
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-xs font-bold tracking-widest uppercase px-4 py-2.5 border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors"
          >
            {t.decline}
          </button>
          <button
            onClick={accept}
            className="text-xs font-bold tracking-widest uppercase px-5 py-2.5 bg-[#c9a84c] text-black hover:bg-[#e0bc5a] transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
