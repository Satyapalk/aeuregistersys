import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Kantumruy_Pro } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="km"
      suppressHydrationWarning
      className={`${kantumruy.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
