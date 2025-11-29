import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
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
        className={`${inter.variable} antialiased bg-white text-black font-sans selection:bg-black selection:text-white`}
      >
        <div className="min-h-screen flex flex-col border-x border-black max-w-7xl mx-auto">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
