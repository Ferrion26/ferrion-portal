import BeratungClient from "./BeratungClient";
import { type Locale } from "@/lib/i18n/translations";
import { resolveLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SP = { searchParams: { [key: string]: string | string[] | undefined } };

export function generateMetadata({ searchParams }: SP) {
  return pageMetadata({
    path: "/beratung",
    locale: resolveLocale(searchParams),
    titleDe: "Beratung anfragen — Ferrion IT Systemhaus",
    titleEn: "Request Consultation — Ferrion IT Systems House",
    descDe: "Fordern Sie eine unverbindliche Beratung an: Storage, Backup & Security, AI-Infrastruktur und Managed Services vom IT-Systemhaus aus Wien.",
    descEn: "Request a no-obligation consultation: storage, backup & security, AI infrastructure and managed services from the IT systems house in Vienna.",
  });
}

export default function BeratungPage({ searchParams }: SP) {
  const locale: Locale = resolveLocale(searchParams);
  return <BeratungClient locale={locale} />;
}
