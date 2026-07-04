/**
 * Ferrion Rechnungsvorlage (DOCX) — Generator
 * ------------------------------------------------------------------
 * Erzeugt templates/Ferrion-Rechnungsvorlage.docx im Ferrion-Design.
 *
 * Ausführen:   npm i -D docx   &&   node scripts/generate-invoice-template.js
 *
 * Die Vorlage nutzt {platzhalter}-Tags (docxtemplater-kompatibel). Mapping
 * auf die Portal-Datenmodelle (siehe prisma/schema.prisma):
 *
 *   {invoice_number}   ← Order/Quote.reference  (oder eigene Rechnungsnummer)
 *   {invoice_date}     ← Order.createdAt  (formatiert dd.MM.yyyy)
 *   {service_period}   ← Leistungszeitraum (manuell / aus Auftragsdaten)
 *   {due_date}         ← createdAt + {payment_terms_days}
 *   {customer_number}  ← User.id (gekürzt)
 *   {customer_company} ← User.company
 *   {customer_name}    ← User.name
 *   {customer_address} ← (nicht im Schema — ergänzen)
 *   {customer_email}   ← User.email
 *   {customer_uid}     ← (ergänzen; ab 10.000 € Pflicht)
 *   items[]            ← Order/Quote.lineItems: [{ sku, description, qty, unitPrice }]
 *     {pos} {description} {qty} {unit_price} {line_total}
 *   {subtotal}         ← Σ(qty*unitPrice)              netto
 *   {vat_rate}         ← Steuersatz (Default 20)
 *   {vat_amount}       ← subtotal * vat_rate/100
 *   {total}            ← Order/Quote.totalAmount
 *   {currency}         ← Order/Quote.currency
 *   issuer_*           ← Ferrion-Stammdaten (einmalig ausfüllen: UID, IBAN, …)
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, VerticalAlign, PageOrientation,
} = require("docx");

const GOLD = "C9A84C", DARK = "0D1117", INK = "111827", GRAY = "6B7280", LIGHT = "E5E7EB", WHITE = "FFFFFF";
const FONT = "Arial";
const CONTENT_W = 9638; // A4 (11906) minus 2×1134 margins

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellPad = { top: 60, bottom: 60, left: 120, right: 120 };
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, ...o });
const p = (c, o = {}) => new Paragraph({ children: Array.isArray(c) ? c : [c], ...o });
const label = (t, color = GRAY) => run(t, { size: 15, bold: true, color, characterSpacing: 20 });

const headerBand = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [6000, 3638], borders: noBorders,
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 6000, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR, color: "auto" }, margins: { top: 260, bottom: 240, left: 260, right: 120 }, verticalAlign: VerticalAlign.CENTER, borders: noBorders, children: [
      p([run("● ", { color: GOLD, size: 28 }), run("FERRION", { color: WHITE, bold: true, size: 30, characterSpacing: 40 })]),
      p(run("IT SYSTEMHAUS · SERVICES · MANAGED SERVICES", { color: GOLD, size: 12, characterSpacing: 30 }), { spacing: { before: 40 } }),
    ] }),
    new TableCell({ width: { size: 3638, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR, color: "auto" }, margins: { top: 260, bottom: 240, left: 120, right: 260 }, verticalAlign: VerticalAlign.CENTER, borders: noBorders, children: [
      p(run("RECHNUNG", { color: WHITE, bold: true, size: 40, characterSpacing: 30 }), { alignment: AlignmentType.RIGHT }),
      p(run("INVOICE", { color: GOLD, size: 14, characterSpacing: 60 }), { alignment: AlignmentType.RIGHT, spacing: { before: 20 } }),
    ] }),
  ] })],
});

const goldRule = () => new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } } });

const metaLine = (k, v) => new TableRow({ children: [
  new TableCell({ width: { size: 1900, type: WidthType.DXA }, borders: noBorders, margins: { top: 30, bottom: 30, left: 0, right: 60 }, children: [p(run(k, { size: 17, color: GRAY }))] }),
  new TableCell({ width: { size: 2738, type: WidthType.DXA }, borders: noBorders, margins: { top: 30, bottom: 30, left: 0, right: 0 }, children: [p(run(v, { size: 17, bold: true, color: INK }))] }),
] });

const issuerMeta = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [5000, 4638], borders: noBorders,
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 5000, type: WidthType.DXA }, borders: noBorders, margins: { top: 300, bottom: 0, left: 0, right: 200 }, children: [
      p(label("RECHNUNGSSTELLER"), { spacing: { after: 80 } }),
      p(run("Ferrion IT Systemhaus GmbH", { size: 18, bold: true, color: INK })),
      p(run("{issuer_street}", { size: 17, color: INK }), { spacing: { before: 20 } }),
      p(run("{issuer_zip_city}", { size: 17, color: INK })),
      p(run("Österreich", { size: 17, color: INK })),
      p(run("info@ferrion.at · ferrion.at", { size: 17, color: GRAY }), { spacing: { before: 40 } }),
      p(run("UID: {issuer_uid}", { size: 15, color: GRAY }), { spacing: { before: 40 } }),
    ] }),
    new TableCell({ width: { size: 4638, type: WidthType.DXA }, borders: noBorders, margins: { top: 300, bottom: 0, left: 0, right: 0 }, children: [
      p(label("RECHNUNGSDATEN"), { spacing: { after: 80 } }),
      new Table({ width: { size: 4638, type: WidthType.DXA }, columnWidths: [1900, 2738], borders: noBorders, rows: [
        metaLine("Rechnungsnr.", "{invoice_number}"),
        metaLine("Rechnungsdatum", "{invoice_date}"),
        metaLine("Leistungszeitraum", "{service_period}"),
        metaLine("Fällig bis", "{due_date}"),
        metaLine("Kundennr.", "{customer_number}"),
      ] }),
    ] }),
  ] })],
});

const billTo = [
  p(label("RECHNUNGSEMPFÄNGER"), { spacing: { before: 360, after: 80 } }),
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

const itemsTable = new Table({
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

const totalRow = (k, v, { emphasize = false, band = false } = {}) => new TableRow({ children: [
  new TableCell({ width: { size: 6478, type: WidthType.DXA }, borders: noBorders, children: [p(run(""))] }),
  new TableCell({ width: { size: 1580, type: WidthType.DXA }, borders: noBorders, margins: cellPad, shading: band ? { fill: DARK, type: ShadingType.CLEAR, color: "auto" } : undefined, children: [p(run(k, { size: emphasize ? 18 : 17, bold: emphasize, color: band ? WHITE : (emphasize ? INK : GRAY) }), { alignment: AlignmentType.RIGHT })] }),
  new TableCell({ width: { size: 1580, type: WidthType.DXA }, borders: noBorders, margins: cellPad, shading: band ? { fill: DARK, type: ShadingType.CLEAR, color: "auto" } : undefined, children: [p(run(v, { size: emphasize ? 20 : 17, bold: emphasize, color: band ? GOLD : INK }), { alignment: AlignmentType.RIGHT })] }),
] });

const totals = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [6478, 1580, 1580], borders: noBorders,
  rows: [
    totalRow("Zwischensumme (netto)", "{subtotal} {currency}"),
    totalRow("USt {vat_rate} %", "{vat_amount} {currency}"),
    totalRow("Gesamtbetrag", "{total} {currency}", { emphasize: true, band: true }),
  ],
});

const payment = new Table({
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

const thanks = p(run("Vielen Dank für Ihr Vertrauen in Ferrion.", { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 480, after: 200 } });

const footerBand = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], borders: noBorders,
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill: DARK, type: ShadingType.CLEAR, color: "auto" }, margins: { top: 200, bottom: 200, left: 240, right: 240 }, borders: noBorders, children: [
      p([run("Ferrion IT Systemhaus GmbH", { size: 14, bold: true, color: GOLD })]),
      p(run("{issuer_street}, {issuer_zip_city}, Österreich · info@ferrion.at · ferrion.at", { size: 13, color: "9CA3AF" }), { spacing: { before: 30 } }),
      p(run("Firmenbuch: {issuer_firmenbuch} · {issuer_court} · UID: {issuer_uid} · IBAN: {issuer_iban}", { size: 13, color: "9CA3AF" }), { spacing: { before: 20 } }),
      p(run("build to endure", { size: 12, color: GOLD, characterSpacing: 40 }), { spacing: { before: 30 } }),
    ] }),
  ] })],
});

const doc = new Document({
  creator: "Ferrion IT Systemhaus", title: "Rechnungsvorlage",
  styles: { default: { document: { run: { font: FONT, size: 18, color: INK } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT }, margin: { top: 1134, right: 1134, bottom: 900, left: 1134 } } },
    children: [
      headerBand, goldRule(), issuerMeta, ...billTo,
      p(run(""), { spacing: { after: 160 } }),
      itemsTable, totals, payment, thanks, footerBand,
      p(run("Platzhalter in { } werden beim Erzeugen automatisch aus den Portal-Daten (Order / Quote / Kunde) befüllt.", { size: 12, color: "9CA3AF", italics: true }), { alignment: AlignmentType.CENTER, spacing: { before: 160 } }),
    ],
  }],
});

const outDir = path.join(__dirname, "..", "templates");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "Ferrion-Rechnungsvorlage.docx");
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(outPath, buf); console.log("WROTE", outPath, buf.length, "bytes"); });
