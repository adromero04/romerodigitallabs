import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Client Portal | Romero Digital Labs",
    template: "%s | Romero Digital Labs Portal",
  },
  description: "Romero Digital Labs client project portal — status, files, feedback, billing, and support.",
  icons: {
    icon: [
      { url: "/img/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/img/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/img/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/img/favicons/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
