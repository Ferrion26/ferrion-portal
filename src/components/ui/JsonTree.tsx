"use client";

import { useState } from "react";

// Rekursive, aufklappbare Darstellung beliebiger JSON-Werte — für den
// Rohdaten-Browser (RawDataViewer), der den vollen Ingestion-Payload
// (inkl. meta.rawEndpoints) anzeigt. Bewusst ohne npm-Abhängigkeit, da im
// Projekt bisher keine JSON-Baum-Bibliothek verwendet wird.
export function JsonTree({ data, filter = "" }: { data: unknown; filter?: string }) {
  return (
    <div className="text-xs font-mono leading-relaxed">
      <JsonNode label={null} value={data} depth={0} filter={filter.trim().toLowerCase()} />
    </div>
  );
}

function subtreeMatches(value: unknown, filter: string): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object") {
    return String(value).toLowerCase().includes(filter);
  }
  if (Array.isArray(value)) {
    return value.some((v) => subtreeMatches(v, filter));
  }
  return Object.entries(value as Record<string, unknown>).some(
    ([k, v]) => k.toLowerCase().includes(filter) || subtreeMatches(v, filter)
  );
}

function highlight(text: string, filter: string) {
  if (!filter) return text;
  const idx = text.toLowerCase().indexOf(filter);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#c9a84c]/40 text-white rounded-sm">{text.slice(idx, idx + filter.length)}</mark>
      {text.slice(idx + filter.length)}
    </>
  );
}

function formatPrimitive(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

function primitiveClass(value: unknown): string {
  if (value === null || value === undefined) return "text-gray-600";
  if (typeof value === "string") return "text-green-400";
  if (typeof value === "number") return "text-blue-400";
  if (typeof value === "boolean") return "text-purple-400";
  return "text-gray-300";
}

function JsonNode({ label, value, depth, filter }: { label: string | null; value: unknown; depth: number; filter: string }) {
  // Ohne Filter: nur Tiefe 0/1 standardmäßig aufgeklappt. Mit Filter:
  // Verzweigungen ohne Treffer werden ganz ausgeblendet statt nur
  // eingeklappt, Treffer werden immer vollständig aufgeklappt gezeigt.
  const [manualExpanded, setManualExpanded] = useState(depth <= 1);

  if (value === null || typeof value !== "object") {
    if (filter && !(label ?? "").toLowerCase().includes(filter) && !String(value).toLowerCase().includes(filter)) {
      return null;
    }
    return (
      <div className="py-0.5 pl-4">
        {label !== null && <span className="text-gray-500">{highlight(label, filter)}: </span>}
        <span className={primitiveClass(value)}>{highlight(formatPrimitive(value), filter)}</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries: [string, unknown][] = isArray
    ? value.map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>);

  if (filter && !subtreeMatches(value, filter)) return null;
  const expanded = filter ? true : manualExpanded;

  return (
    <div className="pl-4">
      <button
        type="button"
        onClick={() => setManualExpanded((e) => !e)}
        className="flex items-center gap-1.5 py-0.5 text-gray-400 hover:text-white"
      >
        <span className="inline-block w-3 text-gray-600">{expanded ? "▾" : "▸"}</span>
        {label !== null && <span className="text-gray-500">{highlight(label, filter)}:</span>}
        <span className="text-gray-600">{isArray ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
      {expanded && (
        <div>
          {entries.map(([k, v]) => (
            <JsonNode key={k} label={k} value={v} depth={depth + 1} filter={filter} />
          ))}
          {entries.length === 0 && <div className="pl-4 py-0.5 text-gray-600">— leer —</div>}
        </div>
      )}
    </div>
  );
}
