import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ToasterClient } from "@/components/ToasterClient";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/components/AuthContext";
import "react-phone-number-input/style.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRMS Super Admin",
  description: "Manage organizations, enforce user limits, and control HR modules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <ToasterClient />
      </body>
    </html>
  );
}
