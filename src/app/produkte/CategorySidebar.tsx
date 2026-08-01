"use client";

import { useEffect, useState } from "react";
import { type Locale } from "@/lib/i18n/translations";
import { type Category } from "./products-data";

export default function CategorySidebar({ categories, locale, label }: { categories: Category[]; locale: Locale; label: string }) {
  const [active, setActive] = useState<string>(categories[0]?.id ?? "");

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav className="min-w-0 md:sticky md:top-28 self-start">
      <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-4">{label}</p>
      <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {categories.map((c) => {
          const isActive = c.id === active;
          return (
            <li key={c.id} className="shrink-0">
              <a
                href={`#${c.id}`}
                className={`block px-4 py-3 border text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                  isActive
                    ? "bg-[#c9a84c]/10 border-[#c9a84c] text-[#c9a84c]"
                    : "bg-[#111827] border-[#c9a84c]/30 text-white hover:border-[#c9a84c]"
                }`}
              >
                {c.label[locale]}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
