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
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        {children}
        <footer style={{ textAlign: "center", padding: "1.5rem 0 2rem", opacity: 0.35, fontSize: "0.7rem", letterSpacing: "0.08em", userSelect: "none" }}>
          <a href="https://ajmevents.co" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
            powered by AJM Events
          </a>
        </footer>
      </body>
    </html>
  );
}
