import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const description =
  "Custom commercial lightbox signs for WA shopfronts, hospitality venues, service sites, and petrol station signage projects.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Commercial Lightbox | Custom Lightbox Signs in WA",
    template: `%s | ${siteName}`,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Commercial Lightbox | Custom Lightbox Signs in WA",
    description,
    siteName,
    locale: "en_AU",
    type: "website",
    url: "/",
    images: [
      {
        url: "/images/commercial-lightbox-hero.png",
        width: 1680,
        height: 960,
        alt: "Illuminated custom commercial lightbox sign on a modern shopfront",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Lightbox | Custom Lightbox Signs in WA",
    description,
    images: ["/images/commercial-lightbox-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
