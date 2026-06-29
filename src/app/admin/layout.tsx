import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const locale = getLocale();

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <DashboardHeader userName={session.user.name ?? session.user.email} locale={locale} />
      <div className="flex pt-16">
        <AdminSidebar userName={session.user.name ?? session.user.email} locale={locale} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
