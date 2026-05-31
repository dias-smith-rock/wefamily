"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  localeCookieName,
  localeLabels,
  locales,
  localizePath,
  type Locale,
} from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  selectLanguageLabel?: string;
};

export function LanguageSwitcher({
  currentLocale,
  selectLanguageLabel = "Select language",
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
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

  function switchLocale(locale: Locale) {
    document.cookie = `${localeCookieName}=${locale};path=/;max-age=31536000;SameSite=Lax`;
    router.push(localizePath(pathname, locale));
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 backdrop-blur-sm transition hover:border-gray-300 hover:text-slate-900"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selectLanguageLabel}
      >
        <span aria-hidden="true">🌐</span>
        <span>{localeLabels[currentLocale]}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 max-h-72 w-44 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg shadow-gray-200/60"
        >
          {locales.map((locale) => (
            <li key={locale} role="option" aria-selected={locale === currentLocale}>
              <button
                type="button"
                onClick={() => switchLocale(locale)}
                className={`flex w-full items-center px-3 py-2 text-start text-sm transition hover:bg-gray-50 ${
                  locale === currentLocale
                    ? "font-semibold text-blue-600"
                    : "text-slate-700"
                }`}
              >
                {localeLabels[locale]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
