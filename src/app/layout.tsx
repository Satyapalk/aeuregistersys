import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist_Mono } from "next/font/google";
import { Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import FontAwesomeLoader from "@/components/FontAwesomeLoader";

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEU Student Registration",
  description: "សាកលវិទ្យាល័យអាស៊ីអឺរ៉ុប - Student Registration System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="km"
      suppressHydrationWarning
      className={`${kantumruy.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head />
      <body className="min-h-full flex flex-col">
        <FontAwesomeLoader />
        {children}
      </body>
    </html>
  );
}
