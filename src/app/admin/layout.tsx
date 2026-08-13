import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  const locale = getLocale();

  return (
    <AdminShell userName={session.user.name ?? session.user.email} locale={locale}>
      {children}
    </AdminShell>
  );
}
