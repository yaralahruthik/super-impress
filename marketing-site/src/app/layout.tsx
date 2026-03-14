import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://superimpress.com"),
  title: {
    default: "SuperImpress | Minimal-Text Carousel Generation",
    template: "%s | SuperImpress",
  },
  description:
    "SuperImpress helps creators turn pasted content into minimal-text carousel drafts with stronger sequencing and visual cues.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    description:
      "Generate slide-by-slide carousel drafts from any pasted content without bloated content workflows.",
    siteName: "SuperImpress",
    title: "SuperImpress",
    type: "website",
    url: "https://superimpress.com",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Minimal-text carousel generation for creators who want sharper visual storytelling.",
    title: "SuperImpress",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          data-domain="superimpress.com"
          defer
          src="https://plausible.withyhr.com/js/script.outbound-links.tagged-events.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {
            "window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }"
          }
        </Script>
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
