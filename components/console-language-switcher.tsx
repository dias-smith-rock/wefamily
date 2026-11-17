"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  localeCookieName,
  localeLabels,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { useDictionary } from "@/lib/i18n/dictionary-provider";

export function ConsoleLanguageSwitcher() {
  const { locale, t } = useDictionary();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/15"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("common.selectLanguage")}
      >
        <span aria-hidden="true">🌐</span>
        <span>{localeLabels[locale]}</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="glass-panel-strong absolute end-0 z-50 mt-2 max-h-72 w-44 overflow-y-auto rounded-xl py-1 shadow-ios-dock"
        >
          {locales.map((item) => (
            <li key={item} role="option" aria-selected={item === locale}>
              <button
                type="button"
                onClick={() => switchLocale(item)}
                className={`flex w-full items-center px-3 py-2 text-start text-sm transition hover:bg-white/10 ${
                  item === locale
                    ? "font-semibold text-[#7CC4FF]"
                    : "text-white/85"
                }`}
              >
                {localeLabels[item]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
