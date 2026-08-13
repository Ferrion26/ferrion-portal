import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/app/produkte/products-data";
import BaselineVersionsTable from "./BaselineVersionsTable";
import DeleteBaselinePolicyButton from "./DeleteBaselinePolicyButton";

export const metadata = { title: "Baseline-Policy — Admin" };

export default async function BaselinePolicyPage({ params }: { params: { id: string } }) {
  const policy = await prisma.baselinePolicy.findUnique({
    where: { id: params.id },
    include: { softwareVersions: { orderBy: { publicationDate: "desc" } } },
  });
  if (!policy) notFound();

  const product = PRODUCTS.find((p) => p.slug === policy.productSlug);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/baselines" className="text-xs text-gray-500 hover:text-[#c9a84c]">
          ← Baselines
        </Link>
        <p className="text-xs text-gray-500 tracking-widest uppercase mb-2 mt-2">
          {product ? `${product.vendor} ${product.name}` : policy.productSlug}
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{policy.name}</h1>
            {policy.description && <p className="text-sm text-gray-500">{policy.description}</p>}
          </div>
          <DeleteBaselinePolicyButton policyId={policy.id} />
        </div>
      </div>

      <div className="bg-[#111827] border border-white/10 p-6">
        <BaselineVersionsTable
          policyId={policy.id}
          versions={policy.softwareVersions.map((v) => ({
            id: v.id,
            versionNumber: v.versionNumber,
            description: v.description,
            status: v.status,
            publicationDate: v.publicationDate?.toISOString() ?? null,
            recommended: v.recommended,
            newFeatures: (v.newFeatures as { title: string; description?: string }[] | null) ?? [],
            modifiedFeatures: (v.modifiedFeatures as { title: string; description?: string }[] | null) ?? [],
            resolvedIssues:
              (v.resolvedIssues as
                | { ticketNumber?: string; title: string; description?: string; severity?: string; solution?: string }[]
                | null) ?? [],
            sourceDocument: v.sourceDocument,
          }))}
        />
      </div>
    </div>
  );
}
