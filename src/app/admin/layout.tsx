import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={session.user.name ?? session.user.email} />
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}
