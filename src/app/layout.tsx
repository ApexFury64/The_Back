import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Tutor — AI-Powered Education Platform",
  description:
    "The future of education is here. AI Tutor is an AI-powered learning ecosystem for schools, students, parents, and teachers. Replace traditional tuition with intelligent, adaptive learning.",
  keywords: [
    "AI tutor",
    "education platform",
    "online learning",
    "school management",
    "AI education",
    "smart learning",
    "edtech",
  ],
  authors: [{ name: "AI Tutor" }],
  openGraph: {
    title: "AI Tutor",
    description: "AI-Powered Education Platform for Schools",
    type: "website",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
