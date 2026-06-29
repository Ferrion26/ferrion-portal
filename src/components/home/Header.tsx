"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const nav = [
  { label: "Lösungen", href: "#loesungen" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Newsroom", href: "#newsroom" },
  { label: "Kundenbereich", href: "/dashboard" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Ungültige Anmeldedaten.");
      return;
    }
    // Get role from session to redirect correctly
    const res = await fetch("/api/auth/session");
    const sess = await res.json();
    const role = sess?.user?.role;
    window.location.href = role === "ADMIN" ? "/admin" : "/dashboard";
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <img src="/logos/ferrion.svg" alt="Ferrion IT Systemhaus" className="h-10 w-auto" />
        </Link>

        {/* Nav */}
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

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
            <button className="hover:text-white transition-colors font-medium">DE</button>
            <span>|</span>
            <button className="hover:text-white transition-colors">EN</button>
          </div>

          {/* Login button + dropdown */}
          <div className="relative">
            <button
              onClick={() => setLoginOpen((v) => !v)}
              className="flex items-center gap-2 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-colors px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
            >
              Login →
            </button>

            {loginOpen && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setLoginOpen(false)}
                />
                <div className="absolute right-0 top-10 w-72 bg-[#1a2332] border border-white/10 shadow-2xl p-5 z-50">
                  <p className="text-xs font-bold tracking-widest text-gray-300 uppercase mb-4">
                    Kundenbereich Login
                  </p>
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">🔒</span>
                      <input
                        type="email"
                        required
                        placeholder="Benutzername"
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
                        placeholder="Passwort"
                        className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-9 py-2 placeholder-gray-500 focus:border-[#c9a84c] focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-[#c9a84c]" />
                        Angemeldet bleiben
                      </label>
                      <button type="button" className="hover:text-white transition-colors">
                        Passwort vergessen?
                      </button>
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#2d3f2d] border border-[#c9a84c]/40 text-[#c9a84c] text-xs font-bold tracking-widest uppercase py-2.5 hover:bg-[#c9a84c] hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? "…" : "Login →"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
