import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "React2Shell Scanner - CVE-2025-55182 & CVE-2025-66478 Detector",
  description:
    "Detect critical RCE vulnerabilities (CVE-2025-55182 & CVE-2025-66478) in Next.js applications using React Server Components. Based on Assetnote security research.",
  keywords: [
    "React2Shell",
    "CVE-2025-55182",
    "CVE-2025-66478",
    "Next.js",
    "RCE",
    "vulnerability",
    "scanner",
    "security",
  ],
  authors: [{ name: "Assetnote Security Research Team" }],
  openGraph: {
    title: "React2Shell Scanner",
    description:
      "Detect CVE-2025-55182 & CVE-2025-66478 vulnerabilities in Next.js applications",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "React2Shell Scanner",
    description:
      "Detect CVE-2025-55182 & CVE-2025-66478 vulnerabilities in Next.js applications",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

type Locale = "en" | "zh";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
