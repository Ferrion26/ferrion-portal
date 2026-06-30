import { cookies } from "next/headers";
import BeratungClient from "./BeratungClient";
import { type Locale } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default function BeratungPage() {
  const locale = (cookies().get("locale")?.value === "en" ? "en" : "de") as Locale;
  return <BeratungClient locale={locale} />;
}
