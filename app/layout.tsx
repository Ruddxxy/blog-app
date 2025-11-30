import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Silent Archive",
  description: "A minimal brutalist blog platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} antialiased bg-white text-black font-sans selection:bg-black selection:text-white`}
      >
        <div className="min-h-screen flex flex-col border-x border-black max-w-7xl mx-auto">
          <Header />
          {children}
          <Footer />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
