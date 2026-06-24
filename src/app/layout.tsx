import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "AJM Events — Homecoming 2026",
  description: "You're invited. RSVP for Homecoming 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
