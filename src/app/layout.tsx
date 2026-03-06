import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Modern dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
