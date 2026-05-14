import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WeFamily.ai — 下一代智能家庭中枢",
  description:
    "身份档案分离、专属任务追踪、多端实时同步。重新定义家庭协作，让爱与秩序并存。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-dvh bg-white font-sans text-neutral-900">
        {children}
      </body>
    </html>
  );
}
