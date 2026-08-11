import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ingestPayloadSchema } from "@/lib/managed-reports/ingestSchema";
import { applyManualIngest } from "@/lib/managed-reports/applyIngest";

export const dynamic = "force-dynamic";

// Gebündelter manueller Upload auf Kundenebene (Ersatz für den früheren
// Upload je einzelner Subscription): mehrere Dateien für mehrere Geräte
// desselben Kunden in einem Vorgang. Die Zuordnung Datei -> Subscription
// entscheidet der Client (BatchUploadForm — per Seriennummer automatisch
// vorbelegt, sonst manuell gewählt); diese Route vertraut der Zuordnung aber
// nicht blind, sondern prüft für jedes Paar, dass die genannte Subscription
// tatsächlich zu diesem Kunden gehört (sonst könnte man Daten in eine fremde
// Subscription schreiben, indem man einfach eine andere ID mitschickt).
export async function POST(req: NextRequest, { params }: { params: { customerId: string } }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const customer = await prisma.user.findUnique({ where: { id: params.customerId } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const subscriptionIds = formData.getAll("subscriptionIds").filter((v): v is string => typeof v === "string");
  if (files.length === 0) {
    return NextResponse.json({ error: "Keine Dateien übermittelt." }, { status: 400 });
  }
  if (files.length !== subscriptionIds.length) {
    return NextResponse.json({ error: "Datei-/Zuordnungsliste stimmt nicht überein." }, { status: 400 });
  }

  // Einmal alle validen Subscription-IDs dieses Kunden laden statt pro Datei
  // einzeln nachzufragen.
  const subscriptions = await prisma.managedServiceSubscription.findMany({
    where: { customerId: params.customerId },
    select: { id: true },
  });
  const validSubscriptionIds = new Set(subscriptions.map((s) => s.id));

  const results: { fileName: string; ok: boolean; metricsStored?: number; error?: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const subscriptionId = subscriptionIds[i];
    try {
      if (!validSubscriptionIds.has(subscriptionId)) {
        results.push({ fileName: file.name, ok: false, error: "Zugeordnete Subscription gehört nicht zu diesem Kunden." });
        continue;
      }

      const parsed = ingestPayloadSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) {
        results.push({ fileName: file.name, ok: false, error: "Ungültiges Format (erwartet: {collectedAt, metrics[]})" });
        continue;
      }

      const { metricsStored } = await applyManualIngest(subscriptionId, parsed.data, file.name);
      results.push({ fileName: file.name, ok: true, metricsStored });
    } catch (err) {
      results.push({ fileName: file.name, ok: false, error: err instanceof Error ? err.message : "Unbekannter Fehler" });
    }
  }

  return NextResponse.json({ results });
}
