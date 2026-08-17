import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "M & P Greasey Clean Up Inc — Grease & Degreasing Specialists | Wilkes-Barre, PA",
  description:
    "Commercial & industrial grease removal serving Wilkes-Barre and Northeastern Pennsylvania since 2002. Kitchen degreasing, grease trap & interceptor cleaning, exhaust hood & duct cleaning, pressure washing, and scheduled maintenance plans. Call (570) 825-5403.",
  openGraph: {
    title: "M & P Greasey Clean Up Inc — Grease Down. Standards Up.",
    description:
      "Commercial kitchen degreasing, grease trap cleaning, hood & duct cleaning, and industrial degreasing across Northeastern Pennsylvania. Get a straightforward quote — call (570) 825-5403.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
