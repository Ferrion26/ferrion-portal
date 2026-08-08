import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";
import ScrollToTop from "@/components/ui/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferrion.at";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
    template: "%s",
  },
  description:
    "Ferrion IT Systemhaus Wien: Storage, Backup & Security, AI-Infrastruktur und Managed Services. Zertifizierter Partner von Huawei, Everpure und Commvault.",
  keywords: [
    "IT Systemhaus Wien", "Storage", "Backup", "NIS2", "AI Infrastruktur",
    "Managed Services", "Everpure", "Huawei", "Commvault", "NVIDIA",
  ],
  authors: [{ name: "Ferrion IT Systemhaus" }],
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: SITE_URL,
    siteName: "Ferrion IT Systemhaus",
    title: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
    description:
      "Storage, Backup & Security, AI-Infrastruktur und Managed Services aus Wien. Zertifizierter Partner von Huawei, Everpure und Commvault.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Ferrion IT Systemhaus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
    description: "Storage, Backup & Security, AI-Infrastruktur und Managed Services aus Wien.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ferrion IT Systemhaus",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/ferrion-full.webp`,
  description:
    "Inhabergeführtes IT-Systemhaus mit Fokus auf Infrastruktur, Datenbank-Expertise und Managed Services.",
  email: "info@ferrion.at",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Wien",
    addressCountry: "AT",
  },
  areaServed: "AT",
  knowsAbout: ["Storage", "Backup", "NIS2", "AI Infrastructure", "Managed Services", "Database Services"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preload" as="image" href="/images/hero.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <ScrollToTop />
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ac4ebcfc-04ba-4ea7-aa88-6ec8a2ef6384"
          strategy="afterInteractive"
        />
        <Analytics />
      </body>
    </html>
  );
}
