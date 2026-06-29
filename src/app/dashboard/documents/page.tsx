import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatBytes, formatDate } from "@/lib/utils";
import DownloadButton from "./DownloadButton";

export const metadata = { title: "Dokumente — Ferrion Portal" };

export default async function DocumentsPage() {
  const session = await getSession();
  const t = getT().dashboard;
  const documents = await prisma.document.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.documents}</h1>
      <div className="bg-[#111827] border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">{t.description}</th>
              <th className="px-6 py-3 font-medium">{t.size}</th>
              <th className="px-6 py-3 font-medium">{t.uploaded}</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-gray-300">{doc.name}</td>
                <td className="px-6 py-4 text-gray-500">{doc.description ?? "—"}</td>
                <td className="px-6 py-4 text-gray-400">{formatBytes(doc.sizeBytes)}</td>
                <td className="px-6 py-4 text-gray-400">{formatDate(doc.createdAt)}</td>
                <td className="px-6 py-4"><DownloadButton documentId={doc.id} fileName={doc.name} /></td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t.noDocs}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
