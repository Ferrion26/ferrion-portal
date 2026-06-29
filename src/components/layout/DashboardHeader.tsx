"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function DashboardHeader({ userName }: { userName?: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-white/10 h-16 flex items-center">
      <div className="max-w-full px-6 flex items-center justify-between w-full">
        <Link href="/">
          <img src="/logos/ferrion.svg" alt="Ferrion IT Systemhaus" className="h-9 w-auto" />
        </Link>

        <div className="flex items-center gap-6">
          <span className="text-xs text-gray-400 hidden md:block">{userName}</span>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors tracking-widest uppercase"
          >
            ← Homepage
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="border border-white/20 text-gray-300 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors px-4 py-1.5 text-xs font-bold tracking-widest uppercase"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
