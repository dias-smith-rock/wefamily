import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MARKETING_ASSETS } from "@/lib/brand/marketing-assets";
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
  CAPABILITY_ICONS,
  CAPABILITY_KEYS,
  SHOWCASE_KEYS,
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

const SHOWCASE_ASSETS = {
  calendar: MARKETING_ASSETS.featureCalendar,
  tasks: MARKETING_ASSETS.featureTasks,
  members: MARKETING_ASSETS.featureMembers,
  sync: MARKETING_ASSETS.featureSync,
} as const;

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
      className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#FF6F4C]/25"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <header className="fixed top-0 z-50 w-full border-b border-black/5 bg-white/85 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href={`/${locale}`}
            className="shrink-0 text-[20px] transition-opacity hover:opacity-80"
          >
            <ProductLogo locale={locale} iconSize={34} className="gap-2.5" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">
              {dict.nav.features}
            </a>
            <a href="#guide" className="transition-colors hover:text-slate-900">
              {dict.nav.howItWorks}
            </a>
            <Link
              href={WEB_CONSOLE_HREF}
              className="transition-colors hover:text-slate-900"
            >
              {dict.nav.webConsole}
            </Link>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher
              currentLocale={locale}
              selectLanguageLabel={dict.common.selectLanguage}
            />
            <Link
              href={WEB_CONSOLE_HREF}
              className="rounded-lg bg-[#FF6F4C] px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#F45A3A]"
            >
              {dict.nav.console}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — 参考 myecalendar：色带首屏 + 文案左 / 产品图右 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FF6F4C] via-[#FF7A3D] to-[#FF9F0A] pt-28 pb-16 md:pt-32 md:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.2),transparent_40%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6 text-white">
              <p className="text-sm font-semibold tracking-[0.18em] text-white/85 uppercase">
                {dict.hero.eyebrow}
              </p>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.12] tracking-tight md:text-5xl lg:text-[3.25rem]">
                {dict.hero.title}
              </h1>
              <p className="max-w-xl text-pretty text-base leading-relaxed text-white/90 md:text-lg">
                {dict.hero.subtitle}
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <Link
                  href={WEB_CONSOLE_HREF}
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-[#FF6F4C] shadow-xl shadow-black/10 transition hover:scale-[1.02] active:scale-[0.99]"
                >
                  {dict.hero.exploreWeb}
                </Link>
                <a
                  href={APP_STORE_HREF}
                  className="inline-flex items-center justify-center rounded-full border border-white/45 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {dict.hero.downloadAppStore}
                </a>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-[15px]">
                {dict.hero.webNote}
              </p>
            </div>
            <ImagePlaceholder
              assetPath={MARKETING_ASSETS.heroDevices}
              brief={dict.hero.imageBrief}
              sizeHint="建议 1600×1200，PNG/WebP，透明或浅色底"
              aspectClassName="aspect-[5/4] lg:aspect-[4/3]"
              className="border-white/40 bg-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
            />
          </div>
        </section>

        {/* Guide — 参考 Operation Guide */}
        <section id="guide" className="scroll-mt-24 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#FF6F4C] to-[#FF9F0A]" />
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {dict.guide.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-500 md:text-lg">
                {dict.guide.subtitle}
              </p>
              <ol className="mt-8 space-y-5">
                {dict.guide.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6F4C]/12 text-sm font-bold text-[#FF6F4C]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <ImagePlaceholder
              assetPath={MARKETING_ASSETS.guideOverview}
              brief={dict.guide.imageBrief}
              sizeHint="建议 1400×1050"
            />
          </div>
        </section>

        {/* Feature showcases — 左右交替 */}
        <section id="features" className="scroll-mt-24 bg-[#FFF8F4] py-8 md:py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-4">
            {SHOWCASE_KEYS.map((key, index) => {
              const item = dict.showcases[key];
              const imageFirst = index % 2 === 0;
              return (
                <div
                  key={key}
                  className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-16"
                >
                  <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
                    <ImagePlaceholder
                      assetPath={SHOWCASE_ASSETS[key]}
                      brief={item.imageBrief}
                      sizeHint="建议 1400×1050，设备叠放或单屏精修均可"
                    />
                  </div>
                  <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
                    <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#FF6F4C] to-[#FF9F0A]" />
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                      {item.title}
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Web promo — 强调免下载浏览器可用 */}
        <section className="py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#FF6F4C] to-[#FF9F0A]" />
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {dict.webPromo.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
                {dict.webPromo.description}
              </p>
              <Link
                href={WEB_CONSOLE_HREF}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#FF6F4C] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF6F4C]/25 transition hover:bg-[#F45A3A]"
              >
                {dict.webPromo.cta}
              </Link>
            </div>
            <ImagePlaceholder
              assetPath={MARKETING_ASSETS.featureSync}
              brief={dict.webPromo.imageBrief}
              sizeHint="建议 1400×1050，宽屏 Web 控制台截图"
            />
          </div>
        </section>

        {/* App promo */}
        <section className="border-t border-[#FF6F4C]/10 bg-[#FFF8F4] py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
            <ImagePlaceholder
              assetPath={MARKETING_ASSETS.appPromo}
              brief={dict.appPromo.imageBrief}
              sizeHint="建议竖图 900×1600 或带手机框 1200×1600"
              aspectClassName="aspect-[3/4] max-w-md mx-auto w-full"
              className="lg:order-1"
            />
            <div className="lg:order-2">
              <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#FF6F4C] to-[#FF9F0A]" />
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {dict.appPromo.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
                {dict.appPromo.description}
              </p>
              <a
                href={APP_STORE_HREF}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#FF6F4C] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF6F4C]/25 transition hover:bg-[#F45A3A]"
              >
                {dict.appPromo.cta}
              </a>
            </div>
          </div>
        </section>

        {/* Capabilities grid */}
        <section className="border-t border-[#FF6F4C]/10 bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {dict.capabilities.sectionTitle}
              </h2>
              <p className="mt-4 text-slate-500">{dict.capabilities.sectionSubtitle}</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {CAPABILITY_KEYS.map((key) => {
                const item = dict.capabilities.items[key];
                return (
                  <div key={key} className="rounded-[24px] bg-white p-7 shadow-sm ring-1 ring-black/5">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6F4C]/12 text-xl">
                      {CAPABILITY_ICONS[key]}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <ProductLogo locale={locale} iconSize={28} className="gap-2 text-[15px]" />
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
            <a
              href={APP_STORE_HREF}
              className="transition-colors hover:text-slate-900"
            >
              {dict.nav.getApp}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
