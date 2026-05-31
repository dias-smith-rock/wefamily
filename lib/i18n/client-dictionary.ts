import { defaultLocale, type Locale } from "./config";
import { resolveClientLocale } from "./client-locale";
import { deepMerge } from "./translate";
import type { Dictionary } from "./types";

import zhCNMessages from "@/messages/zh-CN.json";
import zhTWMessages from "@/messages/zh-TW.json";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import esMessages from "@/messages/es.json";
import ptMessages from "@/messages/pt.json";
import hiMessages from "@/messages/hi.json";
import taMessages from "@/messages/ta.json";
import arMessages from "@/messages/ar.json";

import zhCNOverlay from "@/lib/i18n/overlays/zh-CN.json";
import zhTWOverlay from "@/lib/i18n/overlays/zh-TW.json";
import enOverlay from "@/lib/i18n/overlays/en.json";
import frOverlay from "@/lib/i18n/overlays/fr.json";
import esOverlay from "@/lib/i18n/overlays/es.json";
import ptOverlay from "@/lib/i18n/overlays/pt.json";
import hiOverlay from "@/lib/i18n/overlays/hi.json";
import taOverlay from "@/lib/i18n/overlays/ta.json";
import arOverlay from "@/lib/i18n/overlays/ar.json";

const bundles: Record<Locale, Dictionary> = {
  "zh-CN": deepMerge(zhCNMessages, zhCNOverlay) as Dictionary,
  "zh-TW": deepMerge(zhTWMessages, zhTWOverlay) as Dictionary,
  en: deepMerge(enMessages, enOverlay) as Dictionary,
  fr: deepMerge(frMessages, frOverlay) as Dictionary,
  es: deepMerge(esMessages, esOverlay) as Dictionary,
  pt: deepMerge(ptMessages, ptOverlay) as Dictionary,
  hi: deepMerge(hiMessages, hiOverlay) as Dictionary,
  ta: deepMerge(taMessages, taOverlay) as Dictionary,
  ar: deepMerge(arMessages, arOverlay) as Dictionary,
};

export function getClientDictionary(locale: Locale): Dictionary {
  return bundles[locale];
}

export function getActiveDictionary(): Dictionary {
  const locale =
    typeof window === "undefined" ? defaultLocale : resolveClientLocale();
  return getClientDictionary(locale);
}
