import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MAG - MyAnimeGW Premium Anime Streaming Platform",
  description: "Watch high-quality subbed and dubbed anime on MAG (MyAnimeGW). Free, fast streaming with zero advertisements, Indonesian/English subtitles, and multiple quality fallbacks.",
  keywords: ["anime", "streaming", "mag", "myanimegw", "sub indo", "gogoanime", "samehadaku", "zero ads"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-[#0B0B0F] text-[#F3F4F6] font-sans antialiased">
        <Navbar />
        {/* Padding top is added to account for sticky navbar height (h-12 + padding) */}
        <main className="flex-grow pt-16 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
