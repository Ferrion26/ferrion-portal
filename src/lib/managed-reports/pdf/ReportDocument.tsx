import fs from "fs";
import path from "path";
import { Document, Page, View, Text, Image, StyleSheet, Svg, Path as SvgPath } from "@react-pdf/renderer";
import { QuarterSummaryEntry } from "../aggregate";
import { ReportSection } from "../metrics";

const GOLD = "#C9A84C";
const INK = "#111827";
const GRAY = "#6B7280";
const LIGHT = "#E5E7EB";
const WHITE = "#FFFFFF";

// Passed as a data URI rather than a bare file path — @react-pdf/renderer's
// path resolver is unreliable for local files in a Node/serverless context
// (silently renders nothing instead of throwing).
const LOGO_DATA_URI = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "scripts", "assets", "ferrion-logo-light.png"))
  .toString("base64")}`;

const SECTION_LABELS: Record<ReportSection, { de: string; en: string }> = {
  availability: { de: "Verfügbarkeit", en: "Availability" },
  capacity: { de: "Kapazität", en: "Capacity" },
  security: { de: "Sicherheit", en: "Security" },
  operations: { de: "Betrieb", en: "Operations" },
};

function formatValue(entry: Pick<QuarterSummaryEntry, "format" | "value" | "unit">, locale: "de" | "en") {
  const n = (digits: number) => entry.value.toLocaleString(locale === "de" ? "de-AT" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  switch (entry.format) {
    case "percent":
      return `${n(1)} %`;
    case "tb":
      return `${n(1)} TB`;
    case "gb":
      return `${n(1)} GB`;
    case "ratio":
      return `${n(2)}×`;
    case "count":
      return n(0);
  }
}

function trendInfo(entry: QuarterSummaryEntry, locale: "de" | "en") {
  if (entry.previousValue === undefined || entry.previousValue === 0) return null;
  const delta = entry.value - entry.previousValue;
  const pct = (delta / Math.abs(entry.previousValue)) * 100;
  const direction: "up" | "down" = delta >= 0 ? "up" : "down";
  const good = entry.trendGood ? entry.trendGood === direction : null;
  const color = good === null ? GRAY : good ? "#22C55E" : "#DC2626";
  const sign = delta >= 0 ? "+" : "";
  const label = `${sign}${pct.toFixed(1)}%`;
  return { direction, color, label };
}

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 40, fontFamily: "Helvetica", color: INK, fontSize: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 2, borderBottomColor: GOLD, paddingBottom: 12, marginBottom: 20 },
  logo: { width: 90, height: 48, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  headTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: INK, letterSpacing: 1 },
  headSub: { fontSize: 8, color: GOLD, letterSpacing: 2, marginTop: 3 },
  metaBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 26 },
  metaLabel: { fontSize: 8, color: GRAY, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" },
  metaValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: INK },
  sectionHeading: { fontSize: 12, fontFamily: "Helvetica-Bold", color: INK, marginTop: 18, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 4 },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "31.5%", borderWidth: 1, borderColor: LIGHT, padding: 10, marginBottom: 10 },
  tileLabel: { fontSize: 8, color: GRAY, marginBottom: 6 },
  tileValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: INK },
  tileTrendRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  tileTrendLabel: { fontSize: 8, marginLeft: 4 },
  notesBlock: { marginTop: 20, borderWidth: 1, borderColor: LIGHT, padding: 12 },
  notesLabel: { fontSize: 8, color: GRAY, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  notesText: { fontSize: 10, color: INK, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: GOLD, paddingTop: 8, textAlign: "center" },
  footerText: { fontSize: 8, color: GRAY },
  footerTagline: { fontSize: 7, color: GOLD, letterSpacing: 1, marginTop: 3 },
});

function TrendArrow({ direction, color }: { direction: "up" | "down"; color: string }) {
  const d = direction === "up" ? "M0 6 L4 0 L8 6 Z" : "M0 0 L4 6 L8 0 Z";
  return (
    <Svg width={8} height={6} viewBox="0 0 8 6">
      <SvgPath d={d} fill={color} />
    </Svg>
  );
}

export interface ReportDocumentProps {
  locale: "de" | "en";
  customerCompany: string;
  productName: string;
  vendor: string;
  packageLabel?: string;
  periodLabel: string;
  entries: QuarterSummaryEntry[];
  adminNotes?: string;
}

const COPY = {
  de: { title: "QUARTALSBERICHT", sub: "MANAGED SERVICE REPORT", customer: "Kunde", product: "Produkt", period: "Zeitraum", package: "Servicestufe", notes: "Anmerkungen", generatedBy: "Erstellt von Ferrion IT Systemhaus GmbH" },
  en: { title: "QUARTERLY REPORT", sub: "MANAGED SERVICE REPORT", customer: "Customer", product: "Product", period: "Period", package: "Service Tier", notes: "Notes", generatedBy: "Prepared by Ferrion IT Systemhaus GmbH" },
};

export function ReportDocument({ locale, customerCompany, productName, vendor, packageLabel, periodLabel, entries, adminNotes }: ReportDocumentProps) {
  const t = COPY[locale];
  const sections: ReportSection[] = ["availability", "capacity", "security", "operations"];
  const bySection = (s: ReportSection) => entries.filter((e) => e.section === s);

  return (
    <Document title={`${t.title} — ${customerCompany} — ${productName} — ${periodLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Image style={styles.logo} src={LOGO_DATA_URI} />
          <View style={styles.headerRight}>
            <Text style={styles.headTitle}>{t.title}</Text>
            <Text style={styles.headSub}>{t.sub}</Text>
          </View>
        </View>

        <View style={styles.metaBlock}>
          <View>
            <Text style={styles.metaLabel}>{t.customer}</Text>
            <Text style={styles.metaValue}>{customerCompany}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>{t.product}</Text>
            <Text style={styles.metaValue}>{vendor} {productName}</Text>
          </View>
          {packageLabel && (
            <View>
              <Text style={styles.metaLabel}>{t.package}</Text>
              <Text style={styles.metaValue}>{packageLabel}</Text>
            </View>
          )}
          <View>
            <Text style={styles.metaLabel}>{t.period}</Text>
            <Text style={styles.metaValue}>{periodLabel}</Text>
          </View>
        </View>

        {sections.map((section) => {
          const items = bySection(section);
          if (items.length === 0) return null;
          return (
            <View key={section} wrap={false}>
              <Text style={styles.sectionHeading}>{SECTION_LABELS[section][locale]}</Text>
              <View style={styles.tileGrid}>
                {items.map((entry) => {
                  const trend = trendInfo(entry, locale);
                  return (
                    <View key={entry.key} style={styles.tile}>
                      <Text style={styles.tileLabel}>{entry.label[locale]}</Text>
                      <Text style={styles.tileValue}>{formatValue(entry, locale)}</Text>
                      {trend && (
                        <View style={styles.tileTrendRow}>
                          <TrendArrow direction={trend.direction} color={trend.color} />
                          <Text style={{ ...styles.tileTrendLabel, color: trend.color }}>{trend.label}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {adminNotes && (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>{t.notes}</Text>
            <Text style={styles.notesText}>{adminNotes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{t.generatedBy} · info@ferrion.at · ferrion.at</Text>
          <Text style={styles.footerTagline}>build to endure</Text>
        </View>
      </Page>
    </Document>
  );
}
