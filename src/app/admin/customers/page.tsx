import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Kunden — Admin" };

export default async function CustomersPage() {
  const t = getT().admin;
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, tickets: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.customers}</h1>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">{t.name}</th>
              <th className="px-6 py-3 font-medium">{t.email}</th>
              <th className="px-6 py-3 font-medium">{t.company}</th>
              <th className="px-6 py-3 font-medium">{getT().dashboard.orders}</th>
              <th className="px-6 py-3 font-medium">{t.tickets}</th>
              <th className="px-6 py-3 font-medium">{getT().dashboard.status}</th>
              <th className="px-6 py-3 font-medium">{t.since}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-gray-300">{c.name ?? "—"}</td>
                <td className="px-6 py-4 text-gray-400">{c.email}</td>
                <td className="px-6 py-4 text-gray-400">{c.company ?? "—"}</td>
                <td className="px-6 py-4 text-gray-300">{c._count.orders}</td>
                <td className="px-6 py-4 text-gray-300">{c._count.tickets}</td>
                <td className="px-6 py-4">
                  <Badge variant={c.active ? "green" : "red"}>{c.active ? t.active : t.inactive}</Badge>
                </td>
                <td className="px-6 py-4 text-gray-400">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t.noCustomers}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
