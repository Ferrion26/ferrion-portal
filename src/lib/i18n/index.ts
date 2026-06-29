import { cookies } from "next/headers";
import { translations, type Locale } from "./translations";

export function getLocale(): Locale {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "en" ? "en" : "de";
}

export function getT() {
  const locale = getLocale();
  return translations[locale];
}

export { translations, type Locale };
