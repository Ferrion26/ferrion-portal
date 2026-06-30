import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferrion.at";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
    template: "%s",
  },
  description:
    "Ferrion IT Systemhaus Wien: Storage, Backup & Security, AI-Infrastruktur und Managed Services. Zertifizierter Partner von Huawei, Pure Storage und Commvault.",
  keywords: [
    "IT Systemhaus Wien", "Storage", "Backup", "NIS2", "AI Infrastruktur",
    "Managed Services", "Pure Storage", "Huawei", "Commvault", "NVIDIA",
  ],
  authors: [{ name: "Ferrion IT Systemhaus" }],
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: SITE_URL,
    siteName: "Ferrion IT Systemhaus",
    title: "Ferrion IT Systemhaus — Infrastruktur, die trägt.",
    description:
      "Storage, Backup & Security, AI-Infrastruktur und Managed Services aus Wien. Zertifizierter Partner von Huawei, Pure Storage und Commvault.",
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
  logo: `${SITE_URL}/logos/ferrion.svg`,
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
      </body>
    </html>
  );
}
