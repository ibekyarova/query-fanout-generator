import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Query Fan-Out Generator",
  description:
    "Simulate how AI search systems like ChatGPT, Perplexity, and Google AI Mode expand a single query into multiple retrieval sub-queries.",
  keywords: ["AI search", "query expansion", "fan-out", "SEO", "ChatGPT", "Perplexity", "Google AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
