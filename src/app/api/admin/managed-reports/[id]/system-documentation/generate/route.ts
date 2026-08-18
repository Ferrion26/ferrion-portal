import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateSystemDocumentation } from "@/lib/managed-reports/generateSystemDocumentation";

export const dynamic = "force-dynamic";

// Erstellt eine Systemdokumentation (.docx) als aktuelle Momentaufnahme —
// anders als der PDF-Bericht (POST .../generate) kein Zeitraumtyp/keine
// Kombinierbarkeit mehrerer Subscriptions, da die Systemdokumentation den
// aktuellen Systemzustand eines einzelnen Systems beschreibt.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const doc = await generateSystemDocumentation(params.id);
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("System documentation generation failed:", err);
    const message = err instanceof Error ? err.message : "System documentation generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
