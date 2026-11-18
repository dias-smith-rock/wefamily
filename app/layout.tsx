import type { Metadata } from "next";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";
import { defaultLocale, isLocale, isRtlLocale } from "@/lib/i18n/config";
import { localeHeaderName } from "@/lib/seo";
import { PRODUCT_NAME_EN } from "@/lib/site-urls";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.wefamily.ai"),
  applicationName: PRODUCT_NAME_EN,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const headerLocale = headerStore.get(localeHeaderName);
  const locale =
    headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={plusJakarta.variable}
    >
      <body className="min-h-dvh bg-white font-sans text-neutral-900">
        {children}
      </body>
    </html>
  );
}
