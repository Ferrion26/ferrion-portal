import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerSidebar from "@/components/layout/CustomerSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar userName={session.user.name ?? session.user.email} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
