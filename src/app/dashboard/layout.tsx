import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";
import CustomerSidebar from "@/components/layout/CustomerSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const locale = getLocale();

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <DashboardHeader userName={session.user.name ?? session.user.email} locale={locale} />
      <div className="flex pt-16">
        <CustomerSidebar userName={session.user.name ?? session.user.email} locale={locale} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
