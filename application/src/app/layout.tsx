import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { AuthModalProvider } from "@/lib/context/auth-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata configuration for the application
 * Defines the page title and description for SEO
 */
export const metadata: Metadata = {
  title: "AuxPoll",
  description: "Vote your vibe!",
};

/**
 * Root layout component that wraps all pages
 * Configures global fonts, styling, dark theme, and layout structure
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Root HTML document structure with global fonts, Navbar, main content area, and Footer
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthModalProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </AuthModalProvider>
      </body>
    </html>
  );
}
