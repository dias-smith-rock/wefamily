import type { Locale } from "./config";
import { deepMerge } from "./translate";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  "zh-CN": () => import("@/messages/zh-CN.json").then((m) => m.default as Dictionary),
  "zh-TW": () => import("@/messages/zh-TW.json").then((m) => m.default as Dictionary),
  en: () => import("@/messages/en.json").then((m) => m.default as Dictionary),
  fr: () => import("@/messages/fr.json").then((m) => m.default as Dictionary),
  es: () => import("@/messages/es.json").then((m) => m.default as Dictionary),
  pt: () => import("@/messages/pt.json").then((m) => m.default as Dictionary),
  hi: () => import("@/messages/hi.json").then((m) => m.default as Dictionary),
  ta: () => import("@/messages/ta.json").then((m) => m.default as Dictionary),
  ar: () => import("@/messages/ar.json").then((m) => m.default as Dictionary),
};

const overlays: Record<
  Locale,
  () => Promise<Record<string, unknown>>
> = {
  "zh-CN": () => import("@/lib/i18n/overlays/zh-CN.json").then((m) => m.default),
  "zh-TW": () => import("@/lib/i18n/overlays/zh-TW.json").then((m) => m.default),
  en: () => import("@/lib/i18n/overlays/en.json").then((m) => m.default),
  fr: () => import("@/lib/i18n/overlays/fr.json").then((m) => m.default),
  es: () => import("@/lib/i18n/overlays/es.json").then((m) => m.default),
  pt: () => import("@/lib/i18n/overlays/pt.json").then((m) => m.default),
  hi: () => import("@/lib/i18n/overlays/hi.json").then((m) => m.default),
  ta: () => import("@/lib/i18n/overlays/ta.json").then((m) => m.default),
  ar: () => import("@/lib/i18n/overlays/ar.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const [base, overlay] = await Promise.all([
    dictionaries[locale](),
    overlays[locale](),
  ]);
  return deepMerge(base, overlay) as Dictionary;
}
