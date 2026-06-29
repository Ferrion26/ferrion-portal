import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient, DOCUMENTS_BUCKET } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const customerId = formData.get("customerId") as string | null;
  const description = (formData.get("description") as string) || null;

  if (!file || !customerId) {
    return NextResponse.json({ error: "file and customerId are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const storagePath = `${customerId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Upload to storage failed." }, { status: 500 });
  }

  const doc = await prisma.document.create({
    data: {
      name: file.name,
      description,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
      customerId,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
