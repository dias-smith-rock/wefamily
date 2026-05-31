"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

type LocaleHtmlAttributesProps = {
  locale: Locale;
  dir: "ltr" | "rtl";
};

export function LocaleHtmlAttributes({
  locale,
  dir,
}: LocaleHtmlAttributesProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
