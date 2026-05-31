"use client";

import { getClientDictionary } from "@/lib/i18n/client-dictionary";
import { resolveClientLocale } from "@/lib/i18n/client-locale";
import { createTranslator } from "@/lib/i18n/translate";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = createTranslator(getClientDictionary(resolveClientLocale()));

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">{t("errors.title")}</h1>
      <p className="max-w-md text-slate-500">
        {error.message || t("errors.unexpected")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        {t("errors.tryAgain")}
      </button>
    </div>
  );
}
