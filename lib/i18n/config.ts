export const locales = [
  "zh-CN",
  "zh-TW",
  "en",
  "fr",
  "es",
  "pt",
  "hi",
  "ta",
  "ar",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-CN";

export const localeCookieName = "NEXT_LOCALE";

export const localeLabels: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  fr: "Français",
  es: "Español",
  pt: "Português",
  hi: "हिन्दी",
  ta: "தமிழ்",
  ar: "العربية",
};

export const rtlLocales: Locale[] = ["ar"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return segment && isLocale(segment) ? segment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  const rest = pathname.slice(`/${locale}`.length);
  return rest === "" ? "/" : rest;
}

export function localizePath(pathname: string, locale: Locale): string {
  const path = stripLocaleFromPathname(pathname);
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: qPart ? Number(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferences) {
    if (tag.startsWith("zh-hant") || tag === "zh-tw" || tag === "zh-hk") {
      return "zh-TW";
    }
    if (tag.startsWith("zh-hans") || tag === "zh-cn" || tag === "zh") {
      return "zh-CN";
    }
    const primary = tag.split("-")[0];
    const match = locales.find(
      (locale) => locale.toLowerCase() === tag || locale.split("-")[0] === primary,
    );
    if (match) return match;
  }

  return defaultLocale;
}
