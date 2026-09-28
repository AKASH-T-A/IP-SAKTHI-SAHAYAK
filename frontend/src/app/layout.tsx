import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IP-SAKTI Sahayak — Multilingual IP & Regulatory Intelligence for Ayurveda",
    template: "%s | IP-SAKTI Sahayak",
  },
  description:
    "IP-SAKTI helps Ayurvedic practitioners, researchers, startups and innovators navigate intellectual property and regulatory requirements using multilingual AI and authoritative evidence. SIH26045.",
  keywords: [
    "Ayurveda IP", "Intellectual Property", "Patent", "Trademark", "GI", 
    "AYUSH", "Traditional Knowledge", "ABS", "Regulatory Intelligence",
    "SIH 2026", "IP-SAKTI"
  ],
  authors: [{ name: "IP-SAKTI Team" }],
  robots: "index, follow",
  openGraph: {
    title: "IP-SAKTI Sahayak",
    description: "Multilingual AI-Powered IP & Regulatory Intelligence Platform for Ayurveda",
    type: "website",
  },
};

import LanguageInitializer from "@/components/layout/LanguageInitializer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <LanguageInitializer />
        {children}
      </body>
    </html>
  );
}
