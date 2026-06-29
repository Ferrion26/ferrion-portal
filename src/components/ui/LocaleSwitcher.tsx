"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LocaleSwitcher({ current }: { current: "de" | "en" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function switchLocale(locale: "de" | "en") {
    if (locale === current) return;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
      <button
        onClick={() => switchLocale("de")}
        disabled={isPending}
        className={current === "de" ? "text-white font-bold" : "hover:text-white transition-colors"}
      >
        DE
      </button>
      <span>|</span>
      <button
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={current === "en" ? "text-white font-bold" : "hover:text-white transition-colors"}
      >
        EN
      </button>
    </div>
  );
}
