"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { translations, type Locale } from "@/lib/i18n/translations";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function Header({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nav = [
    { label: t.nav.solutions, href: "#loesungen" },
    { label: t.nav.about, href: "#ueber-uns" },
    { label: t.nav.newsroom, href: "#newsroom" },
    { label: t.nav.customerArea, href: "/dashboard" },
    { label: t.nav.contact, href: "/kontakt" },
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(t.login.error);
      return;
    }
    const res = await fetch("/api/auth/session");
    const sess = await res.json();
    window.location.href = sess?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/">
          <img src="/logos/ferrion.svg" alt="Ferrion IT Systemhaus" className="h-10 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium tracking-widest text-gray-300 hover:text-white transition-colors uppercase"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher current={locale} />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden flex flex-col gap-1.5 p-1"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <span className={`block w-5 h-0.5 bg-[#c9a84c] transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#c9a84c] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#c9a84c] transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setLoginOpen((v) => !v)}
              className="flex items-center gap-2 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
            >
              {t.login.button}
            </button>

            {loginOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setLoginOpen(false)} />
                <div className="absolute right-0 top-10 w-72 bg-[#1a2332] border border-white/10 shadow-2xl p-5 z-50">
                  <p className="text-xs font-bold tracking-widest text-gray-300 uppercase mb-4">
                    {t.login.title}
                  </p>
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">🔒</span>
                      <input
                        type="email"
                        required
                        placeholder={t.login.username}
                        className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-9 py-2 placeholder-gray-500 focus:border-[#c9a84c] focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">🔒</span>
                      <input
                        type="password"
                        required
                        placeholder={t.login.password}
                        className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-9 py-2 placeholder-gray-500 focus:border-[#c9a84c] focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-[#c9a84c]" />
                        {t.login.remember}
                      </label>
                      <button type="button" className="hover:text-white transition-colors">
                        {t.login.forgot}
                      </button>
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#2d3f2d] border border-[#c9a84c]/40 text-[#c9a84c] text-xs font-bold tracking-widest uppercase py-2.5 hover:bg-[#c9a84c] hover:text-black transition-colors"
                    >
                      {loading ? t.login.loading : t.login.submit}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0d1117]/98 backdrop-blur-md">
          <nav className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium tracking-widest text-gray-300 hover:text-white transition-colors uppercase py-3 border-b border-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-4 text-center border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-4 py-3 text-xs font-bold tracking-widest uppercase"
            >
              {t.login.button}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
