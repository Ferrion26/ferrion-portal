"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type HeroLightSettings,
  DEFAULT_HERO_LIGHT,
  heroLightToCssVars,
} from "@/lib/heroLight";

type Loc = "de" | "en";

const L = {
  de: {
    preview: "Live-Vorschau",
    previewHint: "Spiegelt deine Einstellungen — die echte Startseite zeigt dasselbe Bild.",
    enabled: "Animation aktiv",
    enabledHint: "Aus = ruhiges Standbild mit statischem Licht.",
    sunX: "Sonnen-Position horizontal",
    sunY: "Sonnen-Position vertikal",
    sunSize: "Sonnen-Größe",
    sunIntensity: "Sonnen-Intensität",
    raysIntensity: "Lichtstrahlen-Intensität",
    sunSpeed: "Tempo Sonne (Pulsieren)",
    raysSpeed: "Tempo Lichtstrahlen",
    zoomStrength: "Zoom-Stärke (Ken Burns)",
    zoomSpeed: "Tempo Zoom",
    save: "Speichern",
    saving: "Speichern …",
    saved: "Gespeichert ✓",
    reset: "Auf Standard zurücksetzen",
    error: "Speichern fehlgeschlagen",
    slow: "langsam",
    fast: "schnell",
    left: "links",
    right: "rechts",
    top: "oben",
    bottom: "unten",
    weak: "schwach",
    strong: "stark",
    off: "aus",
  },
  en: {
    preview: "Live preview",
    previewHint: "Mirrors your settings — the real homepage shows the same image.",
    enabled: "Animation enabled",
    enabledHint: "Off = calm still frame with static light.",
    sunX: "Sun position horizontal",
    sunY: "Sun position vertical",
    sunSize: "Sun size",
    sunIntensity: "Sun intensity",
    raysIntensity: "Light rays intensity",
    sunSpeed: "Speed sun (pulse)",
    raysSpeed: "Speed light rays",
    zoomStrength: "Zoom strength (Ken Burns)",
    zoomSpeed: "Speed zoom",
    save: "Save",
    saving: "Saving …",
    saved: "Saved ✓",
    reset: "Reset to default",
    error: "Save failed",
    slow: "slow",
    fast: "fast",
    left: "left",
    right: "right",
    top: "top",
    bottom: "bottom",
    weak: "weak",
    strong: "strong",
    off: "off",
  },
};

type SliderKey = Exclude<keyof HeroLightSettings, "enabled">;

export default function HeroLightForm({ initial, locale }: { initial: HeroLightSettings; locale: Loc }) {
  const t = L[locale];
  const router = useRouter();
  const [s, setS] = useState<HeroLightSettings>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function set<K extends keyof HeroLightSettings>(key: K, value: HeroLightSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  const sliders: { key: SliderKey; label: string; min: number; max: number; step: number; lo: string; hi: string; unit?: string }[] = [
    { key: "sunX", label: t.sunX, min: 0, max: 100, step: 1, lo: t.left, hi: t.right, unit: "%" },
    { key: "sunY", label: t.sunY, min: 0, max: 100, step: 1, lo: t.top, hi: t.bottom, unit: "%" },
    { key: "sunSize", label: t.sunSize, min: 200, max: 1400, step: 20, lo: t.weak, hi: t.strong, unit: "px" },
    { key: "sunIntensity", label: t.sunIntensity, min: 0, max: 1.4, step: 0.05, lo: t.off, hi: t.strong },
    { key: "raysIntensity", label: t.raysIntensity, min: 0, max: 1, step: 0.05, lo: t.off, hi: t.strong },
    { key: "sunSpeed", label: t.sunSpeed, min: 4, max: 60, step: 1, lo: t.fast, hi: t.slow, unit: "s" },
    { key: "raysSpeed", label: t.raysSpeed, min: 4, max: 60, step: 1, lo: t.fast, hi: t.slow, unit: "s" },
    { key: "zoomStrength", label: t.zoomStrength, min: 1, max: 1.3, step: 0.01, lo: t.off, hi: t.strong, unit: "×" },
    { key: "zoomSpeed", label: t.zoomSpeed, min: 10, max: 90, step: 1, lo: t.fast, hi: t.slow, unit: "s" },
  ];

  async function save() {
    setStatus("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/settings/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (res.ok) {
        setStatus("saved");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? t.error);
        setStatus("error");
      }
    } catch {
      setErrorMsg(t.error);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-8">
      {/* Live preview */}
      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">{t.preview}</p>
        <div
          className={`relative h-72 overflow-hidden border border-white/10 rounded ${s.enabled ? "" : "hero-anim-off"}`}
          style={heroLightToCssVars(s)}
        >
          <div className="hero-kenburns absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
          <div className="absolute inset-0 bg-black/55" />
          <div className="hero-sun absolute inset-0 pointer-events-none" />
          <div className="hero-rays absolute inset-0 pointer-events-none" />
          <div className="absolute bottom-4 left-5 z-10">
            <p className="text-white font-bold text-lg drop-shadow">Infrastruktur, die trägt.</p>
            <p className="text-[#c9a84c] font-bold text-lg drop-shadow">Expertise, die überzeugt.</p>
          </div>
        </div>
        <p className="text-gray-600 text-[11px] mt-2">{t.previewHint}</p>
      </div>

      {/* Enabled toggle */}
      <label className="flex items-center justify-between bg-[#111827] border border-white/10 p-5 cursor-pointer">
        <span>
          <span className="text-white text-sm font-bold block">{t.enabled}</span>
          <span className="text-gray-500 text-xs">{t.enabledHint}</span>
        </span>
        <button
          type="button"
          onClick={() => set("enabled", !s.enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${s.enabled ? "bg-[#c9a84c]" : "bg-white/15"}`}
          aria-pressed={s.enabled}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${s.enabled ? "translate-x-6" : ""}`} />
        </button>
      </label>

      {/* Sliders */}
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 bg-[#111827] border border-white/10 p-6">
        {sliders.map((sl) => {
          const val = s[sl.key] as number;
          return (
            <div key={sl.key} className={s.enabled ? "" : "opacity-50"}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-300">{sl.label}</label>
                <span className="text-[#c9a84c] text-xs font-bold tabular-nums">
                  {sl.step < 1 ? val.toFixed(2) : val}{sl.unit ?? ""}
                </span>
              </div>
              <input
                type="range"
                min={sl.min}
                max={sl.max}
                step={sl.step}
                value={val}
                onChange={(e) => set(sl.key, Number(e.target.value) as HeroLightSettings[typeof sl.key])}
                className="w-full accent-[#c9a84c]"
              />
              <div className="flex justify-between text-[9px] text-gray-600 uppercase tracking-wide mt-1">
                <span>{sl.lo}</span>
                <span>{sl.hi}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="bg-[#c9a84c] text-black text-xs font-bold tracking-widest uppercase px-7 py-3 hover:bg-[#e0bc5a] transition-colors disabled:opacity-50"
        >
          {status === "saving" ? t.saving : status === "saved" ? t.saved : t.save}
        </button>
        <button
          onClick={() => { setS(DEFAULT_HERO_LIGHT); setStatus("idle"); }}
          className="text-gray-400 text-xs font-bold tracking-widest uppercase px-5 py-3 border border-white/15 hover:border-white/30 hover:text-white transition-colors"
        >
          {t.reset}
        </button>
        {status === "error" && <span className="text-red-400 text-xs">{errorMsg}</span>}
      </div>
    </div>
  );
}
