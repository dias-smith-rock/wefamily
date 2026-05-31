import type { Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  "zh-CN": () => import("@/messages/zh-CN.json").then((m) => m.default),
  "zh-TW": () => import("@/messages/zh-TW.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
  fr: () => import("@/messages/fr.json").then((m) => m.default),
  es: () => import("@/messages/es.json").then((m) => m.default),
  pt: () => import("@/messages/pt.json").then((m) => m.default),
  hi: () => import("@/messages/hi.json").then((m) => m.default),
  ta: () => import("@/messages/ta.json").then((m) => m.default),
  ar: () => import("@/messages/ar.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
