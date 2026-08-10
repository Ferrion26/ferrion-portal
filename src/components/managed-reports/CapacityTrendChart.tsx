"use client";

import { useMemo, useState } from "react";
import { daysToThreshold, trendGrowthPerDay } from "@/lib/managed-reports/reportFormat";

const GOLD = "#c9a84c";
const WIDTH = 640;
const HEIGHT = 170;
const PAD = { top: 14, right: 14, bottom: 26, left: 32 };

const COPY = {
  de: {
    title: "Kapazitätsverlauf",
    sub: "Füllgrad Storage Pool über den Berichtszeitraum",
    table: "Als Tabelle anzeigen",
    date: "Datum",
    value: "Füllgrad",
    daysTo: (d: number, pct: number) => `> ${d} Tage bis ${pct} %`,
    growthLabel: "Ø Wachstum",
  },
  en: {
    title: "Capacity Trend",
    sub: "Storage pool fill level over the reporting period",
    table: "Show as table",
    date: "Date",
    value: "Fill Level",
    daysTo: (d: number, pct: number) => `> ${d} days to reach ${pct}%`,
    growthLabel: "Avg. growth",
  },
};

function formatGrowthRate(perDay: number, locale: "de" | "en") {
  const sign = perDay >= 0 ? "+" : "";
  return `${sign}${perDay.toLocaleString(locale === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 2 })} %/${locale === "de" ? "Tag" : "day"}`;
}

function formatDate(iso: string, locale: "de" | "en") {
  return new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-US", { day: "2-digit", month: "2-digit", timeZone: "Europe/Vienna" }).format(new Date(iso));
}

// Füllgrad ist immer ein Prozentwert (0–100) — feste Y-Achse statt
// dynamischem Min/Max, damit die Kurve über mehrere Berichte hinweg optisch
// vergleichbar bleibt und die Schwellenlinien (80 %/100 %) an derselben
// Stelle liegen wie im Huawei DeviceManager-Original.
const Y_MIN = 0;
const Y_MAX = 100;

export function CapacityTrendChart({ points, locale }: { points: { recordedAt: string; value: number }[]; locale: "de" | "en" }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const t = COPY[locale];

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const coords = useMemo(
    () =>
      points.map((p, i) => ({
        x: PAD.left + (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth),
        y: PAD.top + plotHeight * (1 - (Math.max(Y_MIN, Math.min(Y_MAX, p.value)) - Y_MIN) / (Y_MAX - Y_MIN)),
        ...p,
      })),
    [points, plotWidth, plotHeight]
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

  const days80 = daysToThreshold(points, 80);
  const days100 = daysToThreshold(points, 100);
  const growth = trendGrowthPerDay(points);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div>
          <h4 className="text-xs font-semibold text-white">{t.title}</h4>
          <p className="text-[10px] text-gray-500">{t.sub}</p>
        </div>
        <button type="button" onClick={() => setShowTable((s) => !s)} className="text-[10px] text-gray-500 hover:text-[#c9a84c] underline decoration-dotted shrink-0">
          {t.table}
        </button>
      </div>

      {(days80 !== null || days100 !== null || growth !== null) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3">
          {days80 !== null && <p className="text-sm font-bold text-white">{t.daysTo(days80, 80)}</p>}
          {days100 !== null && <p className="text-sm font-bold text-white">{t.daysTo(days100, 100)}</p>}
          {growth !== null && (
            <p className="text-sm font-bold text-white">
              {t.growthLabel}: {formatGrowthRate(growth, locale)}
            </p>
          )}
        </div>
      )}

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label={`${t.title}: ${t.sub}`}>
          {[0, 50, 100].map((g) => {
            const y = PAD.top + plotHeight * (1 - g / 100);
            return (
              <g key={g}>
                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">
                  {g}%
                </text>
              </g>
            );
          })}
          {/* Warnschwelle wie im Huawei DeviceManager (80 % Füllgrad) — die
              100%-Linie fällt mit der oberen Achsenbeschriftung zusammen. */}
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={PAD.top + plotHeight * 0.2} y2={PAD.top + plotHeight * 0.2} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />

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
            <p className="text-white font-semibold">{hovered.value.toLocaleString(locale === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 1 })} %</p>
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
                <td className="py-1 text-white">{p.value.toLocaleString(locale === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 1 })} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
