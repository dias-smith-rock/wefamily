import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PRODUCT_NAME_EN, PRODUCT_NAME_ZH } from "@/lib/site-urls";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PRODUCT_NAME_ZH} ${PRODUCT_NAME_EN} — 小圈子轻量协作中枢`,
  description:
    "任务分工、日程同步、成员档案。适用于家庭、旅行团、社团小组等紧密小团队。轻量清晰，不需要全员下载 App。",
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
