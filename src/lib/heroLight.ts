// Client-safe hero light helpers (NO server/prisma imports — used in both
// client components and the server-only settings module).

export type HeroLightSettings = {
  enabled: boolean;
  sunX: number;        // glow centre, % from left
  sunY: number;        // glow centre, % from top
  sunSize: number;     // glow radius in px
  sunIntensity: number; // peak opacity of the sun glow (0–1.4)
  raysIntensity: number; // peak opacity of the god-rays (0–1)
  sunSpeed: number;    // sun pulse duration in seconds
  raysSpeed: number;   // rays pulse duration in seconds
  zoomStrength: number; // max Ken Burns scale (1.0 = off)
  zoomSpeed: number;   // Ken Burns duration in seconds
};

// Stronger defaults than the original — sun visibly breaks through.
export const DEFAULT_HERO_LIGHT: HeroLightSettings = {
  enabled: true,
  sunX: 62,
  sunY: 28,
  sunSize: 720,
  sunIntensity: 1.15,
  raysIntensity: 0.55,
  sunSpeed: 14,
  raysSpeed: 10,
  zoomStrength: 1.14,
  zoomSpeed: 36,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Sanitise/merge a partial settings object onto the defaults. */
export function normalizeHeroLight(input: Partial<HeroLightSettings> | null | undefined): HeroLightSettings {
  const d = DEFAULT_HERO_LIGHT;
  const v = input ?? {};
  return {
    enabled: typeof v.enabled === "boolean" ? v.enabled : d.enabled,
    sunX: clamp(Number(v.sunX ?? d.sunX), 0, 100),
    sunY: clamp(Number(v.sunY ?? d.sunY), 0, 100),
    sunSize: clamp(Number(v.sunSize ?? d.sunSize), 200, 1400),
    sunIntensity: clamp(Number(v.sunIntensity ?? d.sunIntensity), 0, 1.4),
    raysIntensity: clamp(Number(v.raysIntensity ?? d.raysIntensity), 0, 1),
    sunSpeed: clamp(Number(v.sunSpeed ?? d.sunSpeed), 4, 60),
    raysSpeed: clamp(Number(v.raysSpeed ?? d.raysSpeed), 4, 60),
    zoomStrength: clamp(Number(v.zoomStrength ?? d.zoomStrength), 1, 1.3),
    zoomSpeed: clamp(Number(v.zoomSpeed ?? d.zoomSpeed), 10, 90),
  };
}

/** Turn settings into the CSS custom properties the hero classes consume. */
export function heroLightToCssVars(s: HeroLightSettings): React.CSSProperties {
  return {
    ["--hero-sun-x" as string]: `${s.sunX}%`,
    ["--hero-sun-y" as string]: `${s.sunY}%`,
    ["--hero-sun-size" as string]: `${s.sunSize}px`,
    ["--hero-sun-op-max" as string]: `${s.sunIntensity}`,
    ["--hero-sun-op-min" as string]: `${Math.max(0, s.sunIntensity * 0.4)}`,
    ["--hero-rays-op-max" as string]: `${s.raysIntensity}`,
    ["--hero-rays-op-min" as string]: `${Math.max(0, s.raysIntensity * 0.35)}`,
    ["--hero-sun-dur" as string]: `${s.sunSpeed}s`,
    ["--hero-rays-dur" as string]: `${s.raysSpeed}s`,
    ["--hero-zoom-scale" as string]: `${s.zoomStrength}`,
    ["--hero-zoom-dur" as string]: `${s.zoomSpeed}s`,
  };
}
