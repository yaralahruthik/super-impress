import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
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
    default: "SuperImpress | Human-first LinkedIn Writing and Scheduling",
    template: "%s | SuperImpress",
  },
  description:
    "SuperImpress helps LinkedIn creators write consistently with a minimal, author-first workflow.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    description:
      "A minimal interface to write, save, and schedule LinkedIn posts without bloated workflows.",
    siteName: "SuperImpress",
    title: "SuperImpress",
    type: "website",
    url: "https://superimpress.com",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Author-first LinkedIn writing and scheduling with a clean, minimal workflow.",
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
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
