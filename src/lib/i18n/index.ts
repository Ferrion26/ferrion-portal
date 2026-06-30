import { cookies } from "next/headers";
import { translations, type Locale } from "./translations";

export function getLocale(): Locale {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "en" ? "en" : "de";
}

type SearchParams = { [key: string]: string | string[] | undefined } | undefined;

/**
 * Resolve the active locale, giving precedence to an explicit `?lang=` query
 * param (so search engines can crawl a distinct English URL) and otherwise
 * falling back to the visitor's `locale` cookie.
 */
export function resolveLocale(searchParams?: SearchParams): Locale {
  const raw = searchParams?.lang;
  const lang = Array.isArray(raw) ? raw[0] : raw;
  if (lang === "en") return "en";
  if (lang === "de") return "de";
  return getLocale();
}

export function getT() {
  const locale = getLocale();
  return translations[locale];
}

export { translations, type Locale };
