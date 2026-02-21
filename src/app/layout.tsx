import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nitya's Tech Blog",
  description: "A premium, Apple-style tech blog built with Next.js and Framer Motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <NavBar />
          {children}
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
