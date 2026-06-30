import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { getHeroLight } from "@/lib/settings";
import HeroLightForm from "./HeroLightForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const locale = getLocale();
  const settings = await getHeroLight();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {locale === "de" ? "Einstellungen" : "Settings"}
        </h1>
        <p className="text-gray-400 text-sm">
          {locale === "de"
            ? "Hero-Hintergrund: Sonnenlicht-Animation der Startseite steuern."
            : "Hero background: control the homepage sunlight animation."}
        </p>
      </div>
      <HeroLightForm initial={settings} locale={locale} />
    </div>
  );
}
