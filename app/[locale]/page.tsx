import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroScreenshots } from "@/components/hero-screenshots";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  isLocale,
  isRtlLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import {
  formatCopyright,
  ProductLogo,
} from "@/lib/i18n/product-brand";
import {
  USE_CASE_ICONS,
  USE_CASE_KEYS,
} from "@/lib/i18n/types";
import {
  APP_STORE_HREF,
  COMPANY_NAME_EN,
  COMPANY_NAME_ZH,
  CONTACT_EMAIL,
  WEB_CONSOLE_HREF,
} from "@/lib/site-urls";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const isRtl = isRtlLocale(locale);

  const copyright = formatCopyright(dict.footer.copyright, locale);

  return (
    <div
      className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-blue-200/80"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <header className="fixed top-0 z-50 w-full border-b border-gray-100/90 bg-white/70 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <Link
            href={`/${locale}`}
            className="shrink-0 text-xl transition-opacity hover:opacity-80"
          >
            <ProductLogo locale={locale} />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher
              currentLocale={locale}
              selectLanguageLabel={dict.common.selectLanguage}
            />
            <Link
              href={WEB_CONSOLE_HREF}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg shadow-gray-200/80 transition hover:bg-gray-800 sm:hidden"
            >
              {dict.nav.webConsole}
            </Link>
            <Link
              href={WEB_CONSOLE_HREF}
              className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 sm:inline"
            >
              {dict.nav.webConsole}
            </Link>
            <a
              href={APP_STORE_HREF}
              className="hidden rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow-lg shadow-gray-200/80 transition hover:bg-gray-800 sm:inline-flex"
            >
              {dict.nav.getApp}
            </a>
          </div>
        </div>
      </header>

      <main className="pb-20 pt-32">
        <section className="mx-auto max-w-5xl space-y-8 px-6 text-center">
          <h1 className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            {dict.hero.titleLine1}{" "}
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {dict.hero.titleLine2}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-slate-500 md:text-xl">
            {dict.hero.subtitle}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <a
              href={APP_STORE_HREF}
              className="w-full rounded-full bg-black px-8 py-4 text-center text-lg font-semibold text-white shadow-xl shadow-gray-300/50 transition hover:scale-[1.02] active:scale-[0.99] sm:w-auto"
            >
              {dict.hero.downloadAppStore}
            </a>
            <Link
              href={WEB_CONSOLE_HREF}
              className="w-full rounded-full border border-gray-200/90 bg-white/80 px-8 py-4 text-center text-lg font-semibold text-black shadow-sm backdrop-blur-sm transition hover:bg-gray-50/90 sm:w-auto"
            >
              {dict.hero.exploreWeb}
            </Link>
          </div>

          <HeroScreenshots
            alt={dict.hero.screenshotAlt}
            scrollHint={dict.hero.screenshotScrollHint}
            prevLabel={dict.hero.screenshotPrev}
            nextLabel={dict.hero.screenshotNext}
          />
        </section>

        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {dict.useCases.sectionTitle}
            </h2>
            <p className="mt-4 text-slate-500">{dict.useCases.sectionSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASE_KEYS.map((key) => {
              const item = dict.useCases.items[key];
              return (
                <div
                  key={key}
                  className="flex flex-col rounded-3xl border border-gray-100 bg-white/90 p-8 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100/90 text-xl">
                    {USE_CASE_ICONS[key]}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-slate-400">
                    {item.pain}
                  </p>
                  <p className="mt-auto text-sm leading-relaxed text-slate-600">
                    {item.solution}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-32 max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {dict.features.sectionTitle}
            </h2>
            <p className="mt-4 text-slate-500">{dict.features.sectionSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md md:col-span-2">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/90 text-2xl text-blue-600 backdrop-blur-sm">
                👤
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-900">
                {dict.features.profile.title}
              </h3>
              <p className="text-lg leading-relaxed text-slate-500">
                {dict.features.profile.description}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/90 text-2xl text-indigo-600 backdrop-blur-sm">
                🎯
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {dict.features.tasks.title}
              </h3>
              <p className="leading-relaxed text-slate-500">
                {dict.features.tasks.description}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 shadow-sm backdrop-blur-sm transition hover:border-gray-200/80 hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/90 text-2xl text-slate-800 backdrop-blur-sm">
                🔒
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {dict.features.privacy.title}
              </h3>
              <p className="leading-relaxed text-slate-500">
                {dict.features.privacy.description}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-10 shadow-lg shadow-gray-300/30 md:col-span-2">
              <div className="relative z-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                  💻
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  {dict.features.sync.title}
                </h3>
                <p className="max-w-md text-lg leading-relaxed text-slate-300">
                  {dict.features.sync.description}
                </p>
              </div>
              <div className="pointer-events-none absolute -bottom-20 -end-20 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-gray-100 bg-white/80 py-12 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-sm text-slate-400">{copyright}</p>
            <p className="text-xs text-slate-400/70">
              {COMPANY_NAME_ZH} · {COMPANY_NAME_EN}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-xs text-slate-400/70 transition-colors hover:text-slate-500"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
            <Link
              href={`/${locale}/privacy`}
              className="transition-colors hover:text-slate-900"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="transition-colors hover:text-slate-900"
            >
              {dict.footer.terms}
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="transition-colors hover:text-slate-900"
            >
              {dict.footer.contact}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
