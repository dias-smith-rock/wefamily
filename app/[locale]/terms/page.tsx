import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal-document";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ProductLogo } from "@/lib/i18n/product-brand";

const SUPPORT_EMAIL = "music.player.250617@gmail.com";
const LAST_UPDATED = "May 14, 2026";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};

  const dict = await getDictionary(localeParam as Locale);
  return {
    title: `${dict.legal.termsTitle} — WeCircle`,
    description: dict.legal.termsMetaDescription,
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-dvh bg-[#FAFAFA] pb-24 pt-8 sm:pt-12">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <Link
          href={`/${locale}`}
          className="inline-block text-[15px] font-medium text-[#007AFF] transition-colors hover:text-[#0066D6] hover:underline"
        >
          <ProductLogo locale={locale} linkStyle className="text-[15px] font-medium" />
        </Link>
      </div>

      <article className="mx-auto mt-10 max-w-3xl px-5 sm:mt-14 sm:px-6">
        <header className="border-b border-neutral-200/90 pb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-[2rem] sm:leading-tight">
            {dict.legal.termsTitle}
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            {dict.legal.lastUpdated.replace("{date}", LAST_UPDATED)}
          </p>
        </header>

        <div className="space-y-10 pt-10 text-[17px] leading-[1.65] text-neutral-800">
          <LegalDocument
            intro={dict.legal.terms.intro}
            sections={dict.legal.terms.sections}
            contactLead={dict.legal.terms.contactLead}
            supportEmail={SUPPORT_EMAIL}
          />
        </div>
      </article>
    </div>
  );
}
