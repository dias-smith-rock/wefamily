import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveServerLocale } from "@/lib/i18n/resolve-locale";
import { createTranslator } from "@/lib/i18n/translate";

export default async function NotFoundPage() {
  const locale = await resolveServerLocale();
  const dict = await getDictionary(locale);
  const t = createTranslator(dict);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">{t("errors.notFoundTitle")}</h1>
      <p className="text-slate-500">{t("errors.notFoundDescription")}</p>
      <Link
        href={`/${defaultLocale}`}
        className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        {t("errors.backToHome")}
      </Link>
    </div>
  );
}
