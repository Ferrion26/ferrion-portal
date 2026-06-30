import { getLocale } from "@/lib/i18n";
import BeratungClient from "./BeratungClient";

export const dynamic = "force-dynamic";

export default function BeratungPage() {
  const locale = getLocale();
  return <BeratungClient locale={locale} />;
}
