import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Client Portal | Romero Digital Labs",
    template: "%s | Romero Digital Labs Portal",
  },
  description: "Romero Digital Labs client project portal — status, files, feedback, billing, and support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
