"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/dashboard/orders", label: "Orders", icon: "📦" },
  { href: "/dashboard/quotes", label: "Quotes", icon: "📋" },
  { href: "/dashboard/documents", label: "Documents", icon: "📄" },
  { href: "/dashboard/tickets", label: "Support", icon: "🎟" },
];

export default function CustomerSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-brand-700">Ferrion</span>
        <p className="text-xs text-gray-400 mt-0.5">Customer Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 truncate mb-2">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
