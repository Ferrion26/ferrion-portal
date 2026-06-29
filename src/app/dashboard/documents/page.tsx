import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBytes, formatDate } from "@/lib/utils";
import DownloadButton from "./DownloadButton";

export const metadata = { title: "Documents — Ferrion Portal" };

export default async function DocumentsPage() {
  const session = await getSession();
  const documents = await prisma.document.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Size</th>
              <th className="px-6 py-3 font-medium">Uploaded</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                <td className="px-6 py-4 text-gray-500">{doc.description ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500">{formatBytes(doc.sizeBytes)}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(doc.createdAt)}</td>
                <td className="px-6 py-4">
                  <DownloadButton documentId={doc.id} fileName={doc.name} />
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No documents available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
