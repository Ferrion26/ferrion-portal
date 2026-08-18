// Baut das Systemdokumentations-Word-Dokument über die docx-Bibliothek
// (dolanmiu/docx). Anders als ReportDocument.tsx (React-PDF, komponenten-
// basiert) ist die docx-API rein objektbasiert — kein JSX. Bewusst schlicht
// gehalten (Überschriften + Tabellen), damit das Ergebnis in Word
// tatsächlich weiterbearbeitbar bleibt (kein "Bild eines Dokuments").
import fs from "fs";
import path from "path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

// Dasselbe Logo, das ReportDocument.tsx für die PDF-Berichte einbettet
// (siehe dort LOGO_DATA_URI) — docx braucht den rohen Buffer, kein Data-URI.
const LOGO_BUFFER = fs.readFileSync(path.join(process.cwd(), "scripts", "assets", "ferrion-logo-light.png"));

const GOLD = "C9A84C";
const INK = "1A1A1A";
const MUTED = "666666";
const BORDER_COLOR = "D9D9D9";

export interface NetworkPortEntry {
  name: string;
  ip?: string;
  mask?: string;
  gateway?: string;
  mac?: string;
  mtu?: number;
  bondName?: string;
  purpose?: string;
  speedMbps?: number;
  healthy: boolean;
}

export interface ClientEntry {
  name: string;
  environmentName?: string;
  ip?: string;
  osType?: string;
  type?: string;
  protectionStatus?: string;
  slaCompliant?: boolean;
  parentName?: string;
}

export interface ComponentCheckEntry {
  category: string;
  id: string;
  description: string;
  ok: boolean;
  group?: string;
}

export interface CapacityBreakdownEntry {
  name: string;
  localUsedTB: number;
  localTotalTB: number;
  cloudUsedTB?: number;
  cloudTarget?: string;
}

export interface VolumeOverviewEntry {
  name: string;
  svm: string;
  aggregate: string;
  state: string;
  usedTB: number;
  totalTB: number;
}

export interface LunOverviewEntry {
  id: string;
  name: string;
  healthStatus: string;
  capacityTB: number;
  allocatedTB?: number;
  mapped: boolean;
  initiators?: { type: string; name: string; hostName?: string }[];
}

export interface ResourceBreakdownEntry {
  resourceType: string;
  protectedCount: number;
  unprotectedCount: number;
}

export interface TopJobFailuresEntry {
  bySla: { name: string; failedCount: number }[];
  byResource: { name: string; failedCount: number }[];
}

export interface SystemDocumentationData {
  customerCompany: string;
  productName: string;
  vendor: string;
  packageLabel?: string;
  deviceName?: string;
  deviceModel?: string;
  deviceSerialNumber?: string;
  deviceSoftwareVersion?: string;
  location?: string;
  lifecycleStatus?: "ACTIVE" | "PHASING_OUT" | "END_OF_LIFE";
  lifecycleEndDate?: Date;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
  componentChecks?: ComponentCheckEntry[];
  capacityBreakdown?: CapacityBreakdownEntry[];
  volumes?: VolumeOverviewEntry[];
  luns?: LunOverviewEntry[];
  networkPorts?: NetworkPortEntry[];
  resourceBreakdown?: ResourceBreakdownEntry[];
  topJobFailures?: TopJobFailuresEntry;
  backupMetrics?: { label: string; value: string }[];
  clients?: ClientEntry[];
  generatedAt: Date;
}

const LIFECYCLE_LABELS: Record<string, string> = {
  ACTIVE: "Aktiv",
  PHASING_OUT: "Auslaufend",
  END_OF_LIFE: "End-of-Life",
};

function fmtDate(d?: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
}

function fmtTB(v: number): string {
  return `${v.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} TB`;
}

function h1(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
}

function h2(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
}

function bodyText(text: string, opts: { color?: string; bold?: boolean; size?: number } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, color: opts.color ?? MUTED, bold: opts.bold, size: opts.size ?? 20 })],
    spacing: { after: 120 },
  });
}

const CELL_BORDER = { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR };
const CELL_BORDERS = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER };

function headerCell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })] })],
    shading: { type: ShadingType.SOLID, color: INK, fill: INK },
    borders: CELL_BORDERS,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });
}

function dataCell(text: string, opts: { color?: string } = {}): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: text || "—", color: opts.color ?? INK, size: 18 })] })],
    borders: CELL_BORDERS,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

// Zwei-Spalten-Tabelle (Label/Wert) für Stammdaten-Abschnitte.
function kvTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18 })] })],
              borders: CELL_BORDERS,
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
            }),
            dataCell(value),
          ],
        })
    ),
  });
}

// Generische Datentabelle mit Kopfzeile — Zeilen bereits als Strings
// vorformatiert (kein generisches Formatierungs-Framework nötig für eine
// Handvoll Tabellen).
function dataTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((h) => headerCell(h)), tableHeader: true }),
      ...rows.map((row) => new TableRow({ children: row.map((cell) => dataCell(cell)) })),
    ],
  });
}

function coverPage(data: SystemDocumentationData): (Paragraph | Table)[] {
  return [
    new Paragraph({
      children: [new ImageRun({ data: LOGO_BUFFER, transformation: { width: 160, height: 84 }, type: "png" })],
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Systemdokumentation", bold: true, size: 56, color: INK })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `${data.vendor} ${data.productName}`, size: 32, color: GOLD, bold: true })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.customerCompany, size: 26, color: INK })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Erstellt am ${fmtDate(data.generatedAt)}`, size: 20, color: MUTED })],
      spacing: { after: 800 },
    }),
  ];
}

function overviewSection(data: SystemDocumentationData): (Paragraph | Table)[] {
  const rows: [string, string][] = [
    ["Kunde", data.customerCompany],
    ["Produkt", `${data.vendor} ${data.productName}`],
    ...(data.packageLabel ? ([["Paket", data.packageLabel]] as [string, string][]) : []),
    ["Gerätename", data.deviceName ?? "—"],
    ["Modell", data.deviceModel ?? "—"],
    ["Seriennummer", data.deviceSerialNumber ?? "—"],
    ["Software-Version", data.deviceSoftwareVersion ?? "—"],
    ["Standort", data.location ?? "—"],
    [
      "Lebenszyklus",
      data.lifecycleStatus
        ? `${LIFECYCLE_LABELS[data.lifecycleStatus]}${data.lifecycleEndDate ? ` (EOL: ${fmtDate(data.lifecycleEndDate)})` : ""}`
        : "—",
    ],
    [
      "Ansprechpartner",
      data.contactName
        ? [data.contactName, data.contactRole, data.contactEmail, data.contactPhone].filter(Boolean).join(" · ")
        : "—",
    ],
  ];
  return [h1("1. Übersicht"), kvTable(rows)];
}

function aufbauSection(data: SystemDocumentationData): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [h1("2. Aufbau")];
  let any = false;

  if (data.componentChecks && data.componentChecks.length > 0) {
    any = true;
    out.push(h2("Komponenten"));
    out.push(
      dataTable(
        ["Kategorie", "Gehäuse", "Bezeichnung", "Zustand"],
        data.componentChecks
          .slice(0, 300)
          .map((c) => [c.category, c.group ?? "—", c.id, c.ok ? "OK" : c.description])
      )
    );
  }

  if (data.capacityBreakdown && data.capacityBreakdown.length > 0) {
    any = true;
    out.push(h2("Kapazität je Pool/Aggregat"));
    out.push(
      dataTable(
        ["Name", "Genutzt", "Gesamt", "Cloud-Ziel"],
        data.capacityBreakdown.map((c) => [
          c.name,
          fmtTB(c.localUsedTB),
          fmtTB(c.localTotalTB),
          c.cloudTarget ? `${c.cloudTarget} (${fmtTB(c.cloudUsedTB ?? 0)})` : "—",
        ])
      )
    );
  }

  if (data.volumes && data.volumes.length > 0) {
    any = true;
    out.push(h2("Volumes"));
    out.push(
      dataTable(
        ["Volume", "SVM", "Aggregat", "Zustand", "Genutzt", "Gesamt"],
        data.volumes.map((v) => [v.name, v.svm, v.aggregate, v.state, fmtTB(v.usedTB), fmtTB(v.totalTB)])
      )
    );
  }

  if (data.luns && data.luns.length > 0) {
    any = true;
    out.push(h2("LUNs"));
    out.push(
      dataTable(
        ["LUN", "Zustand", "Kapazität", "Gemappt"],
        data.luns.map((l) => [l.name, l.healthStatus, fmtTB(l.capacityTB), l.mapped ? "Ja" : "Nein"])
      )
    );
  }

  if (!any) out.push(bodyText("Keine Aufbau-Daten vorhanden."));
  return out;
}

function netzwerkSection(data: SystemDocumentationData): (Paragraph | Table)[] {
  if (!data.networkPorts || data.networkPorts.length === 0) return [];
  return [
    h1("3. Netzwerk"),
    dataTable(
      ["Port/Interface", "IP-Adresse", "Maske", "Gateway", "MAC", "MTU", "Zweck", "Status"],
      data.networkPorts.map((p) => [
        p.name,
        p.ip ?? "—",
        p.mask ?? "—",
        p.gateway ?? "—",
        p.mac ?? "—",
        p.mtu !== undefined ? String(p.mtu) : "—",
        p.purpose ?? "—",
        p.healthy ? "OK" : "Fehlerhaft",
      ])
    ),
  ];
}

function backupSection(data: SystemDocumentationData): (Paragraph | Table)[] {
  const hasResourceBreakdown = data.resourceBreakdown && data.resourceBreakdown.length > 0;
  const hasFailures =
    data.topJobFailures && (data.topJobFailures.bySla.length > 0 || data.topJobFailures.byResource.length > 0);
  const hasMetrics = data.backupMetrics && data.backupMetrics.length > 0;
  if (!hasResourceBreakdown && !hasFailures && !hasMetrics) return [];

  const out: (Paragraph | Table)[] = [h1("4. Backup")];

  if (hasMetrics) {
    out.push(h2("Kennzahlen"));
    out.push(kvTable(data.backupMetrics!.map((m) => [m.label, m.value] as [string, string])));
  }

  if (hasResourceBreakdown) {
    out.push(h2("Ressourcen nach Typ"));
    out.push(
      dataTable(
        ["Typ", "Geschützt", "Ungeschützt"],
        data.resourceBreakdown!.map((r) => [r.resourceType, String(r.protectedCount), String(r.unprotectedCount)])
      )
    );
  }

  if (hasFailures) {
    if (data.topJobFailures!.bySla.length > 0) {
      out.push(h2("Häufigste Fehlschläge je SLA-Richtlinie"));
      out.push(dataTable(["SLA-Richtlinie", "Fehlschläge"], data.topJobFailures!.bySla.map((f) => [f.name, String(f.failedCount)])));
    }
    if (data.topJobFailures!.byResource.length > 0) {
      out.push(h2("Häufigste Fehlschläge je Ressource"));
      out.push(dataTable(["Ressource", "Fehlschläge"], data.topJobFailures!.byResource.map((f) => [f.name, String(f.failedCount)])));
    }
  }

  return out;
}

function clientsSection(data: SystemDocumentationData): (Paragraph | Table)[] {
  if (!data.clients || data.clients.length === 0) return [];
  return [
    h1("5. Clients"),
    dataTable(
      ["Name", "Umgebung", "IP", "OS", "Typ", "Schutzstatus", "SLA-konform", "Übergeordnete Ressource"],
      data.clients.map((c) => [
        c.name,
        c.environmentName ?? "—",
        c.ip ?? "—",
        c.osType ?? "—",
        c.type ?? "—",
        c.protectionStatus ?? "—",
        c.slaCompliant === undefined ? "—" : c.slaCompliant ? "Ja" : "Nein",
        c.parentName ?? "—",
      ])
    ),
  ];
}

export function buildSystemDocumentationDocx(data: SystemDocumentationData): Document {
  const children: (Paragraph | Table)[] = [
    ...coverPage(data),
    ...overviewSection(data),
    ...aufbauSection(data),
    ...netzwerkSection(data),
    ...backupSection(data),
    ...clientsSection(data),
  ];

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: INK },
        },
      },
    },
  });
}
