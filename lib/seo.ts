import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/config";
import { PRODUCT_NAME_EN } from "@/lib/site-urls";

export const SITE_ORIGIN = "https://www.wefamily.ai";

export const OG_IMAGE_PATH = "/marketing/hero-devices.jpg";

/** Next.js middleware / root layout share this header for SSR `html lang`. */
export const localeHeaderName = "x-wefamily-locale";

export function absoluteUrl(pathname: string): string {
  if (pathname.startsWith("http")) return pathname;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${path}`;
}

export function localizedPath(locale: Locale, path = "/"): string {
  const normalized =
    !path || path === "/"
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;
  return `/${locale}${normalized}`;
}

export function localizedUrl(locale: Locale, path = "/"): string {
  return absoluteUrl(localizedPath(locale, path));
}

export function languageAlternates(path = "/"): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizedUrl(locale, path);
  }
  languages["x-default"] = localizedUrl("en", path);
  return languages;
}

type BuildMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
};

export function buildPageMetadata({
  locale,
  title,
  description,
  path = "/",
}: BuildMetadataInput): Metadata {
  const url = localizedUrl(locale, path);
  const ogLocale = locale.replace("-", "_");

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url,
      siteName: PRODUCT_NAME_EN,
      title,
      description,
      images: [
        {
          url: OG_IMAGE_PATH,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}
