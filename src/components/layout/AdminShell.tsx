"use client";

import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import AdminSidebar from "./AdminSidebar";
import type { Locale } from "@/lib/i18n/translations";

// Einziger Ort, der den Mobil-Menü-Zustand hält — DashboardHeader (Hamburger-
// Button) und AdminSidebar (Drawer) sind Geschwister im Layout und brauchen
// denselben State, daher hier zusammengeführt statt in admin/layout.tsx
// (Server-Component, kann keinen Client-State halten).
export default function AdminShell({
  userName,
  locale,
  children,
}: {
  userName?: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <DashboardHeader userName={userName} locale={locale} onMenuClick={() => setMobileOpen(true)} />
      <div className="flex pt-16">
        <AdminSidebar userName={userName} locale={locale} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
