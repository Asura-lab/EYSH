import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EYSH - Элсэлтийн Шалгалтанд Бэлдэх",
  description: "Сурагчдад зориулсан элсэлтийн шалгалтанд бэлдэх систем",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
