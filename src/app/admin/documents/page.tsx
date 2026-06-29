import { prisma } from "@/lib/prisma";
import { formatBytes, formatDate } from "@/lib/utils";
import UploadDocumentForm from "./UploadDocumentForm";

export const metadata = { title: "Documents — Admin" };

export default async function AdminDocumentsPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, company: true },
    orderBy: { name: "asc" },
  });

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true, email: true, company: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Upload Document</h2>
          <UploadDocumentForm customers={customers} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Documents</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Size</th>
              <th className="px-6 py-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{doc.name}</td>
                <td className="px-6 py-4 text-gray-500">
                  {doc.customer
                    ? doc.customer.company ?? doc.customer.name ?? doc.customer.email
                    : "—"}
                </td>
                <td className="px-6 py-4 text-gray-500">{formatBytes(doc.sizeBytes)}</td>
                <td className="px-6 py-4 text-gray-500">{formatDate(doc.createdAt)}</td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
