import { prisma } from "@/lib/prisma";
import {
  type HeroLightSettings,
  DEFAULT_HERO_LIGHT,
  normalizeHeroLight,
} from "@/lib/heroLight";

export {
  type HeroLightSettings,
  DEFAULT_HERO_LIGHT,
  normalizeHeroLight,
  heroLightToCssVars,
} from "@/lib/heroLight";

const KEY = "heroLight";

/** Read hero light settings. Falls back to defaults if the table/row is missing. */
export async function getHeroLight(): Promise<HeroLightSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    if (!row) return DEFAULT_HERO_LIGHT;
    return normalizeHeroLight(row.value as Partial<HeroLightSettings>);
  } catch {
    // Table not migrated yet, or DB unreachable — degrade gracefully.
    return DEFAULT_HERO_LIGHT;
  }
}

/** Persist hero light settings (admin only — caller must authorise). */
export async function saveHeroLight(input: Partial<HeroLightSettings>): Promise<HeroLightSettings> {
  const normalized = normalizeHeroLight(input);
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: normalized },
    update: { value: normalized },
  });
  return normalized;
}

const COLLECTOR_BASELINE_KEY = "collectorBaseline";

/** Global minimum collector version (see collector/version.js) — null = keine Baseline gesetzt, keine Warnungen. */
export async function getCollectorBaseline(): Promise<string | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: COLLECTOR_BASELINE_KEY } });
    const value = row?.value as { minVersion?: string } | undefined;
    return value?.minVersion || null;
  } catch {
    return null;
  }
}

/** Persist die globale Collector-Baseline (admin only — caller must authorise). null löscht sie wieder. */
export async function saveCollectorBaseline(minVersion: string | null): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: COLLECTOR_BASELINE_KEY },
    create: { key: COLLECTOR_BASELINE_KEY, value: { minVersion } },
    update: { value: { minVersion } },
  });
}
