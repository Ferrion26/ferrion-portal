"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Ungültige E-Mail oder Passwort.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    if (callbackUrl && !callbackUrl.includes("/login")) {
      router.push(callbackUrl);
    } else if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-2" htmlFor="email">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-2" htmlFor="password">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#0d1117] border border-white/10 text-white text-sm px-4 py-3 placeholder-gray-600 focus:border-[#c9a84c] focus:outline-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#c9a84c] text-black font-bold text-xs tracking-widest uppercase py-3.5 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50 mt-2"
      >
        {loading ? "Anmelden …" : "Anmelden →"}
      </button>
    </form>
  );
}
