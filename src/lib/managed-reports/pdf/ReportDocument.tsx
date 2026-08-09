import fs from "fs";
import path from "path";
import { Document, Page, View, Text, Image, StyleSheet, Svg, Path as SvgPath, Font } from "@react-pdf/renderer";
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
const ROW_DIVIDER = "#F3F4F6";

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
  if (entry.key === "protected_capacity_tb") return locale === "de" ? "geschützt" : "protected";
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
  page: { padding: 26, fontFamily: "Helvetica", color: INK, fontSize: 9, backgroundColor: PAGE_BG },

  headerCard: { backgroundColor: WHITE, borderRadius: 8, padding: 16, marginBottom: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { width: 64, height: 34, objectFit: "contain" },
  headTitle: { fontSize: 19, fontFamily: "Helvetica-Bold", color: INK },
  headSub: { fontSize: 7, color: GOLD_DARK, letterSpacing: 2, marginTop: 2 },
  goldRule: { borderBottomWidth: 2, borderBottomColor: GOLD, marginTop: 10 },

  metaRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  metaCard: { flex: 1, backgroundColor: WHITE, borderRadius: 8, padding: 9 },
  metaLabel: { fontSize: 6.5, color: GRAY, letterSpacing: 0.5, marginBottom: 3 },
  metaValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: INK },
  metaSubValue: { fontSize: 6.5, color: MUTED, marginTop: 3 },

  productHeader: { backgroundColor: INK, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 13, marginBottom: 10 },
  productHeaderName: { fontSize: 11.5, fontFamily: "Helvetica-Bold", color: WHITE },
  productHeaderMeta: { fontSize: 7, color: "#9CA3AF", marginTop: 2 },

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
  listRowLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, paddingRight: 8 },
  listRowLabel: { fontSize: 8.5, color: INK },
  listRowRight: { flexDirection: "row", alignItems: "center", gap: 7, flexShrink: 0 },
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

  recLineRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 6 },
  recDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },

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
  recTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 7 },
  recLine: { fontSize: 8, color: "#374151", marginBottom: 5, lineHeight: 1.4 },

  capacityRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },

  methodologyBlock: { backgroundColor: WHITE, borderRadius: 8, padding: 12, marginBottom: 10 },
  methodologyTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY, marginBottom: 4 },
  methodologyLine: { fontSize: 7, color: MUTED, lineHeight: 1.4, marginBottom: 3 },

  notesBlock: { backgroundColor: WHITE, borderRadius: 8, padding: 13, marginBottom: 10 },
  notesLabel: { fontSize: 8, color: GRAY, letterSpacing: 1, marginBottom: 6 },
  notesText: { fontSize: 9, color: INK, lineHeight: 1.5 },

  footer: { position: "absolute", bottom: 18, left: 26, right: 26, borderTopWidth: 1, borderTopColor: GOLD, paddingTop: 7, textAlign: "center" },
  footerText: { fontSize: 7, color: GRAY },
  footerTagline: { fontSize: 6, color: GOLD, letterSpacing: 1, marginTop: 2 },
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <StatusPill status={status} text={headlinePillText(entry, status, locale)} />
        {tags && <Text style={styles.derivedTag}>{tags}</Text>}
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
    <View style={styles.listRow}>
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
    <View style={styles.listCard} wrap={false}>
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
      <Text style={styles.barCardTitle}>{entry.label[locale]}</Text>
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
    <View style={styles.alarmCard} wrap={false}>
      <Text style={styles.listCardTitle}>{t.title}</Text>
      <Text style={styles.listCardSub}>{t.sub}</Text>
      {shown.map((alarm, i) => (
        <View key={i} style={{ ...styles.alarmRow, opacity: alarm.status === "resolved" ? 0.55 : 1 }}>
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
    <View style={styles.tableCardBlock} wrap={false}>
      <Text style={styles.listCardTitle}>{t.detailsTitle}</Text>
      <Text style={styles.listCardSub}>{t.detailsSub}</Text>
      {shown.map((fault, i) => (
        <View key={i} style={{ ...styles.tableRow, alignItems: "flex-start", opacity: fault.status === "resolved" ? 0.55 : 1 }}>
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
          <Text style={styles.tableCellNum}>{row.protectedCount.toLocaleString(locale === "de" ? "de-AT" : "en-US")}</Text>
          <Text style={{ ...styles.tableCellNum, color: row.unprotectedCount > 0 ? STATUS_COLORS.warning.dot : INK }}>
            {row.unprotectedCount.toLocaleString(locale === "de" ? "de-AT" : "en-US")}
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

function CapacityStatCard({ entry, locale }: { entry: QuarterSummaryEntry; locale: "de" | "en" }) {
  const tinted = entry.format === "percent" ? { bg: "#FEF3C7", text: "#92400E" } : { bg: "#DBEAFE", text: "#1E40AF" };
  return (
    <View style={{ ...styles.statCard, backgroundColor: tinted.bg }} wrap={false}>
      <Text style={{ ...styles.statLabel, color: tinted.text }}>{entry.label[locale]}</Text>
      <Text style={styles.statValue}>{formatValue(entry, locale)}</Text>
    </View>
  );
}

const COPY = {
  de: {
    title: "MANAGED SERVICE REPORT",
    sub: "MANAGED SERVICE REPORT",
    customer: "Kunde",
    product: "Produkt",
    period: "Zeitraum",
    package: "Servicestufe",
    sn: "SN",
    model: "Modell",
    version: "Version",
    headlineTitle: "Wichtigste Kennzahlen",
    infraTitle: "Infrastrukturstatus",
    infraSub: "Auffälligkeiten sind farblich markiert.",
    recTitle: "Empfehlung",
    methodologyTitle: "Methodik",
    detailsTitle: "Details zu Auffälligkeiten",
    detailsSub: "Konkrete Komponenten hinter den Kennzahlen > 0 im Infrastrukturstatus.",
    notes: "Anmerkungen",
    generatedBy: "Erstellt von Ferrion IT Systemhaus GmbH",
  },
  en: {
    title: "MANAGED SERVICE REPORT",
    sub: "MANAGED SERVICE REPORT",
    customer: "Customer",
    product: "Product",
    period: "Period",
    package: "Service Tier",
    sn: "SN",
    model: "Model",
    version: "Version",
    headlineTitle: "Key Metrics",
    infraTitle: "Infrastructure Status",
    infraSub: "Issues are color-coded.",
    recTitle: "Recommendation",
    methodologyTitle: "Methodology",
    detailsTitle: "Issue Details",
    detailsSub: "Specific components behind the metrics > 0 in the infrastructure status.",
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

export interface ProductReportData {
  productName: string;
  vendor: string;
  packageLabel?: string;
  deviceSerialNumber?: string;
  deviceModel?: string;
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

// Ein Produktblock enthält alles, was bei einem Einzelprodukt-Bericht auf
// der Seite steht — bei mehreren Produkten (kombinierter Bericht) wird das
// pro Produkt hintereinander wiederholt, mit gemeinsamem Kopf-/Kundenblock
// darüber (siehe ReportDocument unten).
function ProductBlock({ product, locale, isCombined }: { product: ProductReportData; locale: "de" | "en"; isCombined: boolean }) {
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

  const deviceMetaParts = [
    product.deviceModel && `${t.model}: ${product.deviceModel}`,
    product.deviceSoftwareVersion && `${t.version}: ${product.deviceSoftwareVersion}`,
    product.dataBackupVersion && `DataBackup: ${product.dataBackupVersion}`,
    product.deviceSerialNumber && `${t.sn}: ${product.deviceSerialNumber}`,
  ].filter(Boolean);

  return (
    <View>
      {isCombined && (
        <View style={styles.productHeader} wrap={false}>
          <Text style={styles.productHeaderName}>
            {product.vendor} {product.productName}
            {product.packageLabel ? ` · ${product.packageLabel}` : ""}
          </Text>
          {deviceMetaParts.length > 0 && <Text style={styles.productHeaderMeta}>{deviceMetaParts.join("  ·  ")}</Text>}
        </View>
      )}

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
        <View wrap={false}>
          <Text style={styles.sectionTitle}>{t.headlineTitle}</Text>
          <View style={styles.headlineRow}>
            {headlineEntries.map((e) => (
              <HeadlineCard key={e.key} entry={e} locale={locale} />
            ))}
          </View>
        </View>
      )}

      {(hardwareFaultEntries.length > 0 || usageBarEntries.length > 0) && (
        <View style={styles.twoColRow}>
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

      {capacityEntries.length > 0 && (
        <View wrap={false}>
          <Text style={styles.sectionTitle}>{SECTION_LABELS.capacity[locale]}</Text>
          <View style={styles.capacityRow}>
            {capacityEntries.map((e) => (
              <CapacityStatCard key={e.key} entry={e} locale={locale} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.recCard} wrap={false}>
        <Text style={styles.recTitle}>{t.recTitle}</Text>
        {recommendations.map((rec, i) => (
          <View key={i} style={styles.recLineRow}>
            <View style={{ ...styles.recDot, backgroundColor: STATUS_COLORS[rec.status].dot }} />
            <Text style={{ ...styles.recLine, marginBottom: 0, flex: 1 }}>{rec.text}</Text>
          </View>
        ))}
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
        <View style={styles.methodologyBlock} wrap={false}>
          <Text style={styles.methodologyTitle}>{t.methodologyTitle.toUpperCase()}</Text>
          {entries.some((e) => e.derived) && (
            <Text style={styles.methodologyLine}>
              {locale === "de"
                ? `Mit "${DERIVED_LABEL.de}" markierte Kennzahlen werden von uns aus mehreren Rohwerten des Geräts berechnet (z. B. gemittelt oder als Quote) — sie sind kein einzelner, vom Gerät direkt gemeldeter Messwert.`
                : `Metrics marked "${DERIVED_LABEL.en}" are calculated by us from several raw device readings (e.g. averaged or as a rate) — not a single value reported directly by the device.`}
            </Text>
          )}
          {entries.some((e) => e.source === "databackup") && (
            <Text style={styles.methodologyLine}>
              {locale === "de"
                ? `Mit "DataBackup" markierte Kennzahlen kommen aus der separaten Backup-Software-Oberfläche (ProtectManager), nicht aus dem DeviceManager der Storage-Appliance selbst — alle anderen Kennzahlen dieses Abschnitts kommen vom Storage-Gerät.`
                : `Metrics marked "DataBackup" come from the separate backup software interface (ProtectManager), not from the storage appliance's own DeviceManager — every other metric in this section comes from the storage device.`}
            </Text>
          )}
          {methodologyEntries.map((e) => (
            <Text key={e.key} style={styles.methodologyLine}>
              {e.label[locale]}: {e.methodology![locale]}
            </Text>
          ))}
        </View>
      )}

      {(product.componentFaults?.length ?? 0) > 0 && (
        <View style={{ marginTop: 14 }}>
          <ComponentFaultsCard faults={product.componentFaults!} locale={locale} />
        </View>
      )}
    </View>
  );
}

export function ReportDocument({ locale, customerCompany, periodLabel, products, adminNotes, generatedAt }: ReportDocumentProps) {
  const t = COPY[locale];
  const isCombined = products.length > 1;
  const singleProduct = !isCombined ? products[0] : null;

  return (
    <Document
      title={`${t.title} — ${customerCompany} — ${products.map((p) => p.productName).join(" + ")} — ${periodLabel}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerCard} wrap={false}>
          <View style={styles.headerRow}>
            <Image style={styles.logo} src={LOGO_DATA_URI} />
            <View>
              <Text style={styles.headTitle}>{isCombined ? (locale === "de" ? "MANAGED SERVICE REPORT" : "MANAGED SERVICE REPORT") : (locale === "de" ? "QUARTALSBERICHT" : "QUARTERLY REPORT")}</Text>
              <Text style={styles.headSub}>{t.sub}</Text>
            </View>
          </View>
          <View style={styles.goldRule} />
        </View>

        <View style={styles.metaRow} wrap={false}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>{t.customer.toUpperCase()}</Text>
            <Text style={styles.metaValue}>{customerCompany}</Text>
          </View>
          {singleProduct && (
            <>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>{t.product.toUpperCase()}</Text>
                <Text style={styles.metaValue}>{singleProduct.vendor} {singleProduct.productName}</Text>
                {(singleProduct.deviceModel || singleProduct.deviceSoftwareVersion || singleProduct.dataBackupVersion || singleProduct.deviceSerialNumber) && (
                  <Text style={styles.metaSubValue}>
                    {[
                      singleProduct.deviceModel,
                      singleProduct.deviceSoftwareVersion,
                      singleProduct.dataBackupVersion && `DataBackup ${singleProduct.dataBackupVersion}`,
                      singleProduct.deviceSerialNumber,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
              </View>
              {singleProduct.packageLabel && (
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>{t.package.toUpperCase()}</Text>
                  <Text style={styles.metaValue}>{singleProduct.packageLabel}</Text>
                </View>
              )}
            </>
          )}
          {isCombined && (
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>{t.product.toUpperCase()}</Text>
              <Text style={styles.metaValue}>{products.map((p) => p.productName).join(" + ")}</Text>
            </View>
          )}
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>{t.period.toUpperCase()}</Text>
            <Text style={styles.metaValue}>{periodLabel}</Text>
          </View>
        </View>

        {products.map((product, i) => (
          <ProductBlock key={product.productName + i} product={product} locale={locale} isCombined={isCombined} />
        ))}

        {adminNotes && (
          <View style={styles.notesBlock} wrap={false}>
            <Text style={styles.notesLabel}>{t.notes.toUpperCase()}</Text>
            <Text style={styles.notesText}>{adminNotes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {t.generatedBy} · info@ferrion.at · ferrion.at · {(locale === "de" ? "Erstellt am " : "Generated on ") + formatDateTime(generatedAt, locale)}
          </Text>
          <Text style={styles.footerTagline}>build to endure</Text>
        </View>
      </Page>
    </Document>
  );
}
