"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { createTranslator, type Translator } from "./translate";
import type { Dictionary } from "./types";

type DictionaryContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: Translator;
};

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

type DictionaryProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
};

export function DictionaryProvider({
  locale,
  dictionary,
  children,
}: DictionaryProviderProps) {
  const value = useMemo(
    () => ({
      locale,
      dictionary,
      t: createTranslator(dictionary),
    }),
    [locale, dictionary],
  );

  return (
    <DictionaryContext.Provider value={value}>{children}</DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) {
    throw new Error("useDictionary must be used within DictionaryProvider");
  }
  return ctx;
}

export function useOptionalDictionary() {
  return useContext(DictionaryContext);
}
