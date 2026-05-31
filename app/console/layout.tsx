import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DictionaryProvider } from "@/lib/i18n/dictionary-provider";
import { isRtlLocale } from "@/lib/i18n/config";
import { resolveServerLocale } from "@/lib/i18n/resolve-locale";
import { LocaleHtmlAttributes } from "@/components/locale-html-attributes";

export default async function ConsoleRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveServerLocale();
  const dictionary = await getDictionary(locale);

  return (
    <DictionaryProvider locale={locale} dictionary={dictionary}>
      <LocaleHtmlAttributes locale={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} />
      {children}
    </DictionaryProvider>
  );
}
