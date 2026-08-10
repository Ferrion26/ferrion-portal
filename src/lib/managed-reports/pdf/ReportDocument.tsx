import fs from "fs";
import path from "path";
import { Document, Page, View, Text, Image, StyleSheet, Svg, Path as SvgPath, Circle, Font, Link } from "@react-pdf/renderer";
import { QuarterSummaryEntry } from "../aggregate";
import { ReportSection } from "../metrics";
import { formatValue, formatDateTime } from "../reportFormat";
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
const SIDEBAR_BG = "#111827";
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
  page: { fontFamily: "Helvetica", color: INK, fontSize: 9, backgroundColor: PAGE_BG, paddingBottom: 48 },

  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: SIDEBAR_BG,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
  },
  sidebarLogo: { width: 46, height: 24, objectFit: "contain", marginBottom: 14 },
  sidebarReportLabel: { fontSize: 6.5, color: GOLD, letterSpacing: 1.5, marginBottom: 4 },
  sidebarTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: WHITE, lineHeight: 1.25, marginBottom: 16 },
  sidebarRule: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)", marginBottom: 14 },
  sidebarField: { marginBottom: 12 },
  sidebarFieldLabel: { fontSize: 6, color: "#8B94A3", letterSpacing: 0.8, marginBottom: 2 },
  sidebarFieldValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: WHITE, lineHeight: 1.3 },
  sidebarStatusCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 6, padding: 10, marginTop: 4 },
  sidebarStatusLabel: { fontSize: 6, color: "#8B94A3", letterSpacing: 0.8, marginBottom: 6 },
  sidebarFooter: { position: "absolute", bottom: 18, left: 16, right: 16 },
  sidebarFooterTagline: { fontSize: 6.5, color: GOLD, letterSpacing: 1 },
  sidebarFooterUrl: { fontSize: 6, color: "#6B7280", marginTop: 2 },

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
  headlineCard: { flex: 1, backgroundColor: WHITE, borderRadius: 8, padding: 11 },
  headlineTopRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  headlineLabel: { fontSize: 7.5, color: GRAY },
  headlineValue: { fontSize: 17, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 7 },

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

  methodologyBlock: { backgroundColor: WHITE, borderRadius: 8, padding: 12, marginBottom: 10 },
  methodologyTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY, marginBottom: 4 },
  methodologyLine: { fontSize: 7, color: MUTED, lineHeight: 1.4, marginBottom: 3 },

  notesBlock: { backgroundColor: WHITE, borderRadius: 8, padding: 13, marginBottom: 10 },
  notesLabel: { fontSize: 8, color: GRAY, letterSpacing: 1, marginBottom: 6 },
  notesText: { fontSize: 9, color: INK, lineHeight: 1.5 },

  footer: { position: "absolute", bottom: 18, left: SIDEBAR_WIDTH + PAGE_PADDING, right: PAGE_PADDING, borderTopWidth: 1, borderTopColor: GOLD, paddingTop: 7, textAlign: "center" },
  footerText: { fontSize: 7, color: GRAY },

  // Deckblatt: volle dunkle Fläche im selben Look wie die Sidebar der
  // Produktseiten, damit der Bericht als Ganzes konsistent wirkt.
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: DARK,
    color: WHITE,
    paddingHorizontal: 56,
    paddingVertical: 64,
    justifyContent: "space-between",
  },
  coverLogo: { width: 84, height: 44, objectFit: "contain", marginBottom: 40 },
  coverKicker: { fontSize: 9, color: GOLD, letterSpacing: 2.5, marginBottom: 10 },
  coverTitle: { fontSize: 30, fontFamily: "Helvetica-Bold", color: WHITE, marginBottom: 18 },
  coverRule: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.15)", marginBottom: 18 },
  coverCustomer: { fontSize: 15, fontFamily: "Helvetica-Bold", color: WHITE, marginBottom: 22 },
  coverProductList: { gap: 10 },
  coverProductRow: { borderLeftWidth: 2, borderLeftColor: GOLD, paddingLeft: 10 },
  coverProductName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: WHITE },
  coverProductMeta: { fontSize: 8, color: "#8B94A3", marginTop: 1 },
  coverFooterLine: { fontSize: 8.5, color: "#C3C2B7", marginTop: 4, marginBottom: 4 },
  coverFooterTagline: { fontSize: 8, color: GOLD, letterSpacing: 1.5, marginBottom: 6 },
  coverFooterUrl: { fontSize: 7, color: "#6B7280" },

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
    <View style={styles.headlineCard} wrap={false}>
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
    active: "Aktiv",
  },
  en: {
    title: "Alarms in Detail",
    sub: "Events from the device's event log that were active during the reporting period.",
    resolvedOn: (date: string) => `Resolved on ${date}`,
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
  return (
    <View style={styles.alarmCard}>
      <Text style={styles.listCardTitle}>{t.title}</Text>
      <Text style={styles.listCardSub}>{t.sub}</Text>
      {shown.map((alarm, i) => (
        <View key={i} wrap={false} style={{ ...styles.alarmRow, opacity: alarm.status === "resolved" ? 0.55 : 1 }}>
          <View style={styles.alarmTopRow}>
            <View style={styles.alarmTitleGroup}>
              <Dot status={alarm.status === "resolved" ? "good" : ALARM_SEVERITY_TO_STATUS[alarm.severity]} />
              <Text style={styles.alarmName}>{decodeHtmlEntities(alarm.name)}</Text>
              {alarm.status === "resolved" && alarm.resolvedAt ? (
                <StatusPill status="good" text={t.resolvedOn(formatDateTime(alarm.resolvedAt, locale))} />
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
        </View>
      ))}
    </View>
  );
}

const MAX_COMPONENT_FAULTS_SHOWN = 20;

function ComponentFaultsCard({ faults, locale }: { faults: ComponentFault[]; locale: "de" | "en" }) {
  const t = COPY[locale];
  const shown = faults.slice(0, MAX_COMPONENT_FAULTS_SHOWN);
  const overflow = faults.length - shown.length;
  return (
    <View style={styles.tableCardBlock}>
      <Text style={styles.listCardTitle}>{t.detailsTitle}</Text>
      <Text style={styles.listCardSub}>{t.detailsSub}</Text>
      {shown.map((fault, i) => (
        <View key={i} wrap={false} style={{ ...styles.tableRow, alignItems: "flex-start", opacity: fault.status === "resolved" ? 0.55 : 1 }}>
          <Text style={{ width: 90, color: MUTED, fontSize: 7, paddingTop: 1 }}>{fault.category}</Text>
          <Text style={{ width: 110, fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, paddingRight: 6 }}>{fault.id}</Text>
          <Text style={{ flex: 1, fontSize: 8, color: "#374151" }}>{fault.description}</Text>
          <Text style={{ width: 90, fontSize: 6.5, color: fault.status === "resolved" ? STATUS_COLORS.good.dot : STATUS_COLORS.warning.dot, textAlign: "right" }}>
            {fault.status === "resolved" && fault.resolvedAt
              ? (locale === "de" ? `Behoben ${formatDateTime(fault.resolvedAt, locale)}` : `Resolved ${formatDateTime(fault.resolvedAt, locale)}`)
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

function groupSuccessfulChecks(ok: ComponentCheck[], locale: "de" | "en") {
  const byCategory = new Map<string, ComponentCheck[]>();
  for (const c of ok) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }
  const rows: { category: string; id: string; description: string }[] = [];
  for (const [category, items] of Array.from(byCategory.entries())) {
    if (items.length > GROUP_CATEGORY_THRESHOLD) {
      rows.push({
        category,
        id: locale === "de" ? `${items.length} geprüft` : `${items.length} checked`,
        description: locale === "de" ? "Alle Normal" : "All Normal",
      });
    } else {
      for (const item of items) rows.push({ category: item.category, id: item.id, description: item.description });
    }
  }
  return rows;
}

function SuccessfulChecksCard({ checks, locale }: { checks: ComponentCheck[]; locale: "de" | "en" }) {
  const t = COPY[locale];
  const ok = checks.filter((c) => c.ok);
  if (ok.length === 0) return null;
  const rows = groupSuccessfulChecks(ok, locale);
  const shown = rows.slice(0, MAX_SUCCESSFUL_CHECKS_SHOWN);
  const overflow = rows.length - shown.length;
  return (
    // Kein wrap={false} auf dem Container: bis zu MAX_SUCCESSFUL_CHECKS_SHOWN
    // (60) Zeilen sprengen als starr unteilbarer Block leicht eine Seite
    // (siehe dieselbe Korrektur bei AlarmCard/ComponentFaultsCard/ListCard).
    <View style={styles.tableCardBlock}>
      <Text style={styles.listCardTitle}>{t.successTitle}</Text>
      <Text style={styles.listCardSub}>{t.successSub}</Text>
      {shown.map((check, i) => (
        <View key={i} wrap={false} style={{ ...styles.tableRow, alignItems: "flex-start" }}>
          <Text style={{ width: 90, color: MUTED, fontSize: 7, paddingTop: 1 }}>{check.category}</Text>
          <Text style={{ width: 110, fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, paddingRight: 6 }}>{check.id}</Text>
          <Text style={{ flex: 1, fontSize: 8, color: "#374151" }}>{check.description}</Text>
          <Text style={{ width: 40, fontSize: 6.5, color: STATUS_COLORS.good.dot, textAlign: "right" }}>OK</Text>
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

// Kapazitätskarte im Mockup-Stil: Donut für den Storage-Pool-Füllgrad links,
// alle übrigen Kapazitäts-Kennzahlen als Kachel-Raster daneben.
function CapacitySection({ entries, locale }: { entries: QuarterSummaryEntry[]; locale: "de" | "en" }) {
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
    version: "Version",
    overallStatus: "Gesamtstatus",
    createdOn: "Erstellt am",
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
    version: "Version",
    overallStatus: "Overall Status",
    createdOn: "Generated on",
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
  // ist oder im Berichtszeitraum wieder verschwunden (behoben) ist.
  status: "active" | "resolved";
  resolvedAt?: string;
}

export interface ResourceBreakdownEntry {
  resourceType: string;
  protectedCount: number;
  unprotectedCount: number;
}

export interface TopJobFailures {
  bySla: { name: string; failedCount: number }[];
  byResource: { name: string; failedCount: number }[];
}

export interface ComponentFault {
  category: string;
  id: string;
  description: string;
  status: "active" | "resolved";
  resolvedAt?: string;
}

// JEDE geprüfte Komponente (normal UND fehlerhaft) — anders als
// ComponentFault eine reine Momentaufnahme ohne Historie, Grundlage für den
// abschließenden "erfolgreich geprüft"-Referenzabschnitt.
export interface ComponentCheck {
  category: string;
  id: string;
  description: string;
  ok: boolean;
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
  entries: QuarterSummaryEntry[];
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
  const hardwareFaultEntries = entries.filter((e) => e.section === "hardware" && e.format === "count");
  const usageBarEntries = entries.filter((e) => e.section === "hardware" && e.format === "percent" && e.key !== "system_availability");
  const capacityEntries = entries.filter((e) => e.section === "capacity");
  const securityEntries = entries.filter((e) => e.section === "security");
  const operationsEntries = entries.filter((e) => e.section === "operations");
  const availabilityDetailEntries = entries.filter((e) => e.section === "availability" && !e.headline);
  const methodologyEntries = entries.filter((e) => e.methodology);

  const summary = buildExecutiveSummary(entries, locale);
  const recommendations = buildRecommendations(entries, locale);
  const bannerHighlights = buildBannerHighlights(entries, locale);
  const overallStatus: MetricStatus = summary.issueCount === 0 ? "good" : entries.some((e) => deriveStatus(e) === "critical") ? "critical" : "warning";

  return (
    <Page id={`product-${index}`} size="A4" style={styles.page}>
      <View style={styles.sidebar} fixed>
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
            <View style={styles.headlineRow}>
              {headlineEntries.map((e) => (
                <HeadlineCard key={e.key} entry={e} locale={locale} />
              ))}
            </View>
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
          <CapacitySection entries={capacityEntries} locale={locale} />
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

        {product.replicationNote && (
          <View style={styles.notesBlock} wrap={false}>
            <Text style={styles.notesLabel}>{(locale === "de" ? "Hinweis" : "Note").toUpperCase()}</Text>
            <Text style={styles.notesText}>{product.replicationNote}</Text>
          </View>
        )}

        <ListCard title={SECTION_LABELS.availability[locale]} entries={availabilityDetailEntries} locale={locale} />
        {availabilityDetailEntries.length > 0 && <View style={{ marginBottom: 14 }} />}

        <ListCard title={SECTION_LABELS.security[locale]} entries={securityEntries} locale={locale} />
        {securityEntries.length > 0 && <View style={{ marginBottom: 14 }} />}

        <ListCard title={SECTION_LABELS.operations[locale]} entries={operationsEntries} locale={locale} />
        {operationsEntries.length > 0 && <View style={{ marginBottom: 14 }} />}

        {(methodologyEntries.length > 0 || entries.some((e) => e.derived) || entries.some((e) => e.source)) && (
          // Kein wrap={false} auf dem Container: die Zahl der Methodik-
          // Zeilen wächst mit der Anzahl der Metriken mit methodology-Text
          // (inzwischen ~10+) — ein starr unteilbarer Block kann dann größer
          // als eine Seite werden und den PDF-Export zum Absturz bringen
          // (siehe die gleiche Korrektur bei AlarmCard/ComponentFaultsCard).
          <View id={`p${index}-methodik`} style={styles.methodologyBlock}>
            <Text style={styles.methodologyTitle}>{t.methodologyTitle.toUpperCase()}</Text>
            {entries.some((e) => e.derived) && (
              <View wrap={false}>
                <Text style={styles.methodologyLine}>
                  {locale === "de"
                    ? `Mit "${DERIVED_LABEL.de}" markierte Kennzahlen werden von uns aus mehreren Rohwerten des Geräts berechnet (z. B. gemittelt oder als Quote) — sie sind kein einzelner, vom Gerät direkt gemeldeter Messwert.`
                    : `Metrics marked "${DERIVED_LABEL.en}" are calculated by us from several raw device readings (e.g. averaged or as a rate) — not a single value reported directly by the device.`}
                </Text>
              </View>
            )}
            {entries.some((e) => e.source === "databackup") && (
              <View wrap={false}>
                <Text style={styles.methodologyLine}>
                  {locale === "de"
                    ? `Mit "DataBackup" markierte Kennzahlen kommen aus der separaten Backup-Software-Oberfläche (ProtectManager), nicht aus dem DeviceManager der Storage-Appliance selbst — alle anderen Kennzahlen dieses Abschnitts kommen vom Storage-Gerät.`
                    : `Metrics marked "DataBackup" come from the separate backup software interface (ProtectManager), not from the storage appliance's own DeviceManager — every other metric in this section comes from the storage device.`}
                </Text>
              </View>
            )}
            {methodologyEntries.map((e) => (
              <View key={e.key} wrap={false}>
                <Text style={styles.methodologyLine}>
                  {e.label[locale]}: {e.methodology![locale]}
                </Text>
              </View>
            ))}
          </View>
        )}

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
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          {t.generatedBy} · info@ferrion.at · ferrion.at · {t.createdOn} {formatDateTime(generatedAt, locale)}
        </Text>
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
  const hasMethodology =
    entries.some((e) => e.methodology) || entries.some((e) => e.derived) || entries.some((e) => e.source);

  return [
    hasHeadline && { label: t.headlineTitle, anchor: `p${index}-kennzahlen` },
    { label: t.recTitle, anchor: `p${index}-schritte` },
    hasInfra && { label: t.infraTitle, anchor: `p${index}-infra` },
    hasCapacity && { label: SECTION_LABELS.capacity[locale], anchor: `p${index}-kapazitaet` },
    (product.componentFaults?.length ?? 0) > 0 && { label: t.detailsTitle, anchor: `p${index}-auffaelligkeiten` },
    (product.componentChecks?.length ?? 0) > 0 && { label: t.successTitle, anchor: `p${index}-geprueft` },
    hasMethodology && { label: t.methodologyTitle, anchor: `p${index}-methodik` },
  ].filter((s): s is { label: string; anchor: string } => Boolean(s));
}

const TOC_COPY = { de: { title: "Inhaltsverzeichnis" }, en: { title: "Table of Contents" } };

function TocPage({ locale, products }: { locale: "de" | "en"; products: ProductReportData[] }) {
  const tt = TOC_COPY[locale];
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
    </Document>
  );
}
