import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleHtmlAttributes } from "@/components/locale-html-attributes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  isLocale,
  isRtlLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    title: dict.meta.title,
    description: dict.meta.description,
    path: "/",
  });
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;

  return (
    <>
      <LocaleHtmlAttributes
        locale={locale}
        dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      />
      {children}
    </>
  );
}
