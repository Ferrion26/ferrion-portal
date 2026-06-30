import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, company, topic, message } = body as {
    name: string;
    email: string;
    company?: string;
    topic?: string;
    message: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_REPLACE_WITH_YOUR_KEY") {
    return NextResponse.json({ ok: false, error: "Email not configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);

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
  <h1>✉ Neue Kontaktanfrage — Ferrion</h1>
  <div class="card">
    <div class="label">Kontakt</div>
    <div class="value">${name}${company ? " · " + company : ""}</div>
    <div style="font-size:13px;color:#9ca3af;margin-top:4px">${email}</div>
  </div>
  ${topic ? `<div class="card"><div class="label">Thema</div><div class="value">${topic}</div></div>` : ""}
  <div class="card">
    <div class="label">Nachricht</div>
    <div class="value" style="white-space:pre-wrap">${message}</div>
  </div>
  <hr class="divider">
  <p style="font-size:11px;color:#6b7280">Eingegangen am ${new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" })} · ferrion.at/kontakt</p>
</body>
</html>`;

  const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0d1117; color: #e5e7eb; margin: 0; padding: 32px; }
  h1 { color: #c9a84c; font-size: 20px; margin-bottom: 8px; }
  h2 { color: #fff; font-size: 16px; margin-bottom: 24px; font-weight: normal; }
  .footer { font-size: 11px; color: #6b7280; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
  .quote { background:#111827; border-left:3px solid #c9a84c; padding:16px 20px; margin:16px 0; font-size:13px; color:#9ca3af; white-space:pre-wrap; }
</style></head>
<body>
  <h1>Ferrion IT Systemhaus</h1>
  <h2>Ihre Nachricht ist bei uns eingegangen.</h2>
  <p style="color:#9ca3af;font-size:14px">Vielen Dank, ${name}! Wir melden uns in der Regel innerhalb von 24 Stunden bei Ihnen.</p>
  <div class="quote">${message}</div>
  <div class="footer">
    <strong style="color:#c9a84c">Ferrion IT Systemhaus GmbH</strong><br>
    Wien, Österreich · info@ferrion.at · ferrion.at<br><br>
    Diese E-Mail wurde automatisch erstellt. Sie können direkt auf diese Nachricht antworten.
  </div>
</body>
</html>`;

  const [internal] = await Promise.allSettled([
    resend.emails.send({
      from: "Ferrion Kontakt <kontakt@ferrion.at>",
      to: ["info@ferrion.at"],
      subject: `Neue Kontaktanfrage${topic ? ": " + topic : ""} — ${name}`,
      html: internalHtml,
      replyTo: email,
    }),
    resend.emails.send({
      from: "Ferrion IT Systemhaus <kontakt@ferrion.at>",
      to: [email],
      subject: "Ihre Nachricht bei Ferrion — wir melden uns bald",
      html: confirmHtml,
    }),
  ]);

  if (internal.status === "rejected") {
    console.error("Failed to send contact email:", internal.reason);
    return NextResponse.json({ ok: false, error: "Email send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
