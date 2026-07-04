/**
 * Ferrion Vorlagen (DOCX) — Generator
 * ------------------------------------------------------------------
 * Erzeugt zwei Vorlagen im Ferrion-Design:
 *   templates/Ferrion-Rechnungsvorlage.docx
 *   templates/Ferrion-Angebotsvorlage.docx
 *
 * Ausführen:  npm i -D docx  &&  node scripts/generate-invoice-template.js
 *
 * Die Vorlagen nutzen {platzhalter}-Tags (docxtemplater-kompatibel). Mapping
 * auf die Portal-Datenmodelle (siehe prisma/schema.prisma):
 *
 *   RECHNUNG (Order)                 ANGEBOT (Quote)
 *   {invoice_number} ← reference     {quote_number}  ← reference
 *   {invoice_date}   ← createdAt     {quote_date}    ← createdAt
 *   {due_date}       ← createdAt+X   {valid_until}   ← validUntil
 *   {service_period} ← manuell       {notes}         ← notes
 *   {customer_company/name/email/uid/address} ← User.*
 *   {customer_number} ← User.id (gekürzt)
 *   items[]  ← lineItems: [{ sku, description, qty, unitPrice }]
 *     {pos} {description} {qty} {unit_price} {line_total}
 *   {subtotal} {vat_rate} {vat_amount} {total} {currency} ← Summen / totalAmount
 *   issuer_* ← Ferrion-Stammdaten (einmalig ausfüllen: UID, IBAN, …)
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Footer,
  WidthType, BorderStyle, ShadingType, AlignmentType, VerticalAlign, PageOrientation,
} = require("docx");

const GOLD = "C9A84C", DARK = "0D1117", INK = "111827", GRAY = "6B7280", LIGHT = "E5E7EB", WHITE = "FFFFFF";
const FONT = "Arial";
const CONTENT_W = 9638; // A4 (11906) minus 2×1134 margins
const LOGO = fs.readFileSync(path.join(__dirname, "assets", "ferrion-logo-light.png"));

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellPad = { top: 60, bottom: 60, left: 120, right: 120 };
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, ...o });
const p = (c, o = {}) => new Paragraph({ children: Array.isArray(c) ? c : [c], ...o });
const label = (t, color = GRAY) => run(t, { size: 15, bold: true, color, characterSpacing: 20 });

const logoImg = () => new ImageRun({ type: "png", data: LOGO, transformation: { width: 176, height: 44 } });

function headerBand(cfg) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [6000, 3638], borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 6000, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 0, right: 120 }, verticalAlign: VerticalAlign.CENTER, borders: noBorders, children: [
        p(logoImg()),
        p(run("IT SYSTEMHAUS · SERVICES · MANAGED SERVICES", { color: GRAY, size: 12, characterSpacing: 30 }), { spacing: { before: 60 } }),
      ] }),
      new TableCell({ width: { size: 3638, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 120, right: 0 }, verticalAlign: VerticalAlign.CENTER, borders: noBorders, children: [
        p(run(cfg.headTitle, { color: INK, bold: true, size: 40, characterSpacing: 30 }), { alignment: AlignmentType.RIGHT }),
        p(run(cfg.headSub, { color: GOLD, size: 14, characterSpacing: 60 }), { alignment: AlignmentType.RIGHT, spacing: { before: 20 } }),
      ] }),
    ] })],
  });
}

const goldRule = () => new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } } });

const metaLine = (k, v) => new TableRow({ children: [
  new TableCell({ width: { size: 1900, type: WidthType.DXA }, borders: noBorders, margins: { top: 30, bottom: 30, left: 0, right: 60 }, children: [p(run(k, { size: 17, color: GRAY }))] }),
  new TableCell({ width: { size: 2738, type: WidthType.DXA }, borders: noBorders, margins: { top: 30, bottom: 30, left: 0, right: 0 }, children: [p(run(v, { size: 17, bold: true, color: INK }))] }),
] });

function issuerMeta(cfg) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [5000, 4638], borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 5000, type: WidthType.DXA }, borders: noBorders, margins: { top: 300, bottom: 0, left: 0, right: 200 }, children: [
        p(label(cfg.issuerLabel), { spacing: { after: 80 } }),
        p(run("Ferrion IT Systemhaus GmbH", { size: 18, bold: true, color: INK })),
        p(run("{issuer_street}", { size: 17, color: INK }), { spacing: { before: 20 } }),
        p(run("{issuer_zip_city}", { size: 17, color: INK })),
        p(run("Österreich", { size: 17, color: INK })),
        p(run("info@ferrion.at · ferrion.at", { size: 17, color: GRAY }), { spacing: { before: 40 } }),
        p(run("UID: {issuer_uid}", { size: 15, color: GRAY }), { spacing: { before: 40 } }),
      ] }),
      new TableCell({ width: { size: 4638, type: WidthType.DXA }, borders: noBorders, margins: { top: 300, bottom: 0, left: 0, right: 0 }, children: [
        p(label(cfg.metaTitle), { spacing: { after: 80 } }),
        new Table({ width: { size: 4638, type: WidthType.DXA }, columnWidths: [1900, 2738], borders: noBorders, rows: cfg.metaRows.map(([k, v]) => metaLine(k, v)) }),
      ] }),
    ] })],
  });
}

const billTo = (cfg) => [
  p(label(cfg.recipientLabel), { spacing: { before: 360, after: 80 } }),
  p(run("{customer_company}", { size: 19, bold: true, color: INK })),
  p(run("z. Hd. {customer_name}", { size: 17, color: INK }), { spacing: { before: 20 } }),
  p(run("{customer_address}", { size: 17, color: INK })),
  p(run("{customer_email}", { size: 17, color: GRAY }), { spacing: { before: 20 } }),
  p(run("UID: {customer_uid}", { size: 15, color: GRAY }), { spacing: { before: 20 } }),
];

const COLS = [760, 4718, 1000, 1580, 1580];
const thinBottom = { top: noBorder, left: noBorder, right: noBorder, bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT } };
const headCell = (t, w, a = AlignmentType.LEFT) => new TableCell({ width: { size: w, type: WidthType.DXA }, shading: { fill: GOLD, type: ShadingType.CLEAR, color: "auto" }, margins: cellPad, borders: noBorders, verticalAlign: VerticalAlign.CENTER, children: [p(run(t, { size: 15, bold: true, color: "000000", characterSpacing: 20 }), { alignment: a })] });
const bodyCell = (t, w, a = AlignmentType.LEFT, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: cellPad, borders: thinBottom, verticalAlign: VerticalAlign.CENTER, children: [p(run(t, { size: 17, color: INK, ...o }), { alignment: a })] });

const itemsTable = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: COLS, borders: noBorders,
  rows: [
    new TableRow({ tableHeader: true, children: [
      headCell("POS", COLS[0]), headCell("BESCHREIBUNG", COLS[1]),
      headCell("MENGE", COLS[2], AlignmentType.CENTER), headCell("EINZELPREIS", COLS[3], AlignmentType.RIGHT), headCell("BETRAG", COLS[4], AlignmentType.RIGHT),
    ] }),
    new TableRow({ children: [
      bodyCell("{#items}{pos}", COLS[0]), bodyCell("{description}", COLS[1]),
      bodyCell("{qty}", COLS[2], AlignmentType.CENTER), bodyCell("{unit_price}", COLS[3], AlignmentType.RIGHT), bodyCell("{line_total}{/items}", COLS[4], AlignmentType.RIGHT),
    ] }),
  ],
});

const TCOLS = [3898, 3580, 2160]; // spacer | label | value  (widened label → no wrap)
const goldFill = { fill: GOLD, type: ShadingType.CLEAR, color: "auto" };
const totalRow = (k, v, { emphasize = false, band = false } = {}) => new TableRow({ children: [
  new TableCell({ width: { size: TCOLS[0], type: WidthType.DXA }, borders: noBorders, children: [p(run(""))] }),
  new TableCell({ width: { size: TCOLS[1], type: WidthType.DXA }, borders: noBorders, margins: cellPad, shading: band ? goldFill : undefined, children: [p(run(k, { size: emphasize ? 18 : 17, bold: emphasize, color: band ? "000000" : (emphasize ? INK : GRAY) }), { alignment: AlignmentType.RIGHT })] }),
  new TableCell({ width: { size: TCOLS[2], type: WidthType.DXA }, borders: noBorders, margins: cellPad, shading: band ? goldFill : undefined, children: [p(run(v, { size: emphasize ? 20 : 17, bold: emphasize, color: "000000" }), { alignment: AlignmentType.RIGHT })] }),
] });

const totals = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: TCOLS, borders: noBorders,
  rows: [
    totalRow("Zwischensumme (netto)", "{subtotal} {currency}"),
    totalRow("USt {vat_rate} %", "{vat_amount} {currency}"),
    totalRow("Gesamtbetrag", "{total} {currency}", { emphasize: true, band: true }),
  ],
});

// Invoice: payment + bank (two columns). Quote: conditions + notes.
function terms(cfg) {
  if (cfg.mode === "invoice") {
    return new Table({
      width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [4819, 4819], borders: noBorders,
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 360, bottom: 0, left: 0, right: 200 }, children: [
          p(label("ZAHLUNGSBEDINGUNGEN"), { spacing: { after: 80 } }),
          p(run("Zahlbar innerhalb von {payment_terms_days} Tagen ohne Abzug bis {due_date}.", { size: 16, color: INK })),
          p(run("Verwendungszweck: {invoice_number}", { size: 16, color: GRAY }), { spacing: { before: 40 } }),
        ] }),
        new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 360, bottom: 0, left: 0, right: 0 }, children: [
          p(label("BANKVERBINDUNG"), { spacing: { after: 80 } }),
          p([run("Bank: ", { size: 16, color: GRAY }), run("{issuer_bank}", { size: 16, color: INK })]),
          p([run("IBAN: ", { size: 16, color: GRAY }), run("{issuer_iban}", { size: 16, color: INK, bold: true })], { spacing: { before: 30 } }),
          p([run("BIC: ", { size: 16, color: GRAY }), run("{issuer_bic}", { size: 16, color: INK })], { spacing: { before: 30 } }),
        ] }),
      ] })],
    });
  }
  // quote
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, borders: noBorders, margins: { top: 360, bottom: 0, left: 0, right: 0 }, children: [
        p(label("ANGEBOTSKONDITIONEN"), { spacing: { after: 80 } }),
        p(run("Dieses Angebot ist freibleibend und gültig bis {valid_until}. Alle Preise verstehen sich zzgl. gesetzlicher USt.", { size: 16, color: INK })),
        p(run("{notes}", { size: 16, color: GRAY }), { spacing: { before: 40 } }),
      ] }),
    ] })],
  });
}

// Printer-friendly page footer: gold top rule + light legal text at the
// bottom of the page (real Word section footer, not inline body content).
const pageFooter = () => new Footer({
  children: [
    p([run("Ferrion IT Systemhaus GmbH", { size: 13, bold: true, color: INK })], {
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 8 } },
      spacing: { before: 40, after: 20 },
    }),
    p(run("{issuer_street}, {issuer_zip_city}, Österreich · info@ferrion.at · ferrion.at", { size: 12, color: GRAY }), { alignment: AlignmentType.CENTER }),
    p(run("Firmenbuch: {issuer_firmenbuch} · {issuer_court} · UID: {issuer_uid} · IBAN: {issuer_iban}", { size: 12, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 10 } }),
    p(run("build to endure", { size: 11, color: GOLD, characterSpacing: 40 }), { alignment: AlignmentType.CENTER, spacing: { before: 20 } }),
  ],
});

function buildDoc(cfg) {
  return new Document({
    creator: "Ferrion IT Systemhaus", title: cfg.docTitle,
    styles: { default: { document: { run: { font: FONT, size: 18, color: INK } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT }, margin: { top: 1134, right: 1134, bottom: 1440, left: 1134, footer: 560 } } },
      footers: { default: pageFooter() },
      children: [
        headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
        p(run(""), { spacing: { after: 160 } }),
        itemsTable(), totals(), terms(cfg),
        p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 480, after: 120 } }),
        p(run("Platzhalter in { } werden beim Erzeugen automatisch aus den Portal-Daten befüllt.", { size: 12, color: "9CA3AF", italics: true }), { alignment: AlignmentType.CENTER, spacing: { before: 40 } }),
      ],
    }],
  });
}

const INVOICE = {
  mode: "invoice", docTitle: "Rechnungsvorlage", headTitle: "RECHNUNG", headSub: "INVOICE",
  metaTitle: "RECHNUNGSDATEN", issuerLabel: "RECHNUNGSSTELLER", recipientLabel: "RECHNUNGSEMPFÄNGER",
  metaRows: [["Rechnungsnr.", "{invoice_number}"], ["Rechnungsdatum", "{invoice_date}"], ["Leistungszeitraum", "{service_period}"], ["Fällig bis", "{due_date}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Vielen Dank für Ihr Vertrauen in Ferrion.",
  file: "Ferrion-Rechnungsvorlage.docx",
};
const QUOTE = {
  mode: "quote", docTitle: "Angebotsvorlage", headTitle: "ANGEBOT", headSub: "QUOTE",
  metaTitle: "ANGEBOTSDATEN", issuerLabel: "ANBIETER", recipientLabel: "ANGEBOTSEMPFÄNGER",
  metaRows: [["Angebotsnr.", "{quote_number}"], ["Angebotsdatum", "{quote_date}"], ["Leistungszeitraum", "{service_period}"], ["Gültig bis", "{valid_until}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Wir freuen uns auf Ihre Beauftragung.",
  file: "Ferrion-Angebotsvorlage.docx",
};

const outDir = path.join(__dirname, "..", "templates");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  for (const cfg of [INVOICE, QUOTE]) {
    const buf = await Packer.toBuffer(buildDoc(cfg));
    const out = path.join(outDir, cfg.file);
    fs.writeFileSync(out, buf);
    console.log("WROTE", out, buf.length, "bytes");
  }
}
main();
