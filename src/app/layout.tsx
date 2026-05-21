import type { Metadata } from "next";
import "./globals.css";
import { NavWrapper } from "@/components/NavWrapper";

export const metadata: Metadata = {
  title: "CatFeederLog",
  description: "猫の給餌を家族と共有管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <NavWrapper />
      </body>
    </html>
  );
}
