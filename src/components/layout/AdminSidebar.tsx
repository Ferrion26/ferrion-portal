"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/quotes", label: "Quotes", icon: "📋" },
  { href: "/admin/documents", label: "Documents", icon: "📄" },
  { href: "/admin/tickets", label: "Support Tickets", icon: "🎟" },
];

export default function AdminSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-gray-900 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-700">
        <span className="text-lg font-bold text-white">Ferrion</span>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate mb-2">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
