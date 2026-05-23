import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechWing AI Tutor — AI-Powered Education Platform",
  description:
    "The future of education is here. TechWing AI Tutor is an AI-powered learning ecosystem for schools, students, parents, and teachers. Replace traditional tuition with intelligent, adaptive learning.",
  keywords: [
    "AI tutor",
    "education platform",
    "online learning",
    "school management",
    "AI education",
    "smart learning",
    "edtech",
  ],
  authors: [{ name: "TechWing" }],
  openGraph: {
    title: "TechWing AI Tutor",
    description: "AI-Powered Education Platform for Schools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
