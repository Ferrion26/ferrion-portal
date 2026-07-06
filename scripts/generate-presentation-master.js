/**
 * Ferrion PowerPoint-Master für Kundenpräsentationen
 * ------------------------------------------------------------------
 * Erzeugt templates/Ferrion-Praesentationsmaster.pptx — 10 Beispiel-
 * Layouts im Ferrion-CI (dunkel #0D1117, Gold #C9A84C, Arial) zum
 * Duplizieren und Befüllen. {Platzhalter} austauschen.
 *
 * Ausführen (Abhängigkeiten: pptxgenjs react react-dom react-icons sharp):
 *   node scripts/generate-presentation-master.js
 *
 * Hinweis: Aus einem Verzeichnis mit eigenen react/react-dom-Versionen
 * ausführen (nicht aus dem Next.js-Projektbaum) und FERRION_ROOT setzen,
 * sonst kollidieren die React-Instanzen von Projekt und Generator.
 */
const path = require("path");
const REPO = process.env.FERRION_ROOT || path.join(__dirname, "..");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const pptxgen = require("pptxgenjs");
const {
  FaDatabase, FaShieldAlt, FaCogs, FaCheckCircle, FaQuoteLeft,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaRobot,
} = require("react-icons/fa");

// ── Ferrion CI ──────────────────────────────────────────────
const DARK = "0D1117", CARD = "111827", GOLD = "C9A84C", GOLDL = "E0BC5A";
const WHITE = "FFFFFF", GRAY = "9CA3AF", GRAY2 = "6B7280", LINE = "2B3444";
const FONT = "Arial";
const LOGO = path.join(REPO, "scripts", "assets", "ferrion-logo.png"); // Gold-Variante für dunklen Grund

async function iconPng(Icon, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color, size: "256" }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

function eyebrow(slide, text, x = 0.6, y = 0.5, w = 6) {
  slide.addText(text, { x, y, w, h: 0.3, fontFace: FONT, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 4, margin: 0 });
}
function slideTitle(slide, text, x = 0.6, y = 0.78, w = 8.8, size = 28) {
  slide.addText(text, { x, y, w, h: 0.62, fontFace: FONT, fontSize: size, bold: true, color: WHITE, margin: 0 });
}
function card(slide, pres, o) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || CARD },
    line: o.gold ? { color: GOLD, width: 1.25 } : { color: LINE, width: 0.75 },
  });
}
function iconCircle(slide, pres, data, cx, cy, d = 0.62) {
  slide.addShape(pres.shapes.OVAL, { x: cx, y: cy, w: d, h: d, fill: { color: GOLD, transparency: 82 }, line: { color: GOLD, width: 0.75 } });
  const pad = d * 0.26;
  slide.addImage({ data, x: cx + pad, y: cy + pad, w: d - 2 * pad, h: d - 2 * pad });
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 × 5.625 in
  pres.author = "Ferrion IT Systemhaus";
  pres.title = "Ferrion Präsentationsmaster";

  const ic = {
    db: await iconPng(FaDatabase, "#C9A84C"),
    shield: await iconPng(FaShieldAlt, "#C9A84C"),
    cogs: await iconPng(FaCogs, "#C9A84C"),
    robot: await iconPng(FaRobot, "#C9A84C"),
    check: await iconPng(FaCheckCircle, "#C9A84C"),
    quote: await iconPng(FaQuoteLeft, "#C9A84C"),
    phone: await iconPng(FaPhoneAlt, "#C9A84C"),
    mail: await iconPng(FaEnvelope, "#C9A84C"),
    pin: await iconPng(FaMapMarkerAlt, "#C9A84C"),
  };

  pres.defineSlideMaster({ title: "F_COVER", background: { color: DARK } });
  pres.defineSlideMaster({
    title: "F_CONTENT", background: { color: DARK },
    objects: [
      { text: { text: "FERRION · IT SYSTEMHAUS", options: { x: 0.6, y: 5.3, w: 3.5, h: 0.22, fontFace: FONT, fontSize: 8, color: GRAY2, charSpacing: 2, margin: 0 } } },
    ],
    slideNumber: { x: 9.3, y: 5.3, w: 0.3, h: 0.22, fontFace: FONT, fontSize: 9, color: GRAY2, align: "right" },
  });

  // ── 1 · Titel ─────────────────────────────────────────────
  let s = pres.addSlide({ masterName: "F_COVER" });
  s.addImage({ path: LOGO, x: 0.6, y: 0.55, w: 2.5, h: 0.63 });
  eyebrow(s, "KUNDENPRÄSENTATION", 0.6, 2.05, 6);
  s.addText("{Titel der Präsentation}", { x: 0.6, y: 2.35, w: 8.8, h: 0.85, fontFace: FONT, fontSize: 40, bold: true, color: WHITE, margin: 0 });
  s.addText("{Untertitel oder Anlass}   ·   {Kunde}   ·   {Datum}", { x: 0.6, y: 3.28, w: 8.8, h: 0.35, fontFace: FONT, fontSize: 14, color: GRAY, margin: 0 });
  s.addText("BUILD TO ENDURE", { x: 0.6, y: 4.95, w: 4, h: 0.28, fontFace: FONT, fontSize: 10, bold: true, color: GOLD, charSpacing: 5, margin: 0 });
  s.addText("ferrion.at", { x: 7.9, y: 4.95, w: 1.5, h: 0.28, fontFace: FONT, fontSize: 10, color: GRAY2, align: "right", margin: 0 });
  s.addNotes("Deckblatt — Titel, Untertitel, Kunde und Datum austauschen. Dieses Layout für jeden Kundentermin als Einstieg verwenden.");

  // ── 2 · Agenda ────────────────────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "AGENDA");
  slideTitle(s, "Worüber wir heute sprechen");
  const agenda = [
    ["01", "{Ausgangslage & Ziele}", "{Kurzbeschreibung des Punkts}"],
    ["02", "{Lösungsvorschlag}", "{Kurzbeschreibung des Punkts}"],
    ["03", "{Vorgehen & Zeitplan}", "{Kurzbeschreibung des Punkts}"],
    ["04", "{Investition}", "{Kurzbeschreibung des Punkts}"],
    ["05", "{Nächste Schritte}", "{Kurzbeschreibung des Punkts}"],
  ];
  agenda.forEach(([n, t, d], i) => {
    const y = 1.62 + i * 0.68;
    s.addText(n, { x: 0.6, y, w: 0.65, h: 0.4, fontFace: FONT, fontSize: 20, bold: true, color: GOLD, margin: 0 });
    s.addText(t, { x: 1.4, y: y - 0.02, w: 4.7, h: 0.32, fontFace: FONT, fontSize: 15, bold: true, color: WHITE, margin: 0 });
    s.addText(d, { x: 1.4, y: y + 0.28, w: 4.7, h: 0.26, fontFace: FONT, fontSize: 10.5, color: GRAY, margin: 0 });
  });
  card(s, pres, { x: 6.6, y: 1.62, w: 2.8, h: 3.3 });
  s.addText("IHR TERMIN", { x: 6.85, y: 1.88, w: 2.3, h: 0.26, fontFace: FONT, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText([
    { text: "Datum", options: { fontSize: 9.5, color: GRAY2, breakLine: true } },
    { text: "{TT.MM.JJJJ}", options: { fontSize: 12.5, bold: true, color: WHITE, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "Dauer", options: { fontSize: 9.5, color: GRAY2, breakLine: true } },
    { text: "{60 Minuten}", options: { fontSize: 12.5, bold: true, color: WHITE, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: "Ihre Ansprechpartner", options: { fontSize: 9.5, color: GRAY2, breakLine: true } },
    { text: "{Name, Rolle}", options: { fontSize: 12.5, bold: true, color: WHITE } },
  ], { x: 6.85, y: 2.25, w: 2.3, h: 2.5, fontFace: FONT, margin: 0, valign: "top" });
  s.addNotes("Agenda — 3 bis 5 Punkte, mehr wirkt überladen. Termin-Karte rechts mit echten Daten befüllen oder löschen.");

  // ── 3 · Kapiteltrenner ────────────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  s.addText("01", { x: 0.6, y: 1.55, w: 2.6, h: 1.7, fontFace: FONT, fontSize: 110, bold: true, color: GOLD, margin: 0 });
  s.addText("{Kapitelüberschrift}", { x: 3.4, y: 2.1, w: 6, h: 0.7, fontFace: FONT, fontSize: 32, bold: true, color: WHITE, margin: 0 });
  s.addText("{Ein Satz, der das Kapitel einordnet.}", { x: 3.4, y: 2.85, w: 5.8, h: 0.4, fontFace: FONT, fontSize: 14, color: GRAY, margin: 0 });
  s.addNotes("Kapiteltrenner — Nummer und Überschrift je Abschnitt anpassen. Gibt der Präsentation Rhythmus; vor jedem großen Themenwechsel einsetzen.");

  // ── 4 · Inhalt + Kernaussage ──────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "{THEMA}");
  slideTitle(s, "{Aussagekräftiger Slide-Titel}");
  s.addText([
    { text: "{Erster Punkt — kurz und konkret formuliert}", options: { bullet: { code: "25B8", indent: 14 }, breakLine: true } },
    { text: "{Zweiter Punkt mit dem wichtigsten Nutzenargument}", options: { bullet: { code: "25B8", indent: 14 }, breakLine: true } },
    { text: "{Dritter Punkt — Zahlen schlagen Adjektive}", options: { bullet: { code: "25B8", indent: 14 }, breakLine: true } },
    { text: "{Vierter Punkt, maximal fünf pro Folie}", options: { bullet: { code: "25B8", indent: 14 } } },
  ], { x: 0.6, y: 1.65, w: 5.1, h: 2.9, fontFace: FONT, fontSize: 13.5, color: WHITE, paraSpaceAfter: 12, bulletColor: GOLD, margin: 0, valign: "top" });
  card(s, pres, { x: 6.1, y: 1.55, w: 3.3, h: 3.45 });
  iconCircle(s, pres, ic.check, 6.4, 1.85);
  s.addText("KERNAUSSAGE", { x: 6.4, y: 2.6, w: 2.7, h: 0.26, fontFace: FONT, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText("{Die eine Botschaft, die hängen bleiben soll.}", { x: 6.4, y: 2.9, w: 2.7, h: 0.85, fontFace: FONT, fontSize: 13, bold: true, color: WHITE, margin: 0 });
  s.addText("{99,9 %}", { x: 6.4, y: 3.85, w: 2.7, h: 0.55, fontFace: FONT, fontSize: 30, bold: true, color: GOLD, margin: 0 });
  s.addText("{Beleg-Kennzahl zur Aussage}", { x: 6.4, y: 4.42, w: 2.7, h: 0.3, fontFace: FONT, fontSize: 9.5, color: GRAY, margin: 0 });
  s.addNotes("Standard-Inhaltsfolie — links maximal 5 Bullets, rechts die Kernaussage mit einer Beleg-Kennzahl. Wenn keine Kennzahl existiert: Karte löschen und Bullets breiter ziehen.");

  // ── 5 · Drei Karten (Leistungen) ──────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "LEISTUNGEN");
  slideTitle(s, "{Drei Bausteine der Lösung}");
  const cards3 = [
    [ic.db, "{Storage & Infrastruktur}", "{Was dieser Baustein leistet und welches Problem er löst — zwei bis drei Zeilen.}"],
    [ic.shield, "{Backup & Security}", "{Was dieser Baustein leistet und welches Problem er löst — zwei bis drei Zeilen.}"],
    [ic.cogs, "{Managed Services}", "{Was dieser Baustein leistet und welches Problem er löst — zwei bis drei Zeilen.}"],
  ];
  cards3.forEach(([icn, t, d], i) => {
    const x = 0.6 + i * 3.0;
    card(s, pres, { x, y: 1.6, w: 2.8, h: 3.3 });
    iconCircle(s, pres, icn, x + 0.25, 1.9);
    s.addText(t, { x: x + 0.25, y: 2.75, w: 2.3, h: 0.55, fontFace: FONT, fontSize: 14.5, bold: true, color: WHITE, margin: 0 });
    s.addText(d, { x: x + 0.25, y: 3.35, w: 2.3, h: 1.3, fontFace: FONT, fontSize: 10.5, color: GRAY, margin: 0 });
  });
  s.addNotes("Leistungs-/Baustein-Folie — funktioniert für 2 bis 4 Karten; bei 4 Karten Breite auf 2,1 Zoll reduzieren. Icons können pro Thema getauscht werden.");

  // ── 6 · Kennzahlen ────────────────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "ZAHLEN, DIE ZÄHLEN");
  slideTitle(s, "{Das Ergebnis in vier Kennzahlen}");
  const stats = [
    ["{0 min}", "{ungeplante Downtime}"],
    ["{15,7×}", "{Performance-Gewinn}"],
    ["{68 h}", "{Migrationsdauer}"],
    ["{99,9%}", "{Verfügbarkeit}"],
  ];
  stats.forEach(([n, l], i) => {
    const x = 0.6 + i * 2.28;
    card(s, pres, { x, y: 1.75, w: 2.12, h: 1.9 });
    s.addText(n, { x: x + 0.16, y: 2.08, w: 1.86, h: 0.7, fontFace: FONT, fontSize: 28, bold: true, color: GOLD, margin: 0 });
    s.addText(l, { x: x + 0.16, y: 2.85, w: 1.86, h: 0.6, fontFace: FONT, fontSize: 10.5, color: GRAY, margin: 0 });
  });
  s.addText("{Einordnender Satz: Woher stammen die Zahlen, welches Projekt, welcher Zeitraum — Glaubwürdigkeit schlägt Größe.}",
    { x: 0.6, y: 4.05, w: 8.8, h: 0.6, fontFace: FONT, fontSize: 11.5, italic: true, color: GRAY, margin: 0 });
  s.addNotes("Kennzahlen-Folie — große Zahlen wirken nur mit Quelle. Den Einordnungssatz unten immer ausfüllen.");

  // ── 7 · Vorgehen / Zeitplan ───────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "VORGEHEN");
  slideTitle(s, "{Projektphasen & Zeitplan}");
  s.addShape(pres.shapes.LINE, { x: 1.0, y: 2.95, w: 8.0, h: 0, line: { color: LINE, width: 1.5 } });
  const phases = [
    ["1", "{Analyse}", "{2 Wochen}", "{Assessment & Konzept}"],
    ["2", "{Umsetzung}", "{4 Wochen}", "{Lieferung & Installation}"],
    ["3", "{Migration}", "{1 Woche}", "{Umzug ohne Downtime}"],
    ["4", "{Betrieb}", "{laufend}", "{Managed Services & SLA}"],
  ];
  phases.forEach(([n, t, dur, d], i) => {
    const cx = 1.4 + i * 2.27;
    s.addText(dur, { x: cx - 0.65, y: 2.15, w: 1.9, h: 0.28, fontFace: FONT, fontSize: 10, bold: true, color: GOLD, align: "center", margin: 0 });
    s.addShape(pres.shapes.OVAL, { x: cx - 0.3, y: 2.65, w: 0.6, h: 0.6, fill: { color: GOLD }, line: { color: DARK, width: 2 } });
    s.addText(n, { x: cx - 0.3, y: 2.65, w: 0.6, h: 0.6, fontFace: FONT, fontSize: 18, bold: true, color: "000000", align: "center", valign: "middle", margin: 0 });
    s.addText(t, { x: cx - 0.95, y: 3.5, w: 1.9, h: 0.32, fontFace: FONT, fontSize: 14, bold: true, color: WHITE, align: "center", margin: 0 });
    s.addText(d, { x: cx - 0.95, y: 3.84, w: 1.9, h: 0.55, fontFace: FONT, fontSize: 10, color: GRAY, align: "center", margin: 0 });
  });
  s.addNotes("Zeitplan-Folie — Phasen, Dauern und Beschreibungen anpassen. Bei mehr als 5 Phasen besser zwei Folien daraus machen.");

  // ── 8 · Vergleich ─────────────────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "OPTIONEN");
  slideTitle(s, "{Zwei Wege im Vergleich}");
  const opt = (x, gold, title, sub, items) => {
    card(s, pres, { x, y: 1.65, w: 4.3, h: 3.25, gold });
    s.addText(title, { x: x + 0.3, y: 1.95, w: 3.3, h: 0.35, fontFace: FONT, fontSize: 16, bold: true, color: WHITE, margin: 0 });
    s.addText(sub, { x: x + 0.3, y: 2.32, w: 3.7, h: 0.28, fontFace: FONT, fontSize: 10.5, color: GRAY, margin: 0 });
    s.addText(items.map((t, i) => ({ text: t, options: { bullet: { code: "25B8", indent: 12 }, breakLine: i < items.length - 1 } })),
      { x: x + 0.3, y: 2.75, w: 3.7, h: 1.9, fontFace: FONT, fontSize: 11.5, color: WHITE, paraSpaceAfter: 8, bulletColor: GOLD, margin: 0, valign: "top" });
  };
  opt(0.6, false, "{Option A — Basis}", "{Für wen diese Option passt}", ["{Merkmal oder Leistung}", "{Merkmal oder Leistung}", "{Investition: € …}"]);
  opt(5.1, true, "{Option B — Empfohlen}", "{Für wen diese Option passt}", ["{Merkmal oder Leistung}", "{Merkmal oder Leistung}", "{Mehrwert gegenüber A}", "{Investition: € …}"]);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.85, y: 1.48, w: 1.35, h: 0.34, rectRadius: 0.17, fill: { color: GOLD } });
  s.addText("EMPFOHLEN", { x: 7.85, y: 1.48, w: 1.35, h: 0.34, fontFace: FONT, fontSize: 9, bold: true, color: "000000", align: "center", valign: "middle", charSpacing: 2, margin: 0 });
  s.addNotes("Vergleichsfolie — die empfohlene Option bekommt den Gold-Rahmen und das Badge. Verschiebt die Frage von 'ob' zu 'welche'.");

  // ── 9 · Referenz ──────────────────────────────────────────
  s = pres.addSlide({ masterName: "F_CONTENT" });
  eyebrow(s, "REFERENZ");
  slideTitle(s, "{Das sagen unsere Kunden}");
  s.addImage({ data: ic.quote, x: 0.6, y: 1.7, w: 0.45, h: 0.45 });
  s.addText("{„Zitat des Kunden — ein bis zwei Sätze, konkret und glaubwürdig. Was hat sich durch das Projekt verändert?“}",
    { x: 0.6, y: 2.3, w: 5.3, h: 1.6, fontFace: FONT, fontSize: 15.5, italic: true, color: WHITE, margin: 0 });
  s.addText([
    { text: "{Name der Person}", options: { fontSize: 12, bold: true, color: GOLD, breakLine: true } },
    { text: "{Rolle, Unternehmen}", options: { fontSize: 10.5, color: GRAY } },
  ], { x: 0.6, y: 4.05, w: 5, h: 0.6, fontFace: FONT, margin: 0 });
  [["{500 TB}", "{migriert, ohne Downtime}"], ["{6 Wochen}", "{von Kickoff bis Go-Live}"]].forEach(([n, l], i) => {
    const y = 1.7 + i * 1.65;
    card(s, pres, { x: 6.4, y, w: 3.0, h: 1.45 });
    s.addText(n, { x: 6.65, y: y + 0.22, w: 2.5, h: 0.55, fontFace: FONT, fontSize: 26, bold: true, color: GOLD, margin: 0 });
    s.addText(l, { x: 6.65, y: y + 0.82, w: 2.5, h: 0.45, fontFace: FONT, fontSize: 10.5, color: GRAY, margin: 0 });
  });
  s.addNotes("Referenzfolie — echtes Kundenzitat mit Namen wirkt zehnmal stärker als anonym. Ohne Freigabe: 'Referenz auf Anfrage' und Branche nennen.");

  // ── 10 · Danke / Kontakt ──────────────────────────────────
  s = pres.addSlide({ masterName: "F_COVER" });
  s.addText("Vielen Dank.", { x: 0.6, y: 1.15, w: 6, h: 0.9, fontFace: FONT, fontSize: 44, bold: true, color: WHITE, margin: 0 });
  s.addText("{Wir freuen uns auf die Zusammenarbeit — Ihr nächster Schritt: …}",
    { x: 0.6, y: 2.15, w: 5.4, h: 0.7, fontFace: FONT, fontSize: 14, color: GRAY, margin: 0 });
  s.addImage({ path: LOGO, x: 0.6, y: 4.55, w: 2.1, h: 0.53 });
  card(s, pres, { x: 6.1, y: 1.15, w: 3.3, h: 3.3 });
  s.addText("IHR KONTAKT", { x: 6.4, y: 1.45, w: 2.7, h: 0.26, fontFace: FONT, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText("{Name der Person}", { x: 6.4, y: 1.78, w: 2.7, h: 0.3, fontFace: FONT, fontSize: 14, bold: true, color: WHITE, margin: 0 });
  s.addText("{Rolle}", { x: 6.4, y: 2.08, w: 2.7, h: 0.28, fontFace: FONT, fontSize: 10.5, color: GRAY, margin: 0 });
  const contact = [[ic.phone, "{+43 …}"], [ic.mail, "{vorname.nachname@ferrion.at}"], [ic.pin, "Wien, Österreich"]];
  contact.forEach(([icn, t], i) => {
    const y = 2.62 + i * 0.5;
    s.addImage({ data: icn, x: 6.4, y: y + 0.03, w: 0.22, h: 0.22 });
    s.addText(t, { x: 6.75, y, w: 2.55, h: 0.3, fontFace: FONT, fontSize: 11, color: WHITE, margin: 0, valign: "middle" });
  });
  s.addText("BUILD TO ENDURE", { x: 6.4, y: 4.02, w: 2.7, h: 0.26, fontFace: FONT, fontSize: 9, bold: true, color: GOLD, charSpacing: 4, margin: 0 });
  s.addNotes("Abschlussfolie — konkreten nächsten Schritt nennen (Termin, Angebot, PoC). Kontaktdaten der Person eintragen, die wirklich erreichbar ist.");

  const out = path.join(REPO, "templates", "Ferrion-Praesentationsmaster.pptx");
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
}

main().catch((e) => { console.error(e); process.exit(1); });
