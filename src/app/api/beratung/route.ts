import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const TOPIC_LABELS: Record<string, string> = {
  storage: "Storage & Infrastruktur",
  backup: "Backup & Security",
  managed: "Managed Services",
  cloud: "Cloud & Virtualisierung",
  ai: "AI-Infrastruktur",
  database: "Datenbank-Services",
  general: "Allgemeine Beratung",
};

const DETAIL_LABELS: Record<string, string> = {
  new_storage: "Neubeschaffung", expand: "Kapazitätserweiterung", migration: "Migration", performance: "Performance-Optimierung",
  new_backup: "Neue Backup-Lösung", nis2: "NIS2-Compliance", dr: "Disaster Recovery", audit: "Backup-Audit",
  monitoring: "Monitoring & Alerting", operations: "Betrieb & Wartung", renewals: "Renewals & Lizenzen", full: "Full Managed Services",
  virtualization: "Virtualisierung", hybrid: "Hybrid Cloud", migration_cloud: "Cloud-Migration", private: "Private Cloud",
  gpu: "GPU Server / Cluster", ai_storage: "AI Storage", ai_platform: "AI-Plattform", ai_dr: "AI Backup & DR",
  db_migration: "DB-Migration", db_managed: "Managed Database", db_license: "Lizenzberatung", db_performance: "Performance-Tuning",
  assessment: "IT-Assessment", strategy: "IT-Strategie", vendor: "Herstellerauswahl", other: "Sonstiges",
};

const SIZE_LABELS: Record<string, string> = {
  small: "1–50 Mitarbeitende", medium: "51–250 Mitarbeitende", large: "251–1.000 Mitarbeitende", enterprise: "1.000+ Mitarbeitende",
};

const TIMELINE_LABELS: Record<string, string> = {
  urgent: "Sofort / Dringend (< 4 Wochen)",
  soon: "Kurzfristig (1–3 Monate)",
  planned: "Mittelfristig (3–6 Monate)",
  exploring: "Langfristig / Orientierung",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { answers, formData } = body as {
    answers: Record<string, string>;
    formData: Record<string, string>;
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_REPLACE_WITH_YOUR_KEY") {
    return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  const topic = TOPIC_LABELS[answers.topic] ?? answers.topic ?? "–";
  const detail = DETAIL_LABELS[answers.detail] ?? answers.detail ?? "–";
  const size = SIZE_LABELS[answers.size] ?? answers.size ?? "–";
  const timeline = TIMELINE_LABELS[answers.timeline] ?? answers.timeline ?? "–";

  const internalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0d1117; color: #e5e7eb; margin: 0; padding: 32px; }
  .card { background: #111827; border: 1px solid rgba(255,255,255,0.1); padding: 24px; margin-bottom: 16px; }
  .label { font-size: 10px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #c9a84c; margin-bottom: 4px; }
  .value { font-size: 14px; color: #fff; }
  h1 { color: #c9a84c; font-size: 20px; margin-bottom: 24px; }
  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0; }
</style></head>
<body>
  <h1>🔔 Neue Beratungsanfrage — Ferrion</h1>
  <div class="card">
    <div class="label">Kontakt</div>
    <div class="value">${formData.name} · ${formData.company}</div>
    <div style="font-size:13px;color:#9ca3af;margin-top:4px">${formData.email}${formData.phone ? " · " + formData.phone : ""}</div>
  </div>
  <div class="card">
    <div class="label">Thema</div><div class="value">${topic}</div>
  </div>
  <div class="card">
    <div class="label">Detail</div><div class="value">${detail}</div>
  </div>
  <div class="card">
    <div class="label">Unternehmensgröße</div><div class="value">${size}</div>
  </div>
  <div class="card">
    <div class="label">Zeitrahmen</div><div class="value">${timeline}</div>
  </div>
  ${formData.message ? `<div class="card"><div class="label">Zusätzliche Informationen</div><div class="value" style="white-space:pre-wrap">${formData.message}</div></div>` : ""}
  <hr class="divider">
  <p style="font-size:11px;color:#6b7280">Eingegangen am ${new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" })} · ferrion.at/beratung</p>
</body>
</html>`;

  const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0d1117; color: #e5e7eb; margin: 0; padding: 32px; }
  .card { background: #111827; border: 1px solid rgba(255,255,255,0.1); padding: 24px; margin-bottom: 16px; }
  .label { font-size: 10px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #c9a84c; margin-bottom: 4px; }
  .value { font-size: 14px; color: #fff; }
  h1 { color: #c9a84c; font-size: 20px; margin-bottom: 8px; }
  h2 { color: #fff; font-size: 16px; margin-bottom: 24px; font-weight: normal; }
  .footer { font-size: 11px; color: #6b7280; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
</style></head>
<body>
  <h1>Ferrion IT Systemhaus</h1>
  <h2>Ihre Anfrage ist bei uns eingegangen.</h2>
  <p style="color:#9ca3af;font-size:14px">Vielen Dank, ${formData.name}! Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.</p>
  <br>
  <p style="color:#e5e7eb;font-size:13px;font-weight:bold">Ihre Angaben im Überblick:</p>
  <div class="card">
    <div class="label">Thema</div><div class="value">${topic}</div>
  </div>
  <div class="card">
    <div class="label">Detail</div><div class="value">${detail}</div>
  </div>
  <div class="card">
    <div class="label">Unternehmensgröße</div><div class="value">${size}</div>
  </div>
  <div class="card">
    <div class="label">Zeitrahmen</div><div class="value">${timeline}</div>
  </div>
  <div class="footer">
    <strong style="color:#c9a84c">Ferrion IT Systemhaus GmbH</strong><br>
    Wien, Österreich · info@ferrion.at · ferrion.at<br><br>
    Diese E-Mail wurde automatisch erstellt. Bitte antworten Sie direkt auf diese Nachricht, wenn Sie Rückfragen haben.
  </div>
</body>
</html>`;

  const [internal, confirm] = await Promise.allSettled([
    resend.emails.send({
      from: "Ferrion Beratung <beratung@ferrion.at>",
      to: ["info@ferrion.at"],
      subject: `Neue Beratungsanfrage: ${topic} — ${formData.company}`,
      html: internalHtml,
      replyTo: formData.email,
    }),
    resend.emails.send({
      from: "Ferrion IT Systemhaus <beratung@ferrion.at>",
      to: [formData.email],
      subject: "Ihre Beratungsanfrage bei Ferrion — wir melden uns bald",
      html: confirmHtml,
    }),
  ]);

  if (internal.status === "rejected") {
    console.error("Failed to send internal email:", internal.reason);
    return NextResponse.json({ ok: false, error: "Email send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
