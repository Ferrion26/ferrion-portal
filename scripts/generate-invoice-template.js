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
        p(run(cfg.headTitle, { color: INK, bold: true, size: cfg.headSize || 40, characterSpacing: 24 }), { alignment: AlignmentType.RIGHT }),
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

// ── Angebot: legal document building blocks ─────────────────
const BODY = "374151"; // gray-700, readable legal body on white
const sectionH = (t) => p(run(t, { size: 21, bold: true, color: INK, characterSpacing: 8 }), {
  spacing: { before: 340, after: 100 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 6 } },
});
const subH = (t) => p(run(t, { size: 17, bold: true, color: INK }), { spacing: { before: 180, after: 40 } });
const para = (t) => p(run(t, { size: 16, color: BODY }), { spacing: { after: 70 }, alignment: AlignmentType.JUSTIFIED });
const bullet = (t) => p([run("▸  ", { color: GOLD, size: 16 }), run(t, { size: 16, color: BODY })], { spacing: { after: 30 }, indent: { left: 220 } });
const sigRule = () => new Paragraph({ children: [run(" ")], spacing: { before: 300 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "9CA3AF", space: 20 } } });
const sigCap = (t) => p(run(t, { size: 13, color: GRAY }), { spacing: { before: 20 } });

const electronicNote = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
  borders: { top: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, left: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, right: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 160, right: 160 }, borders: noBorders, children: [
      p([
        run("Elektronische Beauftragung — ", { size: 16, bold: true, color: INK }),
        run("Sie können dieses Angebot auch elektronisch beauftragen: Senden Sie das unterschriebene Dokument einfach an ", { size: 16, color: BODY }),
        run("order@ferrion.at", { size: 16, bold: true, color: INK }),
        run(".", { size: 16, color: BODY }),
      ]),
    ] }),
  ] })],
});

const sigCell = (who) => new TableCell({
  width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 200, bottom: 0, left: 0, right: 200 },
  children: [sigRule(), sigCap("Ort, Datum"), sigRule(), sigCap(who)],
});
const signatures = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [4819, 4819], borders: noBorders,
  rows: [new TableRow({ children: [
    sigCell("Auftraggeber — {customer_company}"),
    sigCell("Ferrion IT Systemhaus GmbH (Auftragnehmer)"),
  ] })],
});

function quoteBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),

    sectionH("PRÄAMBEL"),
    para("Ferrion IT Systemhaus GmbH (nachfolgend „Auftragnehmer“) erbringt Leistungen in den Bereichen IT-Infrastruktur, Storage, Backup & Security, AI-Infrastruktur sowie Managed Services. Das vorliegende Angebot richtet sich an {customer_company} (nachfolgend „Auftraggeber“)."),
    para("Es beschreibt den angebotenen Leistungsumfang samt Preisen und bildet gemeinsam mit den nachstehenden Bestimmungen die Grundlage einer allfälligen Beauftragung. Mit der Auftragserteilung (Punkt 8) gelten die in diesem Dokument enthaltenen Bedingungen als vereinbart."),

    sectionH("1)  ANGEBOTSDATEN & PREISE"),
    para("Alle Preise verstehen sich in {currency}, netto zuzüglich der gesetzlichen Umsatzsteuer. Dieses Angebot ist freibleibend und gültig bis {valid_until}."),
    itemsTable(), totals(),

    sectionH("2)  LEISTUNGSBESCHREIBUNG"),
    para("Der Auftragnehmer erbringt für den Auftraggeber die nachstehend beschriebenen Leistungen. Ergänzende oder abweichende Leistungen bedürfen einer gesonderten schriftlichen Vereinbarung."),
    para("{service_description}"),
    bullet("Lieferung, Installation und Inbetriebnahme der angebotenen Infrastruktur"),
    bullet("Konfiguration, Integration sowie Migration bestehender Systeme und Daten"),
    bullet("Einschulung der Administratoren und Übergabe der technischen Dokumentation"),
    bullet("Optionale Managed Services, Wartung und Support gemäß vereinbartem Service-Level-Agreement (SLA)"),

    sectionH("3)  ALLGEMEINE BESTIMMUNGEN"),
    subH("3.1  Rücktrittsrecht"),
    para("Ist der Auftraggeber Unternehmer im Sinne des UGB, besteht kein gesetzliches Rücktritts- bzw. Widerrufsrecht. Ein einvernehmlicher Rücktritt ist bis zum Beginn der Leistungserbringung gegen Ersatz der bis dahin angefallenen Aufwände und getätigten Bestellungen möglich."),
    subH("3.2  Gewährleistung, Wartung, Änderungen"),
    para("Es gelten die gesetzlichen Gewährleistungsbestimmungen. Wartungs- und Supportleistungen richten sich nach dem jeweils vereinbarten SLA. Änderungen des Leistungsumfangs (Change Requests) bedürfen der Schriftform und werden nach Aufwand oder gesonderter Vereinbarung verrechnet."),
    subH("3.3  Haftung"),
    para("Der Auftragnehmer haftet nur für Vorsatz und grobe Fahrlässigkeit; die Haftung für leichte Fahrlässigkeit ist – soweit gesetzlich zulässig – ausgeschlossen. Die Haftung ist der Höhe nach mit dem Netto-Auftragswert begrenzt. Für Datenverlust haftet der Auftragnehmer nur, sofern der Auftraggeber eine dem Stand der Technik entsprechende Datensicherung sichergestellt hat."),
    subH("3.4  Urheberrecht und Nutzung"),
    para("Konzepte, Dokumentationen sowie individuell erstellte Software und Konfigurationen bleiben bis zur vollständigen Bezahlung im Eigentum des Auftragnehmers. Der Auftraggeber erhält daran ein nicht ausschließliches, nicht übertragbares Nutzungsrecht für den vereinbarten Einsatzzweck."),
    subH("3.5  Loyalität"),
    para("Die Vertragspartner verpflichten sich, während der Dauer der Zusammenarbeit sowie für zwölf Monate danach keine Mitarbeiter des jeweils anderen Vertragspartners aktiv abzuwerben."),
    subH("3.6  Datenschutz und Geheimhaltung"),
    para("Die Vertragspartner behandeln alle im Rahmen der Zusammenarbeit erlangten, nicht offenkundigen Informationen vertraulich. Die Verarbeitung personenbezogener Daten erfolgt nach der DSGVO; Näheres regelt die Auftragsverarbeitungsvereinbarung in Punkt 4."),

    sectionH("4)  AUFTRAGSVERARBEITUNGSVEREINBARUNG"),
    para("Soweit der Auftragnehmer im Rahmen der Leistungserbringung personenbezogene Daten im Auftrag des Auftraggebers verarbeitet, gilt ergänzend die nachstehende Vereinbarung gemäß Art 28 DSGVO."),
    subH("4.1  Weisungsrecht"),
    para("Der Auftragnehmer verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung des Auftraggebers, es sei denn, er ist gesetzlich zur Verarbeitung verpflichtet."),
    subH("4.2  Vertraulichkeit"),
    para("Der Auftragnehmer stellt sicher, dass die zur Verarbeitung befugten Personen zur Vertraulichkeit verpflichtet sind oder einer angemessenen gesetzlichen Verschwiegenheitspflicht unterliegen."),
    subH("4.3  Datensicherheit"),
    para("Der Auftragnehmer trifft geeignete technische und organisatorische Maßnahmen gemäß Art 32 DSGVO – insbesondere Verschlüsselung, Zutritts- und Zugriffskontrolle, Datensicherung sowie Protokollierung – und passt diese dem Stand der Technik an."),
    subH("4.4  Sub-Auftragsverarbeitung"),
    para("Die Beiziehung weiterer Auftragsverarbeiter erfolgt nur mit vorheriger, allgemeiner oder gesonderter Zustimmung des Auftraggebers. Der Auftragnehmer erlegt dem Sub-Auftragsverarbeiter dieselben Datenschutzpflichten auf."),
    subH("4.5  Unterstützung"),
    para("Der Auftragnehmer unterstützt den Auftraggeber im Rahmen des Zumutbaren bei der Beantwortung von Betroffenenanfragen sowie bei der Einhaltung der Pflichten gemäß Art 32 bis 36 DSGVO (u. a. Meldung von Datenschutzverletzungen)."),
    subH("4.6  Rückgabe von personenbezogenen Daten"),
    para("Nach Beendigung der Leistung werden sämtliche personenbezogenen Daten nach Wahl des Auftraggebers zurückgegeben oder gelöscht, sofern keine gesetzliche Aufbewahrungspflicht entgegensteht."),
    subH("4.7  Überprüfung"),
    para("Der Auftragnehmer stellt dem Auftraggeber alle zum Nachweis der Einhaltung erforderlichen Informationen zur Verfügung und ermöglicht angemessene Überprüfungen bzw. Audits nach vorheriger Ankündigung."),

    sectionH("5)  ZAHLUNGSBEDINGUNGEN & VERGÜTUNG"),
    subH("5.1  Vergütung"),
    para("Die Vergütung richtet sich nach den in Punkt 1 angeführten Positionen. Alle Preise verstehen sich netto in {currency} zuzüglich der gesetzlichen Umsatzsteuer. Reise-, Fahrt- und Nächtigungskosten werden, sofern nicht anders vereinbart, nach tatsächlichem Aufwand verrechnet."),
    subH("5.2  Zahlungsbedingungen"),
    para("Rechnungen sind innerhalb von {payment_terms_days} Tagen ab Rechnungserhalt ohne Abzug zur Zahlung fällig. Bei Projekten kann der Auftragnehmer Teil- oder Anzahlungsrechnungen entsprechend dem Leistungsfortschritt legen. Bei Zahlungsverzug werden Verzugszinsen in gesetzlicher Höhe (bei unternehmerischen Geschäften 9,2 Prozentpunkte über dem Basiszinssatz) sowie angemessene Mahn- und Inkassospesen verrechnet."),
    subH("5.3  Lieferung & Termine"),
    para("Die Leistungserbringung beginnt nach Auftragserteilung und Klärung aller technischen Voraussetzungen. Angegebene Liefer- und Leistungstermine ({service_period}) sind, sofern nicht ausdrücklich als verbindlich (Fixtermin) bezeichnet, Richtwerte. Verzögerungen aus der Sphäre des Auftraggebers oder durch höhere Gewalt verlängern die Fristen angemessen."),
    subH("5.4  Eigentumsvorbehalt"),
    para("Gelieferte Waren bleiben bis zur vollständigen Bezahlung sämtlicher Forderungen aus der Geschäftsbeziehung im Eigentum des Auftragnehmers."),

    sectionH("6)  GERICHTSSTAND"),
    para("Es gilt österreichisches Recht unter Ausschluss der Verweisungsnormen des internationalen Privatrechts sowie des UN-Kaufrechts. Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist das sachlich zuständige Gericht in Wien."),

    sectionH("7)  SCHLUSSBESTIMMUNGEN"),
    para("Änderungen und Ergänzungen bedürfen der Schriftform; dies gilt auch für ein Abgehen vom Schriftformerfordernis. Sollten einzelne Bestimmungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (salvatorische Klausel); an die Stelle der unwirksamen Bestimmung tritt eine dem wirtschaftlichen Zweck möglichst nahekommende Regelung."),

    sectionH("8)  AUFTRAGSERTEILUNG"),
    para("Der Auftraggeber erteilt hiermit den Auftrag zu den vorstehenden Leistungen, Preisen und Bedingungen."),
    electronicNote(),
    signatures(),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 100 } }),
    p(run("Platzhalter in { } werden beim Erzeugen automatisch aus den Portal-Daten befüllt. Die Rechtstexte sind unverbindliche Muster und vor Verwendung rechtlich zu prüfen.", { size: 12, color: "9CA3AF", italics: true }), { alignment: AlignmentType.CENTER, spacing: { before: 40 } }),
  ];
}

const hint = () => p(run("Platzhalter in { } werden beim Erzeugen automatisch aus den Portal-Daten befüllt.", { size: 12, color: "9CA3AF", italics: true }), { alignment: AlignmentType.CENTER, spacing: { before: 40 } });

// ── Lieferschein: Positionen ohne Preise + Empfangsbestätigung ──
const DCOLS = [760, 1700, 4618, 1200, 1360];
const deliveryItemsTable = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: DCOLS, borders: noBorders,
  rows: [
    new TableRow({ tableHeader: true, children: [
      headCell("POS", DCOLS[0]), headCell("ART.-NR.", DCOLS[1]), headCell("BESCHREIBUNG", DCOLS[2]),
      headCell("MENGE", DCOLS[3], AlignmentType.CENTER), headCell("EINHEIT", DCOLS[4], AlignmentType.CENTER),
    ] }),
    new TableRow({ children: [
      bodyCell("{#items}{pos}", DCOLS[0]), bodyCell("{sku}", DCOLS[1]), bodyCell("{description}", DCOLS[2]),
      bodyCell("{qty}", DCOLS[3], AlignmentType.CENTER), bodyCell("{unit}{/items}", DCOLS[4], AlignmentType.CENTER),
    ] }),
  ],
});
const deliverySignatures = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [4819, 4819], borders: noBorders,
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 200, bottom: 0, left: 0, right: 200 }, children: [sigRule(), sigCap("Ort, Datum")] }),
    new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 200, bottom: 0, left: 0, right: 0 }, children: [sigRule(), sigCap("Unterschrift / Stempel Empfänger")] }),
  ] })],
});
function deliveryBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
    p(run(""), { spacing: { after: 120 } }),
    para("Mit diesem Lieferschein bestätigen wir die Lieferung der nachstehenden Positionen zu Auftrag {order_reference}. Bitte prüfen Sie die Sendung bei Erhalt auf Vollständigkeit und Unversehrtheit."),
    deliveryItemsTable(),
    para("Beanstandungen richten Sie bitte innerhalb von 5 Werktagen an info@ferrion.at."),
    subH("Empfang bestätigt"),
    deliverySignatures(),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 100 } }),
    hint(),
  ];
}

// ── Auftragsbestätigung: Positionen mit Preisen + Konditionen ──
const confirmationConditions = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [4819, 4819], borders: noBorders,
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 360, bottom: 0, left: 0, right: 200 }, children: [
      p(label("LIEFERUNG & TERMINE"), { spacing: { after: 80 } }),
      p(run("Voraussichtlicher Liefertermin: {delivery_date}", { size: 16, color: INK })),
      p(run("Leistungszeitraum: {service_period}", { size: 16, color: BODY }), { spacing: { before: 30 } }),
    ] }),
    new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 360, bottom: 0, left: 0, right: 0 }, children: [
      p(label("ZAHLUNGSBEDINGUNGEN"), { spacing: { after: 80 } }),
      p(run("Zahlbar innerhalb von {payment_terms_days} Tagen ab Rechnungserhalt, netto ohne Abzug.", { size: 16, color: INK })),
      p(run("Alle Preise in {currency}, zzgl. gesetzlicher USt.", { size: 16, color: BODY }), { spacing: { before: 30 } }),
    ] }),
  ] })],
});
function confirmationBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
    p(run(""), { spacing: { after: 120 } }),
    para("Vielen Dank für Ihren Auftrag. Wir bestätigen Ihnen hiermit die Beauftragung zu den nachstehenden Positionen und Konditionen. Grundlage bildet {order_reference}."),
    itemsTable(), totals(),
    confirmationConditions(),
    para("Bitte prüfen Sie diese Auftragsbestätigung. Sollten die Angaben von Ihrer Bestellung abweichen, informieren Sie uns bitte innerhalb von 5 Werktagen."),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 100 } }),
    hint(),
  ];
}

// ── Mahnung ─────────────────────────────────────────────────
const dunningSummary = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: TCOLS, borders: noBorders,
  rows: [
    totalRow("Offener Rechnungsbetrag", "{total} {currency}"),
    totalRow("Mahnspesen", "{reminder_fee} {currency}"),
    totalRow("Verzugszinsen", "{interest} {currency}"),
    totalRow("Gesamt offen", "{amount_due} {currency}", { emphasize: true, band: true }),
  ],
});
function mahnungBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
    p(run(""), { spacing: { after: 120 } }),
    para("Sehr geehrte Damen und Herren, für die nachstehende Rechnung {invoice_number} vom {invoice_date} konnten wir bis heute leider keinen Zahlungseingang feststellen. Wir ersuchen Sie höflich, den offenen Betrag umgehend zu begleichen."),
    dunningSummary(),
    para("Bitte überweisen Sie den Gesamtbetrag von {amount_due} {currency} bis spätestens {due_date} auf unser Konto {issuer_iban} ({issuer_bank}), Verwendungszweck {invoice_number}."),
    para("Sollte sich Ihre Zahlung mit diesem Schreiben überschnitten haben, betrachten Sie dieses bitte als gegenstandslos. Für Rückfragen erreichen Sie uns unter info@ferrion.at."),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 100 } }),
    hint(),
  ];
}

// ── Gutschrift / Storno ─────────────────────────────────────
function gutschriftBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
    p(run(""), { spacing: { after: 120 } }),
    para("Hiermit erteilen wir Ihnen zur Rechnung {invoice_number} vom {invoice_date} folgende Gutschrift. Grund der Gutschrift: {credit_reason}."),
    itemsTable(), totals(),
    para("Der ausgewiesene Gutschriftsbetrag wird Ihnen rückerstattet bzw. mit offenen Forderungen verrechnet."),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 100 } }),
    hint(),
  ];
}

// ── Abnahmeprotokoll ────────────────────────────────────────
function abnahmeBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
    sectionH("1)  GEGENSTAND DER ABNAHME"),
    para("Projekt / Leistung: {project_name}"),
    para("{project_scope}"),
    sectionH("2)  DURCHGEFÜHRTE LEISTUNGEN"),
    para("{service_description}"),
    bullet("Installation und Konfiguration gemäß Auftrag {order_reference}"),
    bullet("Funktionstests und produktive Inbetriebnahme"),
    bullet("Einschulung sowie Übergabe der Dokumentation"),
    sectionH("3)  FESTSTELLUNGEN"),
    para("[   ]  Abnahme ohne Mängel"),
    para("[   ]  Abnahme mit geringfügigen Mängeln (siehe Mängelliste)"),
    para("[   ]  Abnahme verweigert"),
    subH("Mängelliste / Anmerkungen"),
    para("{defects}"),
    sectionH("4)  ABNAHMEERKLÄRUNG"),
    para("Der Auftraggeber bestätigt mit seiner Unterschrift die vertragsgemäße Erbringung der oben genannten Leistungen. Mit der Abnahme beginnt die Gewährleistungsfrist."),
    signatures(),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 } }),
    hint(),
  ];
}

// ── Wartungs-/SLA-Vertrag ───────────────────────────────────
const SLACOLS = [1900, 4419, 3319];
const slaTable = () => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: SLACOLS, borders: noBorders,
  rows: [
    new TableRow({ tableHeader: true, children: [
      headCell("PRIORITÄT", SLACOLS[0]), headCell("BESCHREIBUNG", SLACOLS[1]), headCell("REAKTIONSZEIT", SLACOLS[2], AlignmentType.RIGHT),
    ] }),
    new TableRow({ children: [bodyCell("Kritisch", SLACOLS[0]), bodyCell("Totalausfall / Sicherheitsvorfall", SLACOLS[1]), bodyCell("{sla_critical}", SLACOLS[2], AlignmentType.RIGHT)] }),
    new TableRow({ children: [bodyCell("Hoch", SLACOLS[0]), bodyCell("Wesentliche Beeinträchtigung", SLACOLS[1]), bodyCell("{sla_high}", SLACOLS[2], AlignmentType.RIGHT)] }),
    new TableRow({ children: [bodyCell("Mittel", SLACOLS[0]), bodyCell("Eingeschränkte Funktion", SLACOLS[1]), bodyCell("{sla_medium}", SLACOLS[2], AlignmentType.RIGHT)] }),
    new TableRow({ children: [bodyCell("Niedrig", SLACOLS[0]), bodyCell("Anfrage / Change Request", SLACOLS[1]), bodyCell("{sla_low}", SLACOLS[2], AlignmentType.RIGHT)] }),
  ],
});
function wartungBody(cfg) {
  return [
    headerBand(cfg), goldRule(), issuerMeta(cfg), ...billTo(cfg),
    sectionH("PRÄAMBEL"),
    para("Zwischen Ferrion IT Systemhaus GmbH (Auftragnehmer) und {customer_company} (Auftraggeber) wird der nachstehende Wartungs- und Servicevertrag geschlossen. Er regelt Betrieb, Wartung und Support der beim Auftraggeber eingesetzten Infrastruktur."),
    sectionH("1)  LEISTUNGSUMFANG"),
    para("Der Auftragnehmer erbringt die folgenden wiederkehrenden Leistungen:"),
    para("{service_description}"),
    bullet("Proaktives Monitoring und Alerting rund um die Uhr"),
    bullet("Wartung, Updates und Patch-Management in definierten Wartungsfenstern"),
    bullet("Störungsbehebung und Support gemäß den vereinbarten Service-Levels"),
    bullet("Verwaltung von Herstellerverträgen, Renewals und Lizenzen"),
    sectionH("2)  SERVICE-LEVEL (SLA)"),
    slaTable(),
    para("Servicezeiten: {service_hours} · Zielverfügbarkeit: {availability}. Die Reaktionszeit bezeichnet die Zeit bis zur qualifizierten Bearbeitung nach Eingang der Störungsmeldung."),
    sectionH("3)  VERGÜTUNG"),
    para("Die Vergütung beträgt {monthly_fee} {currency} pro Monat, netto zuzüglich der gesetzlichen USt. Die Verrechnung erfolgt {billing_cycle}. Nicht im Pauschalumfang enthaltene Leistungen werden nach Aufwand verrechnet."),
    sectionH("4)  LAUFZEIT & KÜNDIGUNG"),
    para("Der Vertrag beginnt am {contract_start} und wird auf {contract_term} abgeschlossen. Er verlängert sich automatisch um jeweils zwölf Monate, sofern er nicht mit einer Frist von {notice_period} zum jeweiligen Laufzeitende schriftlich gekündigt wird."),
    sectionH("5)  MITWIRKUNG DES AUFTRAGGEBERS"),
    para("Der Auftraggeber stellt die zur Leistungserbringung erforderlichen Zugänge, Informationen und Ansprechpartner zeitgerecht bereit und meldet Störungen über die vereinbarten Kanäle."),
    sectionH("6)  HAFTUNG & GEWÄHRLEISTUNG"),
    para("Der Auftragnehmer haftet nur für Vorsatz und grobe Fahrlässigkeit; die Haftung ist der Höhe nach auf die Jahresvergütung begrenzt. Für Datenverlust wird nur gehaftet, sofern der Auftraggeber eine dem Stand der Technik entsprechende Datensicherung sichergestellt hat."),
    sectionH("7)  DATENSCHUTZ"),
    para("Die Verarbeitung personenbezogener Daten erfolgt nach der DSGVO auf Grundlage einer gesonderten Auftragsverarbeitungsvereinbarung gemäß Art 28 DSGVO."),
    sectionH("8)  SCHLUSSBESTIMMUNGEN & GERICHTSSTAND"),
    para("Änderungen und Ergänzungen bedürfen der Schriftform. Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts; ausschließlicher Gerichtsstand ist das sachlich zuständige Gericht in Wien. Sollten einzelne Bestimmungen unwirksam sein, bleibt der übrige Vertrag wirksam."),
    signatures(),
    p(run(cfg.thanks, { size: 16, italics: true, color: GRAY }), { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 100 } }),
    hint(),
  ];
}

function buildDoc(cfg) {
  return new Document({
    creator: "Ferrion IT Systemhaus", title: cfg.docTitle,
    styles: { default: { document: { run: { font: FONT, size: 18, color: INK } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT }, margin: { top: 1134, right: 1134, bottom: 1440, left: 1134, footer: 560 } } },
      footers: { default: pageFooter() },
      children:
        cfg.mode === "quote" ? quoteBody(cfg)
        : cfg.mode === "delivery" ? deliveryBody(cfg)
        : cfg.mode === "confirmation" ? confirmationBody(cfg)
        : cfg.mode === "reminder" ? mahnungBody(cfg)
        : cfg.mode === "credit" ? gutschriftBody(cfg)
        : cfg.mode === "acceptance" ? abnahmeBody(cfg)
        : cfg.mode === "maintenance" ? wartungBody(cfg)
        : [
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

const DELIVERY = {
  mode: "delivery", docTitle: "Lieferschein", headTitle: "LIEFERSCHEIN", headSub: "DELIVERY NOTE",
  metaTitle: "LIEFERDATEN", issuerLabel: "ABSENDER", recipientLabel: "LIEFERADRESSE",
  metaRows: [["Lieferscheinnr.", "{delivery_number}"], ["Lieferdatum", "{delivery_date}"], ["Bezug (Auftrag)", "{order_reference}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Vielen Dank für Ihr Vertrauen in Ferrion.",
  file: "Ferrion-Lieferschein-Vorlage.docx",
};
const CONFIRMATION = {
  mode: "confirmation", docTitle: "Auftragsbestätigung", headTitle: "AUFTRAGSBESTÄTIGUNG", headSub: "ORDER CONFIRMATION", headSize: 24,
  metaTitle: "AUFTRAGSDATEN", issuerLabel: "AUFTRAGNEHMER", recipientLabel: "AUFTRAGGEBER",
  metaRows: [["Auftragsbest.-Nr.", "{confirmation_number}"], ["Datum", "{confirmation_date}"], ["Ihre Bestellung", "{order_reference}"], ["Liefertermin", "{delivery_date}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Wir danken für Ihren Auftrag und freuen uns auf die Umsetzung.",
  file: "Ferrion-Auftragsbestaetigung-Vorlage.docx",
};

const REMINDER = {
  mode: "reminder", docTitle: "Mahnung", headTitle: "MAHNUNG", headSub: "PAYMENT REMINDER",
  metaTitle: "MAHNDATEN", issuerLabel: "ABSENDER", recipientLabel: "EMPFÄNGER",
  metaRows: [["Mahnnr.", "{reminder_number}"], ["Datum", "{reminder_date}"], ["Rechnungsnr.", "{invoice_number}"], ["Rechnungsdatum", "{invoice_date}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Mit freundlichen Grüßen — Ferrion IT Systemhaus",
  file: "Ferrion-Mahnung-Vorlage.docx",
};
const CREDIT = {
  mode: "credit", docTitle: "Gutschrift", headTitle: "GUTSCHRIFT", headSub: "CREDIT NOTE",
  metaTitle: "GUTSCHRIFTSDATEN", issuerLabel: "RECHNUNGSSTELLER", recipientLabel: "EMPFÄNGER",
  metaRows: [["Gutschriftsnr.", "{credit_number}"], ["Datum", "{credit_date}"], ["Bezug Rechnung", "{invoice_number}"], ["Rechnungsdatum", "{invoice_date}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Vielen Dank für Ihr Vertrauen in Ferrion.",
  file: "Ferrion-Gutschrift-Vorlage.docx",
};
const ACCEPTANCE = {
  mode: "acceptance", docTitle: "Abnahmeprotokoll", headTitle: "ABNAHMEPROTOKOLL", headSub: "ACCEPTANCE PROTOCOL", headSize: 24,
  metaTitle: "PROTOKOLLDATEN", issuerLabel: "AUFTRAGNEHMER", recipientLabel: "AUFTRAGGEBER",
  metaRows: [["Protokollnr.", "{protocol_number}"], ["Datum", "{protocol_date}"], ["Projekt / Auftrag", "{order_reference}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Vielen Dank für die gute Zusammenarbeit.",
  file: "Ferrion-Abnahmeprotokoll-Vorlage.docx",
};
const MAINTENANCE = {
  mode: "maintenance", docTitle: "Wartungsvertrag", headTitle: "WARTUNGSVERTRAG", headSub: "SERVICE AGREEMENT", headSize: 26,
  metaTitle: "VERTRAGSDATEN", issuerLabel: "AUFTRAGNEHMER", recipientLabel: "AUFTRAGGEBER",
  metaRows: [["Vertragsnr.", "{contract_number}"], ["Datum", "{contract_date}"], ["Vertragsbeginn", "{contract_start}"], ["Kundennr.", "{customer_number}"]],
  thanks: "Wir freuen uns auf die partnerschaftliche Zusammenarbeit.",
  file: "Ferrion-Wartungsvertrag-Vorlage.docx",
};

const outDir = path.join(__dirname, "..", "templates");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  for (const cfg of [INVOICE, QUOTE, DELIVERY, CONFIRMATION, REMINDER, CREDIT, ACCEPTANCE, MAINTENANCE]) {
    const buf = await Packer.toBuffer(buildDoc(cfg));
    const out = path.join(outDir, cfg.file);
    fs.writeFileSync(out, buf);
    console.log("WROTE", out, buf.length, "bytes");
  }
}
main();
