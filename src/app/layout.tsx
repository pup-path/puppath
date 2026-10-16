import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PupPath", template: "%s · PupPath" },
  description: "Northern Beaches Groodles breeding and applicant management",
};

export const viewport: Viewport = { themeColor: "#E8D4C4", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
