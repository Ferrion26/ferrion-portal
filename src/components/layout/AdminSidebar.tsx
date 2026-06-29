"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { translations, type Locale } from "@/lib/i18n/translations";

export default function AdminSidebar({ userName, locale }: { userName?: string; locale: Locale }) {
  const pathname = usePathname();
  const s = translations[locale].admin.sidebar;
  const area = translations[locale].admin.area;

  const nav = [
    { href: "/admin", label: s.overview, icon: "▦" },
    { href: "/admin/customers", label: s.customers, icon: "👥" },
    { href: "/admin/orders", label: s.orders, icon: "📦" },
    { href: "/admin/quotes", label: s.quotes, icon: "📋" },
    { href: "/admin/documents", label: s.documents, icon: "📄" },
    { href: "/admin/tickets", label: s.tickets, icon: "🎟" },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-[#111827] flex flex-col min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="px-4 py-5 border-b border-white/10">
        <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{area}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon }) => (
          <Link key={href} href={href} className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-[#c9a84c]/10 text-[#c9a84c] border-l-2 border-[#c9a84c]"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          )}>
            <span className="text-base opacity-80">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-[10px] text-gray-600 truncate">{userName}</p>
      </div>
    </aside>
  );
}
