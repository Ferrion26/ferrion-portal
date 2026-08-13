import fs from "fs";
import path from "path";
import { Document, Page, View, Text, Image, StyleSheet, Svg, Path as SvgPath, Circle, Line, Font, Link } from "@react-pdf/renderer";
import { QuarterSummaryEntry } from "../aggregate";
import { ReportSection } from "../metrics";
import { formatValue, formatDateTime, daysToThreshold, trendGrowthPerDay, normalizeComponentLabel } from "../reportFormat";
import { deriveStatus, buildExecutiveSummary, buildRecommendations, buildBannerHighlights, MetricStatus } from "../reportNarrative";

// Ohne das hier splittet react-pdf lange Wörter (Seriennummern, lange
// zusammengesetzte deutsche Begriffe) mit einem eingefügten Bindestrich
// beim Zeilenumbruch — für Kennungen wie eine Geräte-SN sieht das nach
// einem Darstellungsfehler aus, nicht nach Silbentrennung.
Font.registerHyphenationCallback((word) => [word]);

const GOLD = "#C9A84C";
const GOLD_DARK = "#A9852E";
const INK = "#111827";
const GRAY = "#6B7280";
const MUTED = "#9CA3AF";
const WHITE = "#FFFFFF";
const PAGE_BG = "#F3F4F6";
const DARK = "#0D1117";
const ROW_DIVIDER = "#F3F4F6";

// Layout-Grundmaß des Dashboard-Mockups: dunkle Sidebar links (Kunde/
// Produkt/Version/Gesamtstatus, wiederholt sich auf jeder Seite dieses
// Produkts via `fixed`), Hauptinhalt rechts daneben. Jedes Produkt bekommt
// eine eigene <Page> (statt eines gemeinsamen `break` in einer Page), weil
// react-pdf `fixed`-Elemente pro <Page> wiederholt — bei einem kombinierten
// Bericht muss die Sidebar aber pro Produkt unterschiedliche Werte zeigen.
const SIDEBAR_WIDTH = 148;
const PAGE_PADDING = 24;
// A4 in PDF-Punkten (react-pdfs Standardgröße für size="A4"). Explizit statt
// dem Hauptinhalt seine Breite implizit über marginLeft berechnen zu lassen
// — sicherer bei einer absolut positionierten Sidebar auf mehrseitigen,
// automatisch umbrechenden <Page>-Inhalten.
const PAGE_WIDTH = 595.28;
// Tatsächlich nutzbare Breite innerhalb von `main` (nach dessen eigenem
// paddingHorizontal) — Grundlage für Elemente wie die Trendgrafik, deren
// react-pdf-Svg-Breite ein fester Punktwert sein muss und sich nicht wie
// eine normale View automatisch an den Container anpasst.
const MAIN_CONTENT_WIDTH = PAGE_WIDTH - SIDEBAR_WIDTH - 2 * PAGE_PADDING;
const TREND_CARD_PADDING = 13;

const STATUS_COLORS: Record<MetricStatus, { bg: string; text: string; dot: string }> = {
  good: { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  warning: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  critical: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  neutral: { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
};

const STATUS_LABEL: Record<"de" | "en", Record<MetricStatus, string>> = {
  de: { good: "Ziel erreicht", warning: "Hinweis", critical: "Kritisch", neutral: "Überwacht" },
  en: { good: "On target", warning: "Note", critical: "Critical", neutral: "Monitored" },
};

const LIST_PILL_LABEL: Record<"de" | "en", Record<MetricStatus, string | null>> = {
  de: { good: "OK", warning: "Hinweis", critical: "Kritisch", neutral: null },
  en: { good: "OK", warning: "Note", critical: "Critical", neutral: null },
};

// Passed as a data URI rather than a bare file path — @react-pdf/renderer's
// path resolver is unreliable for local files in a Node/serverless context
// (silently renders nothing instead of throwing).
const LOGO_DATA_URI = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "scripts", "assets", "ferrion-logo-light.png"))
  .toString("base64")}`;

const SECTION_LABELS: Record<ReportSection, { de: string; en: string }> = {
  availability: { de: "Verfügbarkeit", en: "Availability" },
  hardware: { de: "Hardware & Infrastruktur", en: "Hardware & Infrastructure" },
  capacity: { de: "Kapazität", en: "Capacity" },
  security: { de: "Sicherheit", en: "Security" },
  operations: { de: "Betrieb", en: "Operations" },
};

function headlinePillText(entry: QuarterSummaryEntry, status: MetricStatus, locale: "de" | "en") {
  if (entry.key === "protected_capacity_tb" || entry.key === "total_capacity_tb") return locale === "de" ? "überwacht" : "monitored";
  if (entry.key === "storage_pool_fill_level") return locale === "de" ? "überwacht" : "monitored";
  return STATUS_LABEL[locale][status];
}

function trendInfo(entry: QuarterSummaryEntry) {
  if (entry.previousValue === undefined || entry.previousValue === 0) return null;
  const delta = entry.value - entry.previousValue;
  const pct = (delta / Math.abs(entry.previousValue)) * 100;
  // Unter 0.5% Veränderung lieber gar kein Pfeil als ein irreführendes
  // "-0%" (Rundungsartefakt bei sehr kleinen Deltas).
  if (Math.abs(pct) < 0.5) return null;
  const direction: "up" | "down" = delta >= 0 ? "up" : "down";
  const good = entry.trendGood ? entry.trendGood === direction : null;
  const color = good === null ? MUTED : good ? "#22C55E" : "#DC2626";
  const sign = delta >= 0 ? "+" : "";
  return { direction, color, label: `${sign}${pct.toFixed(1)}%` };
}

const styles = StyleSheet.create({
  // paddingBottom hier statt (nur) auf `main`: react-pdfs Seitenumbruch-
  // Berechnung für automatisch fließenden Inhalt bemisst den verfügbaren
  // Platz am Page-eigenen Padding, nicht am Padding verschachtelter Views —
  // und weiß nichts vom fixed-positionierten Footer. Ohne dieses Padding
  // hier hält react-pdf eine Zeile für "passt noch", obwohl sie den fixed
  // Footer überlappt, statt sie auf die nächste Seite zu schieben.
  // paddingTop hier statt (nur) auf `main`: Padding auf `page` selbst wird
  // von react-pdf garantiert auf JEDER physischen Seite neu angewendet,
  // die aus überlaufendem Inhalt entsteht — ein kleiner, aber verlässlicher
  // Abstand zum oberen Rand, auch auf Folgeseiten desselben Produkts, statt
  // dass der Inhalt dort ggf. direkt am Seitenrand beginnt.
  page: { fontFamily: "Helvetica", color: INK, fontSize: 9, backgroundColor: PAGE_BG, paddingTop: 10, paddingBottom: 48 },

  // Helle Sidebar statt vollflächig dunkel (Druckfreundlichkeit — eine
  // volle Höhe dunkler Fläche auf jeder Produktseite verbraucht beim Drucken
  // erheblich mehr Toner/Tinte als nötig). Von PAGE_BG (Hauptfläche) durch
  // eine dünne rechte Trennlinie statt einer Farbfläche abgesetzt.
  // Kein `bottom: 0` (mehr): eine bis zum Seitenende gestreckte, absolut
  // positionierte Box mit einem WIEDERUM absolut positionierten Footer
  // darin (bottom: 18) führte dazu, dass react-pdf bei mehrseitigem
  // Produktinhalt genau diesen inneren Footer isoliert auf einer sonst
  // leeren Folgeseite erneut platzierte, obwohl die Sidebar selbst (siehe
  // unten, kein `fixed`) korrekt nur einmal erschien. Ohne `bottom: 0`
  // richtet sich die Höhe der Sidebar nach ihrem eigenen Inhalt (gehört
  // eindeutig zur ersten physischen Seite) und der Footer steht als
  // normaler Fließinhalt am Ende, statt an den Seitenrand gepinnt zu sein.
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: WHITE,
    borderRightWidth: 1,
    borderRightColor: ROW_DIVIDER,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
  },
  sidebarLogo: { width: 46, height: 24, objectFit: "contain", marginBottom: 14 },
  sidebarReportLabel: { fontSize: 6.5, color: GOLD_DARK, letterSpacing: 1.5, marginBottom: 4 },
  sidebarTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: INK, lineHeight: 1.25, marginBottom: 16 },
  sidebarRule: { borderBottomWidth: 1, borderBottomColor: ROW_DIVIDER, marginBottom: 14 },
  sidebarField: { marginBottom: 15 },
  sidebarFieldLabel: { fontSize: 6.5, color: GRAY, letterSpacing: 0.8, marginBottom: 3 },
  sidebarFieldValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: INK, lineHeight: 1.35 },
  sidebarStatusCard: { backgroundColor: "#F9FAFB", borderRadius: 6, borderWidth: 1, borderColor: ROW_DIVIDER, padding: 10, marginTop: 4 },
  sidebarStatusLabel: { fontSize: 6, color: GRAY, letterSpacing: 0.8, marginBottom: 6 },
  sidebarFooter: { marginTop: 18 },
  sidebarFooterTagline: { fontSize: 6.5, color: GOLD_DARK, letterSpacing: 1 },
  sidebarFooterUrl: { fontSize: 6, color: GRAY, marginTop: 2 },

  main: { marginLeft: SIDEBAR_WIDTH, width: PAGE_WIDTH - SIDEBAR_WIDTH, paddingHorizontal: PAGE_PADDING, paddingTop: PAGE_PADDING },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  topBarKicker: { fontSize: 7, color: GRAY, letterSpacing: 1, marginBottom: 2 },
  topBarTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", color: INK },
  topBarPill: { backgroundColor: WHITE, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, fontSize: 7, color: GRAY },

  summaryBanner: { flexDirection: "row", backgroundColor: DARK, borderRadius: 8, padding: 15, marginBottom: 14, justifyContent: "space-between" },
  summaryLeft: { flex: 1, paddingRight: 12 },
  summaryHeadline: { fontSize: 12, fontFamily: "Helvetica-Bold", color: WHITE, marginBottom: 5 },
  summaryText: { fontSize: 8.5, color: "#C3C2B7", lineHeight: 1.45 },
  pillColumn: { justifyContent: "center", gap: 5, width: 130 },

  sectionTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 8, marginTop: 6, borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 4 },

  headlineRow: { flexDirection: "row", gap: 9, marginBottom: 14 },
  headlineCard: { flex: 1, backgroundColor: WHITE, borderRadius: 8, padding: 11, borderLeftWidth: 3 },
  headlineTopRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  headlineLabel: { fontSize: 7.5, color: GRAY },
  headlineValue: { fontSize: 17, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 7 },

  // Primäre KPIs (Backup-Erfolg, RPO-Einhaltung, Verfügbarkeit) deutlich
  // größer als die übrigen Kennzahlkarten — eigene Zeile darüber, damit sie
  // auf den ersten Blick als DIE wichtigsten Werte erkennbar sind.
  primaryKpiRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  primaryKpiCard: { flex: 1, backgroundColor: WHITE, borderRadius: 8, padding: 16, borderLeftWidth: 4 },
  primaryKpiLabel: { fontSize: 8, color: GRAY, marginBottom: 5 },
  primaryKpiValue: { fontSize: 25, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 9 },

  twoColRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  leftCol: { flex: 1 },
  rightCol: { flex: 1, flexDirection: "column", gap: 10 },

  listCard: { backgroundColor: WHITE, borderRadius: 8, padding: 13 },
  listCardTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 2 },
  listCardSub: { fontSize: 7.5, color: GRAY, marginBottom: 8 },
  listRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 5.5, borderBottomWidth: 1, borderBottomColor: ROW_DIVIDER },
  // minWidth: 0 ist der Standard-Flexbox-"Trick" gegen einen flex:1-Kind mit
  // Textinhalt: ohne das ist die implizite Mindestbreite eines Flex-Kinds
  // sein UNGEBROCHENER Inhalt, nicht 0 — bei einem knapp zu langen Label
  // (z. B. "Replikationspaare mit Fehlstatus") kann das dazu führen, dass
  // der Wert rechts direkt ins Label hineinrutscht statt sauber daneben zu
  // stehen (beobachtet mit echten Berichtsdaten).
  listRowLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 6, paddingRight: 10 },
  listRowLabel: { fontSize: 8.5, color: INK },
  listRowRight: { flexDirection: "row", alignItems: "center", gap: 7, flexShrink: 0, minWidth: 46 },
  listRowValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: INK },
  listRowTrend: { fontSize: 6.5 },

  pill: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 7 },
  pillText: { fontSize: 6.5, fontFamily: "Helvetica-Bold" },
  derivedTag: { fontSize: 6, color: MUTED, fontFamily: "Helvetica-Oblique" },

  alarmCard: { backgroundColor: WHITE, borderRadius: 8, padding: 13 },
  alarmRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: ROW_DIVIDER },
  alarmTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  alarmTitleGroup: { flexDirection: "row", alignItems: "center", gap: 5 },
  alarmName: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: INK },
  alarmTime: { fontSize: 6.5, color: MUTED },
  alarmDesc: { fontSize: 7.5, color: "#374151", lineHeight: 1.35 },
  alarmSuggestion: { fontSize: 7, color: MUTED, marginTop: 2, lineHeight: 1.3 },
  // "N× erkannt"-Hinweis bei Alarmen/Auffälligkeiten, die mehrfach erneut
  // gemeldet wurden (siehe AlarmSample/ComponentFault.occurrenceCount).
  occurrenceTag: { fontSize: 6.5, color: MUTED, fontFamily: "Helvetica-Oblique" },

  recLineRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  recNumber: { width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center", marginTop: 1 },
  recNumberText: { fontSize: 7, fontFamily: "Helvetica-Bold" },

  tableCardBlock: { backgroundColor: WHITE, borderRadius: 8, padding: 13 },
  tableCard: { backgroundColor: WHITE, borderRadius: 8, padding: 13, flex: 1 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  tableHeaderCell: { fontSize: 6.5, color: GRAY, letterSpacing: 0.3 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: ROW_DIVIDER },
  tableCellName: { fontSize: 8, color: INK, flex: 1, paddingRight: 6 },
  tableCellNum: { fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, width: 56, textAlign: "right" },
  // Gehäuse-Unterüberschrift in SuccessfulChecksCard (siehe groupSuccessfulChecks).
  checksGroupHeading: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: GOLD_DARK, letterSpacing: 0.3, marginBottom: 4 },

  barCard: { backgroundColor: WHITE, borderRadius: 8, padding: 13, flex: 1 },
  barCardTitle: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 8 },
  barValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 9 },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: "#E5E7EB", position: "relative" },
  barFill: { height: 6, borderRadius: 3, position: "absolute", left: 0, top: 0 },

  statRow: { flexDirection: "row", gap: 9 },
  statCard: { flex: 1, borderRadius: 8, padding: 11 },
  statLabel: { fontSize: 7.5, marginBottom: 6 },
  statValue: { fontSize: 15, fontFamily: "Helvetica-Bold", color: INK },

  recCard: { backgroundColor: WHITE, borderRadius: 8, padding: 13, marginBottom: 14 },
  recTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 9 },
  recLine: { fontSize: 8, color: "#374151", lineHeight: 1.4 },

  capacityCard: { backgroundColor: WHITE, borderRadius: 8, padding: 13, marginBottom: 14 },
  capacityBody: { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
  capacityTileGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8, minWidth: 180 },
  capacityTile: { backgroundColor: "#F9FAFB", borderRadius: 6, paddingVertical: 7, paddingHorizontal: 9, minWidth: 88 },
  capacityTileLabel: { fontSize: 6.5, color: GRAY, marginBottom: 2 },
  capacityTileValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: INK },

  trendCard: { backgroundColor: WHITE, borderRadius: 8, padding: TREND_CARD_PADDING, marginTop: 10 },
  trendTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 1 },
  trendSub: { fontSize: 6.5, color: GRAY, marginBottom: 6 },
  trendForecast: { fontSize: 8, fontFamily: "Helvetica-Bold", color: INK },

  methodologyLine: { fontSize: 7, color: MUTED, lineHeight: 1.4, marginBottom: 3 },

  // Methodik als nach Kategorie getrennte Karten statt eines einzigen
  // Fließtext-Blocks — pro Kategorie (Kapazität, Verfügbarkeit, …) eine
  // eigene Karte mit Bulletpoints, größerem Zeilenabstand als der alte
  // methodologyLine-Stil, damit lange Erklärtexte nicht wie eine Wand
  // wirken. wrap ist hier bewusst NICHT auf dem Grid oder den Karten
  // deaktiviert (nur auf den einzelnen Bulletpoints) — bei vielen Kennzahlen
  // darf sich der Methodik-Bereich über zwei Seiten erstrecken, statt als
  // starrer Block zu überlaufen (siehe die gleiche Korrektur bei
  // AlarmCard/ComponentFaultsCard weiter oben).
  methodologyIntro: { fontSize: 7, color: MUTED, lineHeight: 1.5, marginBottom: 10 },
  methodologyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  methodologyCard: { width: (MAIN_CONTENT_WIDTH - 10) / 2, backgroundColor: WHITE, borderRadius: 8, padding: 12, marginBottom: 10 },
  methodologyCardTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 4 },
  methodologyBullet: { flexDirection: "row", gap: 6, marginBottom: 8 },
  methodologyBulletDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD, marginTop: 4 },
  methodologyBulletLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 2 },
  methodologyBulletText: { fontSize: 7, color: MUTED, lineHeight: 1.55 },

  notesBlock: { backgroundColor: WHITE, borderRadius: 8, padding: 13, marginBottom: 10 },
  notesLabel: { fontSize: 8, color: GRAY, letterSpacing: 1, marginBottom: 6 },
  notesText: { fontSize: 9, color: INK, lineHeight: 1.5 },

  footer: {
    position: "absolute",
    bottom: 18,
    left: SIDEBAR_WIDTH + PAGE_PADDING,
    right: PAGE_PADDING,
    borderTopWidth: 1,
    borderTopColor: GOLD,
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 8, color: GRAY },
  footerPage: { fontSize: 8, fontFamily: "Helvetica-Bold", color: INK },

  // Deckblatt: helle Fläche wie die übrigen Berichtsseiten statt einer
  // vollflächig dunklen Startseite (Druckfreundlichkeit — eine ganzseitige
  // dunkle Fläche verbraucht beim Drucken unnötig viel Toner/Tinte). Gold
  // bleibt als Markenakzent (Regeln, Rahmen), Text wird dunkel auf hell.
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: PAGE_BG,
    color: INK,
    paddingHorizontal: 56,
    paddingVertical: 64,
    justifyContent: "space-between",
  },
  coverLogo: { width: 84, height: 44, objectFit: "contain", marginBottom: 40 },
  coverKicker: { fontSize: 9, color: GOLD_DARK, letterSpacing: 2.5, marginBottom: 10 },
  coverTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 18 },
  coverRule: { borderBottomWidth: 1, borderBottomColor: GOLD, marginBottom: 18 },
  coverCustomer: { fontSize: 15, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 22 },
  coverProductList: { gap: 10 },
  coverProductRow: { borderLeftWidth: 2, borderLeftColor: GOLD, paddingLeft: 10 },
  coverProductName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: INK },
  coverProductMeta: { fontSize: 8, color: GRAY, marginTop: 1 },
  coverFooterLine: { fontSize: 8.5, color: "#374151", marginTop: 4, marginBottom: 4 },
  coverFooterTagline: { fontSize: 8, color: GOLD_DARK, letterSpacing: 1.5, marginBottom: 6 },
  coverFooterUrl: { fontSize: 7, color: GRAY },

  // Inhaltsverzeichnis: helle Seite wie die übrigen Inhaltsseiten, damit
  // sie sich als Navigationshilfe zum Bericht zugehörig, aber nicht wie
  // eine weitere Produktseite anfühlt.
  tocPage: { fontFamily: "Helvetica", color: INK, fontSize: 9, backgroundColor: PAGE_BG, paddingHorizontal: 56, paddingVertical: 56 },
  tocLogo: { width: 56, height: 29, objectFit: "contain", marginBottom: 24 },
  tocTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 10 },
  tocRule: { borderBottomWidth: 1, borderBottomColor: GOLD, marginBottom: 18 },
  tocLinkReset: { textDecoration: "none", color: INK },
  tocEntryRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 6 },
  tocEntryNumber: { fontSize: 10, fontFamily: "Helvetica-Bold", color: GOLD_DARK },
  tocEntryTitle: { fontSize: 12.5, fontFamily: "Helvetica-Bold", color: INK },
  tocSubEntryRow: { paddingLeft: 26, paddingVertical: 2.5, borderBottomWidth: 1, borderBottomColor: ROW_DIVIDER },
  tocSubEntryTitle: { fontSize: 9, color: "#374151" },
});

function Dot({ status }: { status: MetricStatus }) {
  return <View style={{ ...styles.dot, backgroundColor: STATUS_COLORS[status].dot }} />;
}

function StatusPill({ status, text }: { status: MetricStatus; text: string }) {
  const c = STATUS_COLORS[status];
  return (
    <View style={{ ...styles.pill, backgroundColor: c.bg }}>
      <Text style={{ ...styles.pillText, color: c.text }}>{text}</Text>
    </View>
  );
}

function TrendArrow({ direction, color }: { direction: "up" | "down"; color: string }) {
  const d = direction === "up" ? "M0 6 L4 0 L8 6 Z" : "M0 0 L4 6 L8 0 Z";
  return (
    <Svg width={7} height={5} viewBox="0 0 8 6">
      <SvgPath d={d} fill={color} />
    </Svg>
  );
}

// Ringdiagramm für den Storage-Pool-Füllgrad — zwei konzentrische Kreise
// (Hintergrundring + Fortschrittsring), konzeptionell wie der SVG-Donut in
// der Web-Dashboard-Ansicht (ReportDashboardView.tsx), aber mit react-pdfs
// Svg/Circle-Primitiven, die kein strokeDashoffset kennen (siehe unten).
function Donut({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = 26;
  const circumference = 2 * Math.PI * r;
  // react-pdf's SVG-Subset kennt strokeDashoffset nicht (nur
  // strokeDasharray) — der Fortschrittsbogen wird stattdessen direkt als
  // Bogenlänge codiert: "<Bogenlänge> <Rest>", der Kreis startet dank der
  // rotate(-90)-Transformation oben (12-Uhr-Position) ohne Offset an der
  // richtigen Stelle.
  const arcLength = circumference * (clamped / 100);
  return (
    <View style={{ width: 76, height: 76, alignItems: "center", justifyContent: "center", position: "relative" }}>
      <Svg width={76} height={76} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={r} fill="none" stroke="#E5E7EB" strokeWidth={7} />
        <Circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke={GOLD}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform="rotate(-90 32 32)"
        />
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: INK }}>
          {clamped.toLocaleString("de-DE", { maximumFractionDigits: 1 })}%
        </Text>
        <Text style={{ fontSize: 6, color: GRAY, marginTop: 1 }}>{label}</Text>
      </View>
    </View>
  );
}

const TREND_COPY = {
  de: {
    title: "Kapazitätsverlauf",
    sub: "Füllgrad Storage Pool über den Berichtszeitraum",
    daysTo: (d: number, pct: number) => `> ${d} Tage bis ${pct} %`,
    growthLabel: "Ø Wachstum",
  },
  en: {
    title: "Capacity Trend",
    sub: "Storage pool fill level over the reporting period",
    daysTo: (d: number, pct: number) => `> ${d} days to reach ${pct}%`,
    growthLabel: "Avg. growth",
  },
};

function formatGrowthRate(perDay: number, locale: "de" | "en") {
  const sign = perDay >= 0 ? "+" : "";
  return `${sign}${perDay.toLocaleString(locale === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 2 })} %/${locale === "de" ? "Tag" : "day"}`;
}

function formatTrendDate(iso: string, locale: "de" | "en") {
  return new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-US", { day: "2-digit", month: "2-digit", timeZone: "Europe/Vienna" }).format(new Date(iso));
}

// Statische Entsprechung von CapacityTrendChart.tsx (Web-Ansicht) — ohne
// Hover/Tooltip, da ein PDF nicht interaktiv ist, aber mit identischer
// fixer 0–100%-Y-Achse, damit Kurven über mehrere Berichte hinweg optisch
// vergleichbar bleiben. Achsenbeschriftungen werden bewusst NICHT als
// <Text> innerhalb von <Svg> platziert (deren fontSize-Handling in
// react-pdfs SVG-Subset ist nicht zuverlässig dokumentiert), sondern wie
// beim Donut oben als absolut positionierter Overlay über der Grafik.
function CapacityTrendCard({ points, locale }: { points: { recordedAt: string; value: number }[]; locale: "de" | "en" }) {
  if (points.length < 2) return null;
  const t = TREND_COPY[locale];
  const W = MAIN_CONTENT_WIDTH - 2 * TREND_CARD_PADDING;
  const H = 88;
  const PAD = { top: 6, right: 4, bottom: 15, left: 20 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const coords = points.map((p, i) => ({
    x: PAD.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW),
    y: PAD.top + plotH * (1 - Math.max(0, Math.min(100, p.value)) / 100),
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${PAD.top + plotH} L ${coords[0].x.toFixed(2)} ${PAD.top + plotH} Z`;
  const last = coords[coords.length - 1];

  const days80 = daysToThreshold(points, 80);
  const days100 = daysToThreshold(points, 100);
  const growth = trendGrowthPerDay(points);

  return (
    <View style={styles.trendCard} wrap={false}>
      <Text style={styles.trendTitle}>{t.title}</Text>
      <Text style={styles.trendSub}>{t.sub}</Text>
      {(days80 !== null || days100 !== null || growth !== null) && (
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
          {days80 !== null && <Text style={styles.trendForecast}>{t.daysTo(days80, 80)}</Text>}
          {days100 !== null && <Text style={styles.trendForecast}>{t.daysTo(days100, 100)}</Text>}
          {growth !== null && (
            <Text style={styles.trendForecast}>
              {t.growthLabel}: {formatGrowthRate(growth, locale)}
            </Text>
          )}
        </View>
      )}
      <View style={{ width: W, height: H, position: "relative" }}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[0, 50, 100].map((g) => {
            const y = PAD.top + plotH * (1 - g / 100);
            return <Line key={g} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />;
          })}
          <SvgPath d={areaPath} fill={GOLD} opacity={0.12} />
          <SvgPath d={linePath} fill="none" stroke={GOLD} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <Circle cx={last.x} cy={last.y} r={2.6} fill={GOLD} />
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
          {[0, 50, 100].map((g) => {
            const y = PAD.top + plotH * (1 - g / 100);
            return (
              <Text key={g} style={{ position: "absolute", top: y - 3, left: 0, fontSize: 5.5, color: GRAY }}>
                {g}%
              </Text>
            );
          })}
          <Text style={{ position: "absolute", bottom: 0, left: PAD.left, fontSize: 6, color: GRAY }}>
            {formatTrendDate(points[0].recordedAt, locale)}
          </Text>
          <Text style={{ position: "absolute", bottom: 0, right: PAD.right, fontSize: 6, color: GRAY }}>
            {formatTrendDate(points[points.length - 1].recordedAt, locale)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const DERIVED_LABEL = { de: "berechnet", en: "calc." };
const SOURCE_LABEL: Record<"de" | "en", Record<NonNullable<QuarterSummaryEntry["source"]>, string>> = {
  de: { databackup: "DataBackup" },
  en: { databackup: "DataBackup" },
};

// Kombiniert die "berechnet"- und Quellen-Kennzeichnung zu einem Suffix —
// z. B. "berechnet · DataBackup" — damit klar ist, welcher Wert eine
// Berechnung ist UND/ODER aus der separaten DataBackup-Software statt vom
// Storage-Gerät selbst kommt (bei OceanProtect zwei getrennte APIs/GUIs).
function metricTags(entry: Pick<QuarterSummaryEntry, "derived" | "source">, locale: "de" | "en"): string | null {
  const tags = [entry.derived && DERIVED_LABEL[locale], entry.source && SOURCE_LABEL[locale][entry.source]].filter(
    (t): t is string => Boolean(t)
  );
  return tags.length > 0 ? tags.join(" · ") : null;
}

function HeadlineCard({ entry, locale }: { entry: QuarterSummaryEntry; locale: "de" | "en" }) {
  const status = deriveStatus(entry);
  const label = entry.shortLabel?.[locale] ?? entry.label[locale];
  const tags = metricTags(entry, locale);
  return (
    <View style={{ ...styles.headlineCard, borderLeftColor: STATUS_COLORS[status].dot }} wrap={false}>
      <View style={styles.headlineTopRow}>
        <Dot status={status} />
        <Text style={styles.headlineLabel}>{label}</Text>
      </View>
      <Text style={styles.headlineValue}>{formatValue(entry, locale)}</Text>
      {/* Tag UNTER statt NEBEN der Pille: bei 4 Karten pro Zeile (schmalere
          Spalte seit der Sidebar) reicht die Breite nicht für Pille +
          "berechnet · DataBackup" nebeneinander — das lief ineinander. */}
      <View>
        <StatusPill status={status} text={headlinePillText(entry, status, locale)} />
        {tags && <Text style={{ ...styles.derivedTag, marginTop: 3 }}>{tags}</Text>}
      </View>
    </View>
  );
}

// Die drei "primären" Kennzahlen (Backup-Erfolg, RPO-Einhaltung,
// Verfügbarkeit) — bewusst größer als HeadlineCard, damit sie sich klar von
// den übrigen (sekundären) Kennzahlkarten absetzen. Bei OceanStor (keine
// Backup-Software-Ebene) bleiben nur die vorhandenen Einträge übrig
// (i. d. R. nur Verfügbarkeit) statt Lücken zu zeigen.
export const PRIMARY_KPI_KEYS = ["backup_success_rate", "rpo_compliance_rate", "system_availability"];

function PrimaryKpiCard({ entry, locale }: { entry: QuarterSummaryEntry; locale: "de" | "en" }) {
  const status = deriveStatus(entry);
  const label = entry.shortLabel?.[locale] ?? entry.label[locale];
  const trend = trendInfo(entry);
  return (
    <View style={{ ...styles.primaryKpiCard, borderLeftColor: STATUS_COLORS[status].dot }} wrap={false}>
      <View style={styles.headlineTopRow}>
        <Dot status={status} />
        <Text style={styles.primaryKpiLabel}>{label}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
        <Text style={styles.primaryKpiValue}>{formatValue(entry, locale)}</Text>
        {trend && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 9 }}>
            <TrendArrow direction={trend.direction} color={trend.color} />
            <Text style={{ fontSize: 7, color: trend.color }}>{trend.label}</Text>
          </View>
        )}
      </View>
      <StatusPill status={status} text={headlinePillText(entry, status, locale)} />
    </View>
  );
}

function CompactListRow({ entry, locale }: { entry: QuarterSummaryEntry; locale: "de" | "en" }) {
  const status = deriveStatus(entry);
  const pillLabel = LIST_PILL_LABEL[locale][status];
  const trend = trendInfo(entry);
  const tags = metricTags(entry, locale);
  return (
    <View style={styles.listRow} wrap={false}>
      <View style={styles.listRowLeft}>
        <Dot status={status} />
        <Text style={styles.listRowLabel}>
          {entry.label[locale]}
          {tags && <Text style={styles.derivedTag}> · {tags}</Text>}
        </Text>
      </View>
      <View style={styles.listRowRight}>
        {trend && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <TrendArrow direction={trend.direction} color={trend.color} />
            <Text style={{ ...styles.listRowTrend, color: trend.color }}>{trend.label}</Text>
          </View>
        )}
        <Text style={styles.listRowValue}>{formatValue(entry, locale)}</Text>
        {pillLabel && <StatusPill status={status} text={pillLabel} />}
      </View>
    </View>
  );
}

function ListCard({ title, sub, entries, locale }: { title: string; sub?: string; entries: QuarterSummaryEntry[]; locale: "de" | "en" }) {
  if (entries.length === 0) return null;
  return (
    // Kein wrap={false} auf dem Container: die Zeilenzahl wächst mit jeder
    // neuen Metrik im Abschnitt (Infrastrukturstatus/Betrieb sind inzwischen
    // 10+ Zeilen) — ein starr unteilbarer Block kann dann größer als eine
    // Seite werden. Stattdessen bricht nur jede einzelne Zeile nicht um
    // (CompactListRow, siehe unten).
    <View style={styles.listCard}>
      <Text style={styles.listCardTitle}>{title}</Text>
      {sub && <Text style={styles.listCardSub}>{sub}</Text>}
      {entries.map((e) => (
        <CompactListRow key={e.key} entry={e} locale={locale} />
      ))}
    </View>
  );
}

function UsageBarCard({ entry, locale }: { entry: QuarterSummaryEntry; locale: "de" | "en" }) {
  const pct = Math.max(0, Math.min(100, entry.value));
  // Nur einfärben, wenn die Kennzahl tatsächlich bewertet wird (trendGood
  // gesetzt) — sonst neutral in Gold, ohne eine Wertung vorzutäuschen.
  const status = entry.trendGood ? deriveStatus(entry) : "neutral";
  const fillColor = entry.trendGood ? STATUS_COLORS[status].dot : GOLD;
  return (
    <View style={styles.barCard} wrap={false}>
      {/* shortLabel statt label: die vollen Metriknamen ("Controller-CPU-
          Auslastung (Ø aller Controller)") brechen in dieser schmalen Karte
          auf 2 Zeilen um und überlappen dann mit dem Wert darunter. */}
      <Text style={styles.barCardTitle}>{entry.shortLabel?.[locale] ?? entry.label[locale]}</Text>
      <Text style={styles.barValue}>{formatValue(entry, locale)}</Text>
      <View style={styles.barTrack}>
        <View style={{ ...styles.barFill, width: `${pct}%`, backgroundColor: fillColor }} />
      </View>
    </View>
  );
}

const ALARM_SEVERITY_TO_STATUS: Record<AlarmSample["severity"], MetricStatus> = {
  critical: "critical",
  major: "warning",
  warning: "warning",
};

const ALARM_SEVERITY_LABEL: Record<"de" | "en", Record<AlarmSample["severity"], string>> = {
  de: { critical: "Kritisch", major: "Schwerwiegend", warning: "Warnung" },
  en: { critical: "Critical", major: "Major", warning: "Warning" },
};

const ALARM_CARD_COPY = {
  de: {
    title: "Alarme im Detail",
    sub: "Ereignisse aus dem Ereignisprotokoll des Geräts, die im Berichtszeitraum aktiv waren.",
    resolvedOn: (date: string) => `Behoben am ${date}`,
    acknowledgedOn: (date: string) => `Kontrolliert bestätigt am ${date}`,
    commentPrefix: "Kommentar: ",
    active: "Aktiv",
  },
  en: {
    title: "Alarms in Detail",
    sub: "Events from the device's event log that were active during the reporting period.",
    resolvedOn: (date: string) => `Resolved on ${date}`,
    acknowledgedOn: (date: string) => `Reviewed and confirmed on ${date}`,
    commentPrefix: "Comment: ",
    active: "Active",
  },
};

const MAX_ALARM_SAMPLES_SHOWN = 8;

const HTML_NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// Huaweis Alarm-Klartext (description/suggestion/name) kommt HTML-kodiert
// zurück (z. B. "&#40;" statt "(", "&gt;" statt ">") — vermutlich weil der
// Text ursprünglich für die Web-GUI gedacht ist. react-pdf's <Text> rendert
// das wörtlich statt es zu interpretieren, daher hier von Hand dekodieren.
function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return HTML_NAMED_ENTITIES[entity] ?? match;
  });
}

function AlarmCard({ alarms, locale }: { alarms: AlarmSample[]; locale: "de" | "en" }) {
  const t = ALARM_CARD_COPY[locale];
  const shown = alarms.slice(0, MAX_ALARM_SAMPLES_SHOWN);
  const overflow = alarms.length - shown.length;
  return (
    <View style={styles.alarmCard}>
      <Text style={styles.listCardTitle}>{t.title}</Text>
      <Text style={styles.listCardSub}>{t.sub}</Text>
      {shown.map((alarm, i) => (
        <View key={i} wrap={false} style={{ ...styles.alarmRow, opacity: alarm.status !== "active" ? 0.55 : 1 }}>
          <View style={styles.alarmTopRow}>
            <View style={styles.alarmTitleGroup}>
              <Dot status={alarm.status !== "active" ? "good" : ALARM_SEVERITY_TO_STATUS[alarm.severity]} />
              <Text style={styles.alarmName}>{decodeHtmlEntities(alarm.name)}</Text>
              {alarm.occurrenceCount !== undefined && alarm.occurrenceCount > 1 && (
                <Text style={styles.occurrenceTag}>
                  {locale === "de" ? `${alarm.occurrenceCount}× erkannt` : `detected ${alarm.occurrenceCount}×`}
                </Text>
              )}
              {alarm.status === "resolved" && alarm.resolvedAt ? (
                <StatusPill status="good" text={t.resolvedOn(formatDateTime(alarm.resolvedAt, locale))} />
              ) : alarm.status === "acknowledged" && alarm.acknowledgedAt ? (
                <StatusPill status="good" text={t.acknowledgedOn(formatDateTime(alarm.acknowledgedAt, locale))} />
              ) : (
                <StatusPill status={ALARM_SEVERITY_TO_STATUS[alarm.severity]} text={ALARM_SEVERITY_LABEL[locale][alarm.severity]} />
              )}
            </View>
            {alarm.time && <Text style={styles.alarmTime}>{formatDateTime(alarm.time, locale)}</Text>}
          </View>
          <Text style={styles.alarmDesc}>{decodeHtmlEntities(alarm.description)}</Text>
          {alarm.suggestion && (
            <Text style={styles.alarmSuggestion}>
              {(locale === "de" ? "Empfehlung: " : "Suggestion: ") + decodeHtmlEntities(alarm.suggestion)}
            </Text>
          )}
          {alarm.status === "acknowledged" && alarm.acknowledgedComment && (
            <Text style={styles.alarmSuggestion}>{t.commentPrefix + decodeHtmlEntities(alarm.acknowledgedComment)}</Text>
          )}
        </View>
      ))}
      {overflow > 0 && (
        <Text style={{ ...styles.methodologyLine, marginTop: 6 }}>
          {locale === "de" ? `+ ${overflow} weitere Alarme (siehe Kennzahl oben für die Gesamtzahl).` : `+ ${overflow} more alarms (see the KPI above for the total count).`}
        </Text>
      )}
    </View>
  );
}

const MAX_COMPONENT_FAULTS_SHOWN = 20;

const TABLE_COLUMN_COPY = {
  de: { category: "Kategorie", component: "Komponente", description: "Beschreibung", status: "Status" },
  en: { category: "Category", component: "Component", description: "Description", status: "Status" },
};

function ComponentFaultsCard({ faults, locale }: { faults: ComponentFault[]; locale: "de" | "en" }) {
  const t = COPY[locale];
  const tc = TABLE_COLUMN_COPY[locale];
  const shown = faults.slice(0, MAX_COMPONENT_FAULTS_SHOWN);
  const overflow = faults.length - shown.length;
  return (
    <View style={styles.tableCardBlock}>
      <Text style={styles.listCardTitle}>{t.detailsTitle}</Text>
      <Text style={styles.listCardSub}>{t.detailsSub}</Text>
      <View style={{ ...styles.tableHeaderRow, marginTop: 4 }}>
        <Text style={{ ...styles.tableHeaderCell, width: 90 }}>{tc.category}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 110 }}>{tc.component}</Text>
        <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>{tc.description}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 90, textAlign: "right" }}>{tc.status}</Text>
      </View>
      {shown.map((fault, i) => (
        <View key={i} wrap={false} style={{ ...styles.tableRow, alignItems: "flex-start", opacity: fault.status !== "active" ? 0.55 : 1 }}>
          <Text style={{ width: 90, color: MUTED, fontSize: 7, paddingTop: 1 }}>{fault.category}</Text>
          <Text style={{ width: 110, fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, paddingRight: 6 }}>{normalizeComponentLabel(fault.id)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: "#374151" }}>{fault.description}</Text>
            {fault.occurrenceCount !== undefined && fault.occurrenceCount > 1 && (
              <Text style={styles.occurrenceTag}>{locale === "de" ? `${fault.occurrenceCount}× erkannt` : `detected ${fault.occurrenceCount}×`}</Text>
            )}
            {fault.status === "acknowledged" && fault.acknowledgedComment && (
              <Text style={styles.alarmSuggestion}>{ALARM_CARD_COPY[locale].commentPrefix + fault.acknowledgedComment}</Text>
            )}
          </View>
          <Text style={{ width: 90, fontSize: 6.5, color: fault.status === "resolved" ? STATUS_COLORS.good.dot : STATUS_COLORS.warning.dot, textAlign: "right" }}>
            {fault.status === "resolved" && fault.resolvedAt
              ? (locale === "de" ? `Behoben ${formatDateTime(fault.resolvedAt, locale)}` : `Resolved ${formatDateTime(fault.resolvedAt, locale)}`)
              : fault.status === "acknowledged" && fault.acknowledgedAt
              ? (locale === "de" ? `Bestätigt ${formatDateTime(fault.acknowledgedAt, locale)}` : `Confirmed ${formatDateTime(fault.acknowledgedAt, locale)}`)
              : locale === "de" ? "Aktiv" : "Active"}
          </Text>
        </View>
      ))}
      {overflow > 0 && (
        <Text style={{ ...styles.methodologyLine, marginTop: 6 }}>
          {locale === "de" ? `+ ${overflow} weitere Einträge.` : `+ ${overflow} more entries.`}
        </Text>
      )}
    </View>
  );
}

// Nach der Gruppierung großer Kategorien (siehe groupSuccessfulChecks) bleibt
// die Zeilenzahl auch bei sehr großen Anlagen überschaubar — der Deckel ist
// nur noch ein Sicherheitsnetz für den unrealistischen Fall vieler
// unterschiedlicher, mittelgroßer Kategorien.
const MAX_SUCCESSFUL_CHECKS_SHOWN = 150;

// Letzte Sektion des Berichts: JEDE erfolgreich geprüfte Komponente (nicht
// nur die auffälligen) mit ihrem tatsächlichen REST-API-Ergebnis als Beleg —
// Gegenstück zu ComponentFaultsCard, das nur die Auffälligkeiten zeigt.
// Kategorien mit vielen gleichartigen Einträgen (z. B. 232 Festplatten bei
// einer großen Anlage) würden das Zeilenlimit allein aufbrauchen, bevor
// andere Kategorien (Storage Pools, Dateisysteme, Gehäuse, …) überhaupt an
// die Reihe kommen — genau deshalb hatte der Bericht "fehlende" Kategorien,
// obwohl sie erhoben wurden. Kategorien über dem Schwellenwert werden daher
// zu einer einzigen Zusammenfassungszeile zusammengefasst, kleinere
// Kategorien bleiben einzeln sichtbar (z. B. Controller A/B namentlich).
const GROUP_CATEGORY_THRESHOLD = 12;

function groupSuccessfulChecksRows(items: ComponentCheck[], locale: "de" | "en") {
  const byCategory = new Map<string, ComponentCheck[]>();
  for (const c of items) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }
  const rows: { category: string; id: string; description: string }[] = [];
  for (const [category, catItems] of Array.from(byCategory.entries())) {
    if (catItems.length > GROUP_CATEGORY_THRESHOLD) {
      rows.push({
        category,
        id: locale === "de" ? `${catItems.length} geprüft` : `${catItems.length} checked`,
        description: locale === "de" ? "Alle Normal" : "All Normal",
      });
    } else {
      for (const item of catItems) rows.push({ category: item.category, id: normalizeComponentLabel(item.id), description: item.description });
    }
  }
  return rows;
}

interface ChecksSection {
  heading: string | null;
  rows: { category: string; id: string; description: string }[];
}

// Viele Komponenten (Netzteil, Lüfter, Festplatte, …) sind physisch in einem
// Gehäuse verbaut — eine rein nach Kategorie sortierte Liste zeigt das nicht,
// obwohl z. B. "PSU0" ohne Kontext, WELCHES Gehäuse gemeint ist, bei mehreren
// Gehäusen (Controller-Enclosure + Disk-Enclosures) mehrdeutig ist (beide
// melden eigene PSU0/FAN0 usw.). Komponenten mit bekannter Gehäusezuordnung
// (ComponentCheck.group, vom Collector aus dem LOCATION-Feld abgeleitet)
// werden daher zuerst je Gehäuse gruppiert; Komponenten ohne sinnvolle
// Gehäusezuordnung (Lizenz, Zertifikat, Storage Pool, …) bleiben als eigener
// Abschnitt am Ende — identisch zur bisherigen flachen Darstellung, falls
// gar keine Gehäusezuordnung vorliegt (ältere, vor Einführung dieses Felds
// erfasste Daten).
function groupSuccessfulChecks(ok: ComponentCheck[], locale: "de" | "en"): ChecksSection[] {
  const byGroup = new Map<string, ComponentCheck[]>();
  const ungrouped: ComponentCheck[] = [];
  for (const c of ok) {
    if (c.group) {
      if (!byGroup.has(c.group)) byGroup.set(c.group, []);
      byGroup.get(c.group)!.push(c);
    } else {
      ungrouped.push(c);
    }
  }

  const sections: ChecksSection[] = Array.from(byGroup.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, items]) => ({
      heading: (locale === "de" ? "Gehäuse " : "Enclosure ") + normalizeComponentLabel(group),
      rows: groupSuccessfulChecksRows(items, locale),
    }));

  if (ungrouped.length > 0) {
    sections.push({
      // Nur eine Überschrift, wenn es auch gruppierte Abschnitte gibt — bei
      // Produkten/Daten ganz ohne Gehäusezuordnung (z. B. noch nicht
      // aktualisierter Collector) bleibt die Darstellung dann exakt die
      // bisherige flache Liste ohne zusätzliche Überschrift.
      heading: sections.length > 0 ? (locale === "de" ? "Weitere Komponenten" : "Other Components") : null,
      rows: groupSuccessfulChecksRows(ungrouped, locale),
    });
  }
  return sections;
}

function SuccessfulChecksCard({ checks, locale }: { checks: ComponentCheck[]; locale: "de" | "en" }) {
  const t = COPY[locale];
  const tc = TABLE_COLUMN_COPY[locale];
  const ok = checks.filter((c) => c.ok);
  if (ok.length === 0) return null;
  const sections = groupSuccessfulChecks(ok, locale);
  const totalRows = sections.reduce((n, s) => n + s.rows.length, 0);
  const overflow = Math.max(0, totalRows - MAX_SUCCESSFUL_CHECKS_SHOWN);

  // Zeilenlimit gilt über alle Abschnitte hinweg (nicht pro Gehäuse) — bei
  // Erreichen werden die letzten Abschnitte gekappt, der Rest zählt in die
  // "+ N weitere"-Fußzeile.
  let remaining = MAX_SUCCESSFUL_CHECKS_SHOWN;
  const shownSections = sections
    .map((s) => {
      if (remaining <= 0) return null;
      const rows = s.rows.slice(0, remaining);
      remaining -= rows.length;
      return { ...s, rows };
    })
    .filter((s): s is ChecksSection => s !== null && s.rows.length > 0);

  return (
    // Kein wrap={false} auf dem Container: viele Zeilen sprengen als starr
    // unteilbarer Block leicht eine Seite (siehe dieselbe Korrektur bei
    // AlarmCard/ComponentFaultsCard/ListCard).
    <View style={styles.tableCardBlock}>
      <Text style={styles.listCardTitle}>{t.successTitle}</Text>
      <Text style={styles.listCardSub}>{t.successSub}</Text>
      {shownSections.map((section, si) => (
        <View key={si}>
          {section.heading && <Text style={{ ...styles.checksGroupHeading, marginTop: si === 0 ? 4 : 10 }}>{section.heading}</Text>}
          <View style={{ ...styles.tableHeaderRow, marginTop: section.heading ? 3 : 4 }}>
            <Text style={{ ...styles.tableHeaderCell, width: 90 }}>{tc.category}</Text>
            <Text style={{ ...styles.tableHeaderCell, width: 110 }}>{tc.component}</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>{tc.description}</Text>
            <Text style={{ ...styles.tableHeaderCell, width: 40, textAlign: "right" }}>{tc.status}</Text>
          </View>
          {section.rows.map((check, i) => (
            <View key={i} wrap={false} style={{ ...styles.tableRow, alignItems: "flex-start" }}>
              <Text style={{ width: 90, color: MUTED, fontSize: 7, paddingTop: 1 }}>{check.category}</Text>
              <Text style={{ width: 110, fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, paddingRight: 6 }}>{check.id}</Text>
              <Text style={{ flex: 1, fontSize: 8, color: "#374151" }}>{check.description}</Text>
              <Text style={{ width: 40, fontSize: 6.5, color: STATUS_COLORS.good.dot, textAlign: "right" }}>OK</Text>
            </View>
          ))}
        </View>
      ))}
      {overflow > 0 && (
        <Text style={{ ...styles.methodologyLine, marginTop: 6 }}>
          {locale === "de" ? `+ ${overflow} weitere Einträge.` : `+ ${overflow} more entries.`}
        </Text>
      )}
    </View>
  );
}

const VOLUME_OVERVIEW_COPY = {
  de: {
    title: "Volumes",
    sub: "Alle erfassten Volumes mit Zustand, SVM/Aggregat-Zugehörigkeit und Kapazität.",
    name: "Volume",
    svm: "SVM",
    aggregate: "Aggregat",
    state: "Zustand",
    used: "Genutzt",
    total: "Gesamt",
  },
  en: {
    title: "Volumes",
    sub: "All discovered volumes with state, SVM/aggregate membership, and capacity.",
    name: "Volume",
    svm: "SVM",
    aggregate: "Aggregate",
    state: "State",
    used: "Used",
    total: "Total",
  },
};

// Zeilenlimit wie bei den anderen großen Listenkarten (ComponentFaultsCard/
// SuccessfulChecksCard) — bei sehr vielen Volumes bleibt die Tabelle
// überschaubar, die größten Volumes zuerst (für den Admin i. d. R.
// relevanter als die kleinsten).
const MAX_VOLUMES_SHOWN = 40;

function VolumeOverviewCard({ volumes, locale }: { volumes: VolumeOverviewEntry[]; locale: "de" | "en" }) {
  const t = VOLUME_OVERVIEW_COPY[locale];
  const n = (v: number) => v.toLocaleString(locale === "de" ? "de-DE" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const sorted = [...volumes].sort((a, b) => b.totalTB - a.totalTB);
  const shown = sorted.slice(0, MAX_VOLUMES_SHOWN);
  const overflow = sorted.length - shown.length;
  return (
    // Kein wrap={false} auf dem Container: bis zu MAX_VOLUMES_SHOWN Zeilen
    // sprengen als starr unteilbarer Block leicht eine Seite (siehe dieselbe
    // Korrektur bei AlarmCard/ComponentFaultsCard/SuccessfulChecksCard).
    <View style={styles.tableCardBlock}>
      <Text style={styles.listCardTitle}>{t.title}</Text>
      <Text style={styles.listCardSub}>{t.sub}</Text>
      <View style={{ ...styles.tableHeaderRow, marginTop: 4 }}>
        <Text style={{ ...styles.tableHeaderCell, width: 90 }}>{t.name}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 60 }}>{t.svm}</Text>
        <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>{t.aggregate}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 45 }}>{t.state}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 55, textAlign: "right" }}>{t.used}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 55, textAlign: "right" }}>{t.total}</Text>
      </View>
      {shown.map((v, i) => {
        const ok = v.state === "online";
        return (
          <View key={v.name + i} wrap={false} style={{ ...styles.tableRow, alignItems: "flex-start" }}>
            <Text style={{ width: 90, fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, paddingRight: 6 }}>{v.name}</Text>
            <Text style={{ width: 60, fontSize: 7.5, color: GRAY, paddingRight: 4 }}>{v.svm}</Text>
            <Text style={{ flex: 1, fontSize: 7.5, color: GRAY, paddingRight: 6 }}>{normalizeComponentLabel(v.aggregate)}</Text>
            <Text style={{ width: 45, fontSize: 7.5, color: ok ? STATUS_COLORS.good.dot : STATUS_COLORS.critical.dot }}>{v.state}</Text>
            <Text style={{ width: 55, fontSize: 8, color: INK, textAlign: "right" }}>{n(v.usedTB)} TB</Text>
            <Text style={{ width: 55, fontSize: 8, color: INK, textAlign: "right" }}>{n(v.totalTB)} TB</Text>
          </View>
        );
      })}
      {overflow > 0 && (
        <Text style={{ ...styles.methodologyLine, marginTop: 6 }}>
          {locale === "de" ? `+ ${overflow} weitere Volumes (nach Größe sortiert).` : `+ ${overflow} more volumes (sorted by size).`}
        </Text>
      )}
    </View>
  );
}

const RESOURCE_BREAKDOWN_COPY = {
  de: { title: "Ressourcen nach Typ", type: "Typ", protectedCol: "Geschützt", unprotectedCol: "Ungeschützt" },
  en: { title: "Resources by Type", type: "Type", protectedCol: "Protected", unprotectedCol: "Unprotected" },
};

function ResourceBreakdownCard({ breakdown, locale }: { breakdown: ResourceBreakdownEntry[]; locale: "de" | "en" }) {
  const t = RESOURCE_BREAKDOWN_COPY[locale];
  const sorted = [...breakdown].sort((a, b) => b.protectedCount + b.unprotectedCount - (a.protectedCount + a.unprotectedCount));
  return (
    <View style={styles.tableCardBlock} wrap={false}>
      <Text style={styles.listCardTitle}>{t.title}</Text>
      <View style={{ ...styles.tableHeaderRow, marginTop: 8 }}>
        <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>{t.type}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 56, textAlign: "right" }}>{t.protectedCol}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 56, textAlign: "right" }}>{t.unprotectedCol}</Text>
      </View>
      {sorted.map((row) => (
        <View key={row.resourceType} style={styles.tableRow}>
          <Text style={styles.tableCellName}>{row.resourceType}</Text>
          <Text style={styles.tableCellNum}>{row.protectedCount.toLocaleString(locale === "de" ? "de-DE" : "en-US")}</Text>
          <Text style={{ ...styles.tableCellNum, color: row.unprotectedCount > 0 ? STATUS_COLORS.warning.dot : INK }}>
            {row.unprotectedCount.toLocaleString(locale === "de" ? "de-DE" : "en-US")}
          </Text>
        </View>
      ))}
    </View>
  );
}

const CAPACITY_BREAKDOWN_COPY = {
  de: {
    title: "Kapazität je Aggregat",
    sub: "Lokale Kapazität je Storage-Pool/Aggregat, inkl. daran angebundenem Cloud-Tier (FabricPool).",
    name: "Aggregat",
    localUsed: "Lokal genutzt",
    localTotal: "Lokal gesamt",
    cloudUsed: "Cloud genutzt",
    cloudTarget: "Cloud-Ziel",
  },
  en: {
    title: "Capacity by Aggregate",
    sub: "Local capacity per storage pool/aggregate, including any attached cloud tier (FabricPool).",
    name: "Aggregate",
    localUsed: "Local Used",
    localTotal: "Local Total",
    cloudUsed: "Cloud Used",
    cloudTarget: "Cloud Target",
  },
};

function CapacityBreakdownCard({ breakdown, locale }: { breakdown: CapacityBreakdownEntry[]; locale: "de" | "en" }) {
  const t = CAPACITY_BREAKDOWN_COPY[locale];
  const hasCloud = breakdown.some((b) => b.cloudUsedTB !== undefined);
  const n = (v: number) => v.toLocaleString(locale === "de" ? "de-DE" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <View style={styles.tableCardBlock} wrap={false}>
      <Text style={styles.listCardTitle}>{t.title}</Text>
      <Text style={styles.listCardSub}>{t.sub}</Text>
      <View style={{ ...styles.tableHeaderRow, marginTop: 4 }}>
        <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>{t.name}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 70, textAlign: "right" }}>{t.localUsed}</Text>
        <Text style={{ ...styles.tableHeaderCell, width: 70, textAlign: "right" }}>{t.localTotal}</Text>
        {hasCloud && (
          <>
            <Text style={{ ...styles.tableHeaderCell, width: 70, textAlign: "right" }}>{t.cloudUsed}</Text>
            <Text style={{ ...styles.tableHeaderCell, width: 90, textAlign: "right" }}>{t.cloudTarget}</Text>
          </>
        )}
      </View>
      {breakdown.map((row, i) => (
        <View key={row.name + i} style={styles.tableRow}>
          <Text style={styles.tableCellName}>{normalizeComponentLabel(row.name)}</Text>
          <Text style={styles.tableCellNum}>{n(row.localUsedTB)} TB</Text>
          <Text style={styles.tableCellNum}>{n(row.localTotalTB)} TB</Text>
          {hasCloud && (
            <>
              <Text style={styles.tableCellNum}>{row.cloudUsedTB !== undefined ? `${n(row.cloudUsedTB)} TB` : "—"}</Text>
              <Text style={{ fontSize: 8, color: GRAY, width: 90, textAlign: "right" }}>{row.cloudTarget ?? "—"}</Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const TOP_FAILURES_COPY = {
  de: { bySlaTitle: "Meiste Fehlschläge: SLA-Richtlinie", byResourceTitle: "Meiste Fehlschläge: Ressource", count: "Fehlschläge" },
  en: { bySlaTitle: "Top Failures: SLA Policy", byResourceTitle: "Top Failures: Resource", count: "Failures" },
};

function TopFailuresList({ title, rows, locale }: { title: string; rows: { name: string; failedCount: number }[]; locale: "de" | "en" }) {
  if (rows.length === 0) return null;
  const t = TOP_FAILURES_COPY[locale];
  return (
    <View style={styles.tableCard} wrap={false}>
      <Text style={styles.listCardTitle}>{title}</Text>
      <View style={{ ...styles.tableHeaderRow, marginTop: 8 }}>
        <Text style={{ ...styles.tableHeaderCell, flex: 1 }} />
        <Text style={{ ...styles.tableHeaderCell, width: 56, textAlign: "right" }}>{t.count}</Text>
      </View>
      {rows.map((row) => (
        <View key={row.name} style={styles.tableRow}>
          <Text style={styles.tableCellName}>{row.name}</Text>
          <Text style={{ ...styles.tableCellNum, color: STATUS_COLORS.warning.dot }}>{row.failedCount}</Text>
        </View>
      ))}
    </View>
  );
}

function TopFailuresCards({ failures, locale }: { failures: TopJobFailures; locale: "de" | "en" }) {
  const t = TOP_FAILURES_COPY[locale];
  if (failures.bySla.length === 0 && failures.byResource.length === 0) return null;
  return (
    <View style={styles.twoColRow}>
      <TopFailuresList title={t.bySlaTitle} rows={failures.bySla} locale={locale} />
      <TopFailuresList title={t.byResourceTitle} rows={failures.byResource} locale={locale} />
    </View>
  );
}

const METHODOLOGY_SECTION_ORDER: ReportSection[] = ["capacity", "availability", "hardware", "security", "operations"];

// Methodik nach Kategorie getrennt (Kapazität/Verfügbarkeit/Hardware/
// Sicherheit/Betrieb) statt einer langen Fließtext-Liste — jede erklärte
// Kennzahl als eigener Bulletpoint in der passenden Kategorie-Karte.
function MethodologySection({ entries, locale }: { entries: QuarterSummaryEntry[]; locale: "de" | "en" }) {
  const methodologyEntries = entries.filter((e) => e.methodology);
  const hasDerived = entries.some((e) => e.derived);
  const hasDataBackup = entries.some((e) => e.source === "databackup");
  if (methodologyEntries.length === 0 && !hasDerived && !hasDataBackup) return null;

  const bySection = new Map<ReportSection, QuarterSummaryEntry[]>();
  for (const e of methodologyEntries) {
    if (!bySection.has(e.section)) bySection.set(e.section, []);
    bySection.get(e.section)!.push(e);
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>{locale === "de" ? "Methodik" : "Methodology"}</Text>
      {(hasDerived || hasDataBackup) && (
        <View wrap={false}>
          {hasDerived && (
            <Text style={styles.methodologyIntro}>
              {locale === "de"
                ? `Mit "${DERIVED_LABEL.de}" markierte Kennzahlen werden aus mehreren Rohwerten des Geräts berechnet (z. B. gemittelt oder als Quote) — kein einzelner, direkt gemeldeter Messwert.`
                : `Metrics marked "${DERIVED_LABEL.en}" are calculated from several raw device readings (e.g. averaged or as a rate) — not a single value reported directly by the device.`}
            </Text>
          )}
          {hasDataBackup && (
            <Text style={styles.methodologyIntro}>
              {locale === "de"
                ? `Mit "DataBackup" markierte Kennzahlen kommen aus der separaten Backup-Software-Oberfläche, nicht aus dem DeviceManager der Storage-Appliance.`
                : `Metrics marked "DataBackup" come from the separate backup software interface, not from the storage appliance's own DeviceManager.`}
            </Text>
          )}
        </View>
      )}
      <View style={styles.methodologyGrid}>
        {METHODOLOGY_SECTION_ORDER.filter((s) => bySection.has(s)).map((section) => (
          <View key={section} style={styles.methodologyCard} wrap={false}>
            <Text style={styles.methodologyCardTitle}>{SECTION_LABELS[section][locale]}</Text>
            {bySection.get(section)!.map((e) => (
              <View key={e.key} style={styles.methodologyBullet}>
                <View style={styles.methodologyBulletDot} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.methodologyBulletLabel}>{e.label[locale]}</Text>
                  <Text style={styles.methodologyBulletText}>{e.methodology![locale]}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// Kapazitätskarte im Mockup-Stil: Donut für den Storage-Pool-Füllgrad links,
// alle übrigen Kapazitäts-Kennzahlen als Kachel-Raster daneben.
function CapacitySection({
  entries,
  locale,
  trend,
}: {
  entries: QuarterSummaryEntry[];
  locale: "de" | "en";
  trend?: { recordedAt: string; value: number }[];
}) {
  if (entries.length === 0) return null;
  const fillEntry = entries.find((e) => e.key === "storage_pool_fill_level");
  const tileEntries = entries.filter((e) => e.key !== "storage_pool_fill_level");
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{SECTION_LABELS.capacity[locale]}</Text>
      <View style={styles.capacityCard}>
        <View style={styles.capacityBody}>
          {fillEntry && <Donut percent={fillEntry.value} label={locale === "de" ? "Pool" : "Pool"} />}
          <View style={styles.capacityTileGrid}>
            {tileEntries.map((e) => (
              <View key={e.key} style={styles.capacityTile}>
                <Text style={styles.capacityTileLabel}>{e.shortLabel?.[locale] ?? e.label[locale]}</Text>
                <Text style={styles.capacityTileValue}>{formatValue(e, locale)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {trend && <CapacityTrendCard points={trend} locale={locale} />}
    </View>
  );
}

const PROTECTION_COPY = {
  de: { title: "Ressourcenschutz", protected: "Geschützt", unprotected: "Ungeschützt", gaugeLabel: "Schutz" },
  en: { title: "Resource Protection", protected: "Protected", unprotected: "Unprotected", gaugeLabel: "Protection" },
};

// Analog zu CapacitySection, aber für den Ressourcenschutz-Anteil
// (resource_protection_rate) — zeigt dieselbe Kennzahl, die im
// DataBackup-Dashboard als "Resource Protection"-Kreisdiagramm mit
// Geschützt-/Ungeschützt-Zahlen darunter erscheint.
function ProtectionSection({ entries, locale }: { entries: QuarterSummaryEntry[]; locale: "de" | "en" }) {
  const rateEntry = entries.find((e) => e.key === "resource_protection_rate");
  if (!rateEntry) return null;
  const t = PROTECTION_COPY[locale];
  const protectedEntry = entries.find((e) => e.key === "resources_protected_count");
  const unprotectedEntry = entries.find((e) => e.key === "resources_unprotected_count");
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{t.title}</Text>
      <View style={styles.capacityCard}>
        <View style={styles.capacityBody}>
          <Donut percent={rateEntry.value} label={t.gaugeLabel} />
          <View style={styles.capacityTileGrid}>
            {protectedEntry && (
              <View style={styles.capacityTile}>
                <Text style={styles.capacityTileLabel}>{t.protected}</Text>
                <Text style={styles.capacityTileValue}>{formatValue(protectedEntry, locale)}</Text>
              </View>
            )}
            {unprotectedEntry && (
              <View style={styles.capacityTile}>
                <Text style={styles.capacityTileLabel}>{t.unprotected}</Text>
                <Text style={styles.capacityTileValue}>{formatValue(unprotectedEntry, locale)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const COPY = {
  de: {
    title: "MANAGED SERVICE REPORT",
    reportLabel: "BERICHT",
    customer: "Kunde",
    product: "Produkt",
    period: "Zeitraum",
    package: "Servicestufe",
    sn: "SN",
    model: "Modell",
    location: "Standort",
    version: "Version",
    overallStatus: "Gesamtstatus",
    createdOn: "Erstellt am",
    page: "Seite",
    headlineTitle: "Wichtigste Kennzahlen",
    infraTitle: "Infrastrukturstatus",
    infraSub: "Auffälligkeiten sind farblich markiert.",
    recTitle: "Nächste Schritte",
    methodologyTitle: "Methodik",
    detailsTitle: "Details zu Auffälligkeiten",
    detailsSub: "Konkrete Komponenten hinter den Kennzahlen > 0 im Infrastrukturstatus.",
    successTitle: "Erfolgreich geprüfte Komponenten",
    successSub: "Referenz: alle Komponenten, die im Infrastrukturstatus als OK gelten, mit dem tatsächlichen Prüfergebnis der REST-API.",
    notes: "Anmerkungen",
    generatedBy: "Erstellt von Ferrion IT Systemhaus GmbH",
  },
  en: {
    title: "MANAGED SERVICE REPORT",
    reportLabel: "REPORT",
    customer: "Customer",
    product: "Product",
    period: "Period",
    package: "Service Tier",
    sn: "SN",
    model: "Model",
    location: "Location",
    version: "Version",
    overallStatus: "Overall Status",
    createdOn: "Generated on",
    page: "Page",
    headlineTitle: "Key Metrics",
    infraTitle: "Infrastructure Status",
    infraSub: "Issues are color-coded.",
    recTitle: "Next Steps",
    methodologyTitle: "Methodology",
    detailsTitle: "Issue Details",
    detailsSub: "Specific components behind the metrics > 0 in the infrastructure status.",
    successTitle: "Successfully Checked Components",
    successSub: "Reference: every component that shows OK in the infrastructure status, with the actual REST API check result.",
    notes: "Notes",
    generatedBy: "Prepared by Ferrion IT Systemhaus GmbH",
  },
};

export interface AlarmSample {
  severity: "critical" | "major" | "warning";
  name: string;
  description: string;
  suggestion?: string;
  time?: string;
  // Aus der Findings-Historie: ob der Alarm zum Erstellzeitpunkt noch aktiv
  // ist, im Berichtszeitraum wieder verschwunden (behoben) ist, oder von
  // einem Admin geprüft und bestätigt wurde ("Kontrolliert geschlossen" —
  // das Gerät meldet ihn weiterhin, ein Admin hat ihn aber akzeptiert).
  status: "active" | "resolved" | "acknowledged";
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedByEmail?: string;
  acknowledgedComment?: string;
  // Wie oft dieselbe Alarm-Identität erneut gemeldet wurde (siehe
  // DeviceFinding.occurrenceCount) — die KPI-Kennzahl oben zählt jede
  // Erkennung pro Collector-Lauf, diese Liste nur einmal pro Alarm; ohne
  // diesen Wert wirkt die Liste kürzer, als die KPI-Zahl vermuten lässt.
  occurrenceCount?: number;
}

export interface ResourceBreakdownEntry {
  resourceType: string;
  protectedCount: number;
  unprotectedCount: number;
}

// Kapazität je Storage-Pool/Aggregat statt nur der Cluster-weiten Summe —
// bei Systemen mit Cloud-Tiering (z. B. NetApp FabricPool) zusätzlich, wie
// viel davon in einen angebundenen Cloud-Speicher ausgelagert ist.
export interface CapacityBreakdownEntry {
  name: string;
  localUsedTB: number;
  localTotalTB: number;
  cloudUsedTB?: number;
  cloudTarget?: string;
}

// Übersicht je Volume (aktuell nur NetApp) — Ergänzung zu ComponentCheck/
// ComponentFault (die nur den Status zeigen): hier zusätzlich SVM, Aggregat
// und Kapazität je Volume, für einen echten Überblick statt nur "OK/Fehler".
export interface VolumeOverviewEntry {
  name: string;
  svm: string;
  aggregate: string;
  state: string;
  usedTB: number;
  totalTB: number;
}

export interface TopJobFailures {
  bySla: { name: string; failedCount: number }[];
  byResource: { name: string; failedCount: number }[];
}

export interface ComponentFault {
  category: string;
  id: string;
  description: string;
  status: "active" | "resolved" | "acknowledged";
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedByEmail?: string;
  acknowledgedComment?: string;
  // Physisches Gehäuse, in dem die Komponente steckt (z. B. "CTE0") — siehe
  // ComponentCheck.group. Wird aktuell nicht bis hierher durchgereicht (der
  // Auffälligkeiten-Abschnitt baut auf der DeviceFinding-Historie auf, nicht
  // direkt auf dem Ingest-Payload), aber schon Teil des Typs, damit eine
  // spätere Erweiterung (siehe SuccessfulChecksCard) keinen Bruch braucht.
  group?: string;
  // Wie oft dieselbe Fehler-Identität erneut gemeldet wurde — siehe
  // AlarmSample.occurrenceCount, derselbe Hintergrund gilt hier.
  occurrenceCount?: number;
}

// JEDE geprüfte Komponente (normal UND fehlerhaft) — anders als
// ComponentFault eine reine Momentaufnahme ohne Historie, Grundlage für den
// abschließenden "erfolgreich geprüft"-Referenzabschnitt.
export interface ComponentCheck {
  category: string;
  id: string;
  description: string;
  ok: boolean;
  // Physisches Gehäuse, in dem die Komponente steckt (z. B. "CTE0" für eine
  // darin verbaute PSU/einen Lüfter) — vom Collector aus dem LOCATION-Feld
  // des Geräts abgeleitet (siehe collector/adapters/shared.js). Fehlt bei
  // Komponenten ohne sinnvolle Gehäusezuordnung (Lizenz, Zertifikat, …) und
  // bei älteren, vor Einführung dieses Felds erfassten Daten — die Anzeige
  // fällt dafür auf die alte flache Liste zurück (siehe groupSuccessfulChecks).
  group?: string;
}

export interface ProductReportData {
  productName: string;
  vendor: string;
  packageLabel?: string;
  deviceSerialNumber?: string;
  deviceModel?: string;
  // Vom Kunden vergebener Systemname (z. B. "hwe-clu1"), der im
  // DeviceManager als Cluster-Bezeichnung erscheint.
  deviceName?: string;
  deviceSoftwareVersion?: string;
  // Bei OceanProtect eine zweite, unabhängige Versionsnummer (Backup-
  // Software, getrennt von der Storage-Firmware in deviceSoftwareVersion).
  dataBackupVersion?: string;
  // Physischer Standort des Geräts (z. B. "Rechenzentrum Nonntal"), von
  // einem Admin manuell gepflegt.
  location?: string;
  entries: QuarterSummaryEntry[];
  // Aktive, unbestätigte kritische Alarme — degradiert den Overall-Status
  // (buildExecutiveSummary) zusätzlich zu den Kennzahl-Schwellwerten, bis
  // ein Admin sie unter .../findings bestätigt.
  unacknowledgedCriticalFindingsCount?: number;
  recentAlarms?: AlarmSample[];
  resourceBreakdown?: ResourceBreakdownEntry[];
  topJobFailures?: TopJobFailures;
  // Details zu den konkreten Komponenten hinter einer Fehler-Kennzahl > 0 im
  // Infrastrukturstatus (welcher Controller, welche Lizenz, …) — als
  // Referenzabschnitt am Ende des Produktblocks gezeigt.
  componentFaults?: ComponentFault[];
  // Jede geprüfte Komponente (auch die normalen) — letzte Sektion des Berichts.
  componentChecks?: ComponentCheck[];
  replicationNote?: string;
  // Rohe Einzelwerte des Storage-Pool-Füllgrads über den Berichtszeitraum
  // (täglich vom Collector gemeldet) — Grundlage für die Kapazitäts-
  // Trendgrafik in der Web-Ansicht. Nur gesetzt, wenn mindestens 2 Punkte
  // vorliegen (sonst gibt es keine Linie zu zeichnen).
  capacityTrend?: { recordedAt: string; value: number }[];
  // Kapazität je Storage-Pool/Aggregat (z. B. NetApp) — siehe
  // CapacityBreakdownEntry.
  capacityBreakdown?: CapacityBreakdownEntry[];
  // Übersicht je Volume (aktuell nur NetApp) — siehe VolumeOverviewEntry.
  volumes?: VolumeOverviewEntry[];
}

export interface ReportDocumentProps {
  locale: "de" | "en";
  customerCompany: string;
  periodLabel: string;
  products: ProductReportData[];
  adminNotes?: string;
  generatedAt: Date;
}

// Eine <Page> pro Produkt (statt eines gemeinsamen `break` innerhalb einer
// einzelnen Page): react-pdf wiederholt `fixed`-Elemente pro <Page> auf
// jeder physischen Seite, die aus deren Inhalt entsteht — bei einem
// kombinierten Bericht braucht aber jedes Produkt seine EIGENE Sidebar
// (eigener Kunde-/Produkt-/Versionsblock), nicht dieselbe wiederholt. Eine
// <Page> pro Produkt löst das sauber und liefert "neues Produkt = neue
// Seite" automatisch mit.
function ProductPage({
  product,
  index,
  locale,
  customerCompany,
  periodLabel,
  generatedAt,
  adminNotes,
}: {
  product: ProductReportData;
  index: number;
  locale: "de" | "en";
  customerCompany: string;
  periodLabel: string;
  generatedAt: Date;
  adminNotes?: string;
}) {
  const t = COPY[locale];
  const { entries } = product;

  const headlineEntries = entries.filter((e) => e.headline);
  const primaryKpiEntries = PRIMARY_KPI_KEYS.map((key) => headlineEntries.find((e) => e.key === key)).filter(
    (e): e is QuarterSummaryEntry => Boolean(e)
  );
  const secondaryKpiEntries = headlineEntries.filter((e) => !PRIMARY_KPI_KEYS.includes(e.key));
  const hardwareFaultEntries = entries.filter((e) => e.section === "hardware" && e.format === "count");
  const usageBarEntries = entries.filter((e) => e.section === "hardware" && e.format === "percent" && e.key !== "system_availability");
  const capacityEntries = entries.filter((e) => e.section === "capacity");
  const securityEntries = entries.filter((e) => e.section === "security");
  const operationsEntries = entries.filter((e) => e.section === "operations");
  const availabilityDetailEntries = entries.filter((e) => e.section === "availability" && !e.headline);

  const unacknowledgedCriticalFindings = product.unacknowledgedCriticalFindingsCount ?? 0;
  const summary = buildExecutiveSummary(entries, locale, unacknowledgedCriticalFindings);
  const recommendations = buildRecommendations(entries, locale);
  const bannerHighlights = buildBannerHighlights(entries, locale);
  const overallStatus: MetricStatus =
    summary.issueCount === 0
      ? "good"
      : entries.some((e) => deriveStatus(e) === "critical") || unacknowledgedCriticalFindings > 0
      ? "critical"
      : "warning";

  return (
    <Page id={`product-${index}`} size="A4" style={styles.page}>
      {/* Nicht `fixed`: soll nur auf der ERSTEN physischen Seite dieses
          Produkts erscheinen, nicht auf jeder Folgeseite bei umfangreichem
          Inhalt — erst das nächste Produkt (neue <Page>) bekommt wieder
          seine eigene Sidebar. `fixed` würde sie (wie zuvor) auf jeder aus
          diesem <Page>-Inhalt entstehenden physischen Seite wiederholen. */}
      <View style={styles.sidebar}>
        <Image style={styles.sidebarLogo} src={LOGO_DATA_URI} />
        <Text style={styles.sidebarReportLabel}>{t.reportLabel}</Text>
        <Text style={styles.sidebarTitle}>{periodLabel}</Text>
        <View style={styles.sidebarRule} />

        <View style={styles.sidebarField}>
          <Text style={styles.sidebarFieldLabel}>{t.customer.toUpperCase()}</Text>
          <Text style={styles.sidebarFieldValue}>{customerCompany}</Text>
        </View>
        <View style={styles.sidebarField}>
          <Text style={styles.sidebarFieldLabel}>{t.product.toUpperCase()}</Text>
          <Text style={styles.sidebarFieldValue}>
            {product.vendor} {product.productName}
          </Text>
        </View>
        {product.deviceName && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>{(locale === "de" ? "Gerätename" : "Device Name").toUpperCase()}</Text>
            <Text style={styles.sidebarFieldValue}>{product.deviceName}</Text>
          </View>
        )}
        {product.deviceModel && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>{t.model.toUpperCase()}</Text>
            <Text style={styles.sidebarFieldValue}>{product.deviceModel}</Text>
          </View>
        )}
        {product.location && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>{t.location.toUpperCase()}</Text>
            <Text style={styles.sidebarFieldValue}>{product.location}</Text>
          </View>
        )}
        {product.packageLabel && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>{t.package.toUpperCase()}</Text>
            <Text style={styles.sidebarFieldValue}>{product.packageLabel}</Text>
          </View>
        )}
        {product.deviceSoftwareVersion && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>{t.version.toUpperCase()}</Text>
            <Text style={styles.sidebarFieldValue}>{product.deviceSoftwareVersion}</Text>
          </View>
        )}
        {product.dataBackupVersion && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>DATABACKUP</Text>
            <Text style={styles.sidebarFieldValue}>{product.dataBackupVersion}</Text>
          </View>
        )}
        {product.deviceSerialNumber && (
          <View style={styles.sidebarField}>
            <Text style={styles.sidebarFieldLabel}>{t.sn.toUpperCase()}</Text>
            <Text style={styles.sidebarFieldValue}>{product.deviceSerialNumber}</Text>
          </View>
        )}

        <View style={styles.sidebarStatusCard}>
          <Text style={styles.sidebarStatusLabel}>{t.overallStatus.toUpperCase()}</Text>
          <StatusPill status={overallStatus} text={summary.headline} />
        </View>

        <View style={styles.sidebarFooter}>
          <Text style={styles.sidebarFooterTagline}>build to endure</Text>
          <Text style={styles.sidebarFooterUrl}>ferrion.at</Text>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.topBar} wrap={false}>
          <View>
            <Text style={styles.topBarKicker}>{t.title}</Text>
            <Text style={styles.topBarTitle}>{customerCompany}</Text>
          </View>
          <Text style={styles.topBarPill}>
            {t.createdOn} {formatDateTime(generatedAt, locale)}
          </Text>
        </View>

        <View style={styles.summaryBanner} wrap={false}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryHeadline}>{summary.headline}</Text>
            <Text style={styles.summaryText}>{summary.text}</Text>
          </View>
          <View style={styles.pillColumn}>
            {bannerHighlights.map((h) => (
              <StatusPill key={h.entry.key} status={h.status} text={h.text} />
            ))}
          </View>
        </View>

        {headlineEntries.length > 0 && (
          <View id={`p${index}-kennzahlen`} wrap={false}>
            <Text style={styles.sectionTitle}>{t.headlineTitle}</Text>
            {primaryKpiEntries.length > 0 && (
              <View style={styles.primaryKpiRow}>
                {primaryKpiEntries.map((e) => (
                  <PrimaryKpiCard key={e.key} entry={e} locale={locale} />
                ))}
              </View>
            )}
            {secondaryKpiEntries.length > 0 && (
              <View style={styles.headlineRow}>
                {secondaryKpiEntries.map((e) => (
                  <HeadlineCard key={e.key} entry={e} locale={locale} />
                ))}
              </View>
            )}
          </View>
        )}

        <View id={`p${index}-schritte`} style={styles.recCard} wrap={false}>
          <Text style={styles.recTitle}>{t.recTitle}</Text>
          {recommendations.map((rec, i) => (
            <View key={i} style={styles.recLineRow}>
              <View style={{ ...styles.recNumber, backgroundColor: STATUS_COLORS[rec.status].bg }}>
                <Text style={{ ...styles.recNumberText, color: STATUS_COLORS[rec.status].text }}>{i + 1}</Text>
              </View>
              <Text style={{ ...styles.recLine, flex: 1 }}>{rec.text}</Text>
            </View>
          ))}
        </View>

        {(hardwareFaultEntries.length > 0 || usageBarEntries.length > 0) && (
          <View id={`p${index}-infra`} style={styles.twoColRow}>
            <View style={styles.leftCol}>
              <ListCard title={t.infraTitle} sub={t.infraSub} entries={hardwareFaultEntries} locale={locale} />
            </View>
            <View style={styles.rightCol}>
              {usageBarEntries.map((e) => (
                <UsageBarCard key={e.key} entry={e} locale={locale} />
              ))}
            </View>
          </View>
        )}

        <View id={`p${index}-kapazitaet`}>
          <CapacitySection entries={capacityEntries} locale={locale} trend={product.capacityTrend} />
          {(product.capacityBreakdown?.length ?? 0) > 0 && (
            <View style={{ marginTop: 10 }}>
              <CapacityBreakdownCard breakdown={product.capacityBreakdown!} locale={locale} />
            </View>
          )}
        </View>

        {(product.volumes?.length ?? 0) > 0 && (
          <View id={`p${index}-volumes`} style={{ marginBottom: 14 }}>
            <VolumeOverviewCard volumes={product.volumes!} locale={locale} />
          </View>
        )}

        <View id={`p${index}-schutz`}>
          <ProtectionSection entries={entries} locale={locale} />
        </View>

        {(product.resourceBreakdown?.length ?? 0) > 0 && (
          <View style={{ marginBottom: 14 }}>
            <ResourceBreakdownCard breakdown={product.resourceBreakdown!} locale={locale} />
          </View>
        )}

        {product.topJobFailures && (
          <View style={{ marginBottom: 14 }}>
            <TopFailuresCards failures={product.topJobFailures} locale={locale} />
          </View>
        )}

        {(product.recentAlarms?.length ?? 0) > 0 && (
          <View style={{ marginBottom: 14 }}>
            <AlarmCard alarms={product.recentAlarms!} locale={locale} />
          </View>
        )}

        <ListCard title={SECTION_LABELS.availability[locale]} entries={availabilityDetailEntries} locale={locale} />
        {availabilityDetailEntries.length > 0 && <View style={{ marginBottom: 14 }} />}

        <ListCard title={SECTION_LABELS.security[locale]} entries={securityEntries} locale={locale} />
        {securityEntries.length > 0 && <View style={{ marginBottom: 14 }} />}

        <ListCard title={SECTION_LABELS.operations[locale]} entries={operationsEntries} locale={locale} />
        {operationsEntries.length > 0 && <View style={{ marginBottom: 14 }} />}

        {(product.componentFaults?.length ?? 0) > 0 && (
          <View id={`p${index}-auffaelligkeiten`} style={{ marginBottom: 14 }}>
            <ComponentFaultsCard faults={product.componentFaults!} locale={locale} />
          </View>
        )}

        {adminNotes && (
          <View style={styles.notesBlock} wrap={false}>
            <Text style={styles.notesLabel}>{t.notes.toUpperCase()}</Text>
            <Text style={styles.notesText}>{adminNotes}</Text>
          </View>
        )}

        {(product.componentChecks?.length ?? 0) > 0 && (
          <View id={`p${index}-geprueft`}>
            <SuccessfulChecksCard checks={product.componentChecks!} locale={locale} />
          </View>
        )}

        {/* Ganz am Schluss dieses Produktabschnitts statt weiter oben — der
            manuell gepflegte Hinweis fungiert als eine Art Management
            Summary für dieses Gerät, nachdem alle Detaildaten gezeigt wurden. */}
        {product.replicationNote && (
          <View style={styles.notesBlock} wrap={false}>
            <Text style={styles.notesLabel}>{(locale === "de" ? "Hinweis" : "Note").toUpperCase()}</Text>
            <Text style={styles.notesText}>{product.replicationNote}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{t.generatedBy} · info@ferrion.at · ferrion.at</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.footerText}>
            {t.createdOn} {formatDateTime(generatedAt, locale)}
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `${t.page} ${pageNumber} / ${totalPages}`}
          />
        </View>
      </View>
    </Page>
  );
}

// Deckblatt: eigene erste Seite, einmal für den ganzen (auch kombinierten)
// Bericht — dunkel im Sidebar-Look, mit Kunde/Produkt(e)/Zeitraum/Erstellt
// am als kompakte Übersicht, bevor die Detailseiten pro Produkt beginnen.
function CoverPage({
  locale,
  customerCompany,
  periodLabel,
  products,
  generatedAt,
}: {
  locale: "de" | "en";
  customerCompany: string;
  periodLabel: string;
  products: ProductReportData[];
  generatedAt: Date;
}) {
  const t = COPY[locale];
  return (
    <Page size="A4" style={styles.coverPage}>
      <View>
        <Image style={styles.coverLogo} src={LOGO_DATA_URI} />
        <Text style={styles.coverKicker}>{t.title}</Text>
        <Text style={styles.coverTitle}>{periodLabel}</Text>
        <View style={styles.coverRule} />
        <Text style={styles.coverCustomer}>{customerCompany}</Text>

        <View style={styles.coverProductList}>
          {products.map((p, i) => (
            <View key={p.productName + i} style={styles.coverProductRow}>
              <Text style={styles.coverProductName}>
                {p.vendor} {p.productName}
              </Text>
              {p.packageLabel && <Text style={styles.coverProductMeta}>{p.packageLabel}</Text>}
            </View>
          ))}
        </View>
      </View>

      <View>
        <View style={styles.coverRule} />
        <Text style={styles.coverFooterLine}>
          {t.createdOn} {formatDateTime(generatedAt, locale)}
        </Text>
        <Text style={styles.coverFooterTagline}>build to endure</Text>
        <Text style={styles.coverFooterUrl}>Erstellt von Ferrion IT Systemhaus GmbH · info@ferrion.at · ferrion.at</Text>
      </View>
    </Page>
  );
}

// Welche Unterabschnitte für ein Produkt tatsächlich im Bericht vorkommen —
// muss exakt dieselben Bedingungen wie ProductPage spiegeln, sonst würde
// das Inhaltsverzeichnis auf leere/nicht vorhandene Abschnitte verlinken.
function productTocSections(product: ProductReportData, locale: "de" | "en", index: number) {
  const t = COPY[locale];
  const { entries } = product;
  const hasHeadline = entries.some((e) => e.headline);
  const hasInfra = entries.some((e) => e.section === "hardware" && (e.format === "count" || e.format === "percent"));
  const hasCapacity = entries.some((e) => e.section === "capacity");
  const hasProtection = entries.some((e) => e.key === "resource_protection_rate");
  return [
    hasHeadline && { label: t.headlineTitle, anchor: `p${index}-kennzahlen` },
    { label: t.recTitle, anchor: `p${index}-schritte` },
    hasInfra && { label: t.infraTitle, anchor: `p${index}-infra` },
    hasCapacity && { label: SECTION_LABELS.capacity[locale], anchor: `p${index}-kapazitaet` },
    (product.volumes?.length ?? 0) > 0 && { label: VOLUME_OVERVIEW_COPY[locale].title, anchor: `p${index}-volumes` },
    hasProtection && { label: PROTECTION_COPY[locale].title, anchor: `p${index}-schutz` },
    (product.componentFaults?.length ?? 0) > 0 && { label: t.detailsTitle, anchor: `p${index}-auffaelligkeiten` },
    (product.componentChecks?.length ?? 0) > 0 && { label: t.successTitle, anchor: `p${index}-geprueft` },
  ].filter((s): s is { label: string; anchor: string } => Boolean(s));
}

// Methodik gilt für den gesamten Bericht (nicht nur ein Produkt) und stand
// bisher pro Produkt wiederholt im Bericht — jetzt eine einzige Stelle ganz
// am Ende, die über alle Produkte hinweg dedupliziert (dieselbe Kennzahl,
// z. B. Systemverfügbarkeit, taucht bei kombinierten Berichten sonst doppelt auf).
function mergeMethodologyEntries(products: ProductReportData[]): QuarterSummaryEntry[] {
  const byKey = new Map<string, QuarterSummaryEntry>();
  for (const product of products) {
    for (const entry of product.entries) {
      if (!byKey.has(entry.key)) byKey.set(entry.key, entry);
    }
  }
  return Array.from(byKey.values());
}

function hasAnyMethodology(products: ProductReportData[]): boolean {
  return products.some((p) => p.entries.some((e) => e.methodology || e.derived || e.source));
}

function MethodologyPage({ locale, products }: { locale: "de" | "en"; products: ProductReportData[] }) {
  const t = COPY[locale];
  if (!hasAnyMethodology(products)) return null;
  const entries = mergeMethodologyEntries(products);
  return (
    <Page id="methodology" size="A4" style={styles.tocPage}>
      <Image style={styles.tocLogo} src={LOGO_DATA_URI} />
      <Text style={styles.tocTitle}>{t.methodologyTitle}</Text>
      <View style={styles.tocRule} />
      <MethodologySection entries={entries} locale={locale} />
    </Page>
  );
}

const TOC_COPY = { de: { title: "Inhaltsverzeichnis" }, en: { title: "Table of Contents" } };

function TocPage({ locale, products }: { locale: "de" | "en"; products: ProductReportData[] }) {
  const tt = TOC_COPY[locale];
  const t = COPY[locale];
  return (
    <Page size="A4" style={styles.tocPage}>
      <Image style={styles.tocLogo} src={LOGO_DATA_URI} />
      <Text style={styles.tocTitle}>{tt.title}</Text>
      <View style={styles.tocRule} />

      {products.map((product, i) => (
        <View key={product.productName + i} style={{ marginBottom: 16 }} wrap={false}>
          <Link src={`#product-${i}`} style={styles.tocLinkReset}>
            <View style={styles.tocEntryRow}>
              <Text style={styles.tocEntryNumber}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={styles.tocEntryTitle}>
                {product.vendor} {product.productName}
              </Text>
            </View>
          </Link>
          {productTocSections(product, locale, i).map((section) => (
            <Link key={section.anchor} src={`#${section.anchor}`} style={styles.tocLinkReset}>
              <View style={styles.tocSubEntryRow}>
                <Text style={styles.tocSubEntryTitle}>{section.label}</Text>
              </View>
            </Link>
          ))}
        </View>
      ))}

      {hasAnyMethodology(products) && (
        <Link src="#methodology" style={styles.tocLinkReset}>
          <View style={styles.tocEntryRow}>
            <Text style={styles.tocEntryNumber}>{String(products.length + 1).padStart(2, "0")}</Text>
            <Text style={styles.tocEntryTitle}>{t.methodologyTitle}</Text>
          </View>
        </Link>
      )}
    </Page>
  );
}

export function ReportDocument({ locale, customerCompany, periodLabel, products, adminNotes, generatedAt }: ReportDocumentProps) {
  const t = COPY[locale];

  return (
    <Document
      title={`${t.title} — ${customerCompany} — ${products.map((p) => p.productName).join(" + ")} — ${periodLabel}`}
    >
      <CoverPage locale={locale} customerCompany={customerCompany} periodLabel={periodLabel} products={products} generatedAt={generatedAt} />
      <TocPage locale={locale} products={products} />
      {products.map((product, i) => (
        <ProductPage
          key={product.productName + i}
          product={product}
          index={i}
          locale={locale}
          customerCompany={customerCompany}
          periodLabel={periodLabel}
          generatedAt={generatedAt}
          adminNotes={i === products.length - 1 ? adminNotes : undefined}
        />
      ))}
      <MethodologyPage locale={locale} products={products} />
    </Document>
  );
}
