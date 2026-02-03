import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EYSH - Элсэлтийн Шалгалтанд Бэлдэх",
  description: "Сурагчдад зориулсан элсэлтийн шалгалтанд бэлдэх үнэгүй систем",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors`}>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
