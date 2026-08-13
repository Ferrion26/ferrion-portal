"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { translations, type Locale } from "@/lib/i18n/translations";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function DashboardHeader({
  userName,
  locale,
  onMenuClick,
}: {
  userName?: string;
  locale: Locale;
  // Nur gesetzt vom Admin-Bereich (AdminShell) — Kunden-Dashboard hat keine
  // umschaltbare Sidebar, daher dort kein Hamburger-Button.
  onMenuClick?: () => void;
}) {
  const t = translations[locale].header;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-white/10 h-16 flex items-center">
      <div className="max-w-full px-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden flex flex-col gap-1.5 p-1"
              aria-label="Menü"
            >
              <span className="block w-5 h-0.5 bg-gray-300" />
              <span className="block w-5 h-0.5 bg-gray-300" />
              <span className="block w-5 h-0.5 bg-gray-300" />
            </button>
          )}
          <Link href="/">
            <img src="/logos/ferrion-full.webp" alt="Ferrion IT Systemhaus" className="h-9 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-xs text-gray-400 hidden md:block">{userName}</span>
          <LocaleSwitcher current={locale} />
          <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors tracking-widest uppercase">
            {t.homepage}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="border border-white/20 text-gray-300 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
