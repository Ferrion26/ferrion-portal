"use client";

import { useMemo, useState } from "react";
import { formatValue } from "@/lib/managed-reports/reportFormat";
import type { MetricFormat } from "@/lib/managed-reports/metrics/types";

const GOLD = "#c9a84c";
const WIDTH = 640;
const HEIGHT = 170;
const PAD = { top: 14, right: 14, bottom: 26, left: 44 };

const COPY = {
  de: { table: "Als Tabelle anzeigen", date: "Datum", value: "Wert" },
  en: { table: "Show as table", date: "Date", value: "Value" },
};

function formatDate(iso: string, locale: "de" | "en") {
  return new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-US", { day: "2-digit", month: "2-digit", timeZone: "Europe/Vienna" }).format(new Date(iso));
}

// Anders als CapacityTrendChart (fixe 0–100%-Achse für Cross-Report-
// Vergleichbarkeit) berechnet dieses Diagramm seine Y-Achse eng um die
// tatsächlichen Werte, da hier beliebige Kennzahlen (TB, Zähler, Ratio)
// dargestellt werden. Bewusst KEIN erzwungenes Einschließen der Null (das
// würde bei z. B. einer TB-Kapazität von durchgehend ~690–695 TB die
// gesamte sichtbare Variation auf eine flache Linie nahe dem oberen
// Diagrammrand plätten) — nur ein Puffer von ~10 % über/unter dem
// tatsächlichen Wertebereich, damit die Kurve nicht am Rand klebt.
function computeYRange(values: number[]): [number, number] {
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin;
  const pad = span > 0 ? span * 0.1 : Math.abs(rawMax) * 0.1 || 1;
  return [rawMin - pad, rawMax + pad];
}

export function MetricHistoryChart({
  points,
  format,
  unit,
  locale,
}: {
  points: { recordedAt: string; value: number }[];
  format: MetricFormat;
  unit?: string;
  locale: "de" | "en";
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const t = COPY[locale];

  const fmt = (value: number) => formatValue({ format, value, unit }, locale);

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const [yMin, yMax] = useMemo(() => computeYRange(points.map((p) => p.value)), [points]);

  const coords = useMemo(
    () =>
      points.map((p, i) => ({
        x: PAD.left + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth),
        y: PAD.top + plotHeight * (1 - (p.value - yMin) / (yMax - yMin || 1)),
        ...p,
      })),
    [points, plotWidth, plotHeight, yMin, yMax]
  );

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${PAD.top + plotHeight} L ${coords[0].x.toFixed(2)} ${PAD.top + plotHeight} Z`;

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * plotWidth;
    const ratio = plotWidth === 0 ? 0 : relX / plotWidth;
    const idx = Math.round(ratio * (coords.length - 1));
    setHoverIndex(Math.max(0, Math.min(coords.length - 1, idx)));
  }

  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;
  const tooltipLeft = hovered ? Math.min(Math.max(hovered.x, PAD.left + 55), WIDTH - PAD.right - 55) : 0;

  const gridValues = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div />
        <button type="button" onClick={() => setShowTable((s) => !s)} className="text-[10px] text-gray-500 hover:text-[#c9a84c] underline decoration-dotted shrink-0">
          {t.table}
        </button>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label={t.value}>
          {gridValues.map((g, i) => {
            const y = PAD.top + plotHeight * (1 - (g - yMin) / (yMax - yMin || 1));
            return (
              <g key={i}>
                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">
                  {fmt(g)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={GOLD} opacity={0.08} />
          <path d={linePath} fill="none" stroke={GOLD} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {coords.length <= 60 &&
            coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={2} fill={GOLD} opacity={hoverIndex === i ? 1 : 0.6} />)}

          {hovered && (
            <>
              <line x1={hovered.x} x2={hovered.x} y1={PAD.top} y2={PAD.top + plotHeight} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
              <circle cx={hovered.x} cy={hovered.y} r={3.5} fill="#0b0f17" stroke={GOLD} strokeWidth={2} />
            </>
          )}

          <text x={PAD.left} y={HEIGHT - 6} fontSize={8} fill="#6b7280">
            {formatDate(points[0].recordedAt, locale)}
          </text>
          <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" fontSize={8} fill="#6b7280">
            {formatDate(points[points.length - 1].recordedAt, locale)}
          </text>

          <rect
            x={PAD.left}
            y={PAD.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full bg-[#0b0f17] border border-white/15 px-2.5 py-1.5 pointer-events-none text-[10px] whitespace-nowrap"
            style={{ left: `${(tooltipLeft / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
          >
            <p className="text-gray-400">{formatDate(hovered.recordedAt, locale)}</p>
            <p className="text-white font-semibold">{fmt(hovered.value)}</p>
          </div>
        )}
      </div>

      {showTable && (
        <table className="w-full text-[10px] mt-3 border-t border-white/10 pt-2">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="font-medium py-1">{t.date}</th>
              <th className="font-medium py-1">{t.value}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-1 text-gray-400">{formatDate(p.recordedAt, locale)}</td>
                <td className="py-1 text-white">{fmt(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
