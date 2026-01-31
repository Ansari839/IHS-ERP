import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Temporarily disabled due to network issues
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Mocking the font objects to avoid breaking the layout references
const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

export const metadata: Metadata = {
  title: "Textile ERP | Dashboard",
  description: "Modern ERP system for textile manufacturing and management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="textile-erp-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
