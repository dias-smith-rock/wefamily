import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ProductLogo } from "@/lib/i18n/product-brand";

export const metadata: Metadata = {
  title: "Terms of Service — WeCircle",
  description:
    "Terms governing your access to and use of the WeCircle website and mobile application.",
};

const SUPPORT_EMAIL = "music.player.250617@gmail.com";
const LAST_UPDATED = "May 14, 2026";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

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
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and
            use of the WeCircle website and mobile application. By using our
            service, you agree to be bound by these Terms.
          </p>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              1. Description of Service
            </h2>
            <p className="mt-4">
              WeCircle is a family collaboration and productivity tool designed
              to help households manage tasks, schedules, and member profiles. The
              service is provided &quot;as is&quot; and we reserve the right to
              modify, update, or discontinue features at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              2. User Accounts &amp; Security
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-700 marker:text-neutral-400">
              <li>
                You must provide accurate information when creating an account
                (e.g., via Apple ID).
              </li>
              <li>
                You are responsible for maintaining the security of your account
                and any devices you use to access WeCircle.
              </li>
              <li>
                You must promptly notify us of any unauthorized use of your
                account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              3. Household Administration
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-700 marker:text-neutral-400">
              <li>
                When you create a &quot;Household&quot; within the App, you act as
                the Administrator.
              </li>
              <li>
                You are solely responsible for the data you input regarding other
                household members, including virtual profiles created for
                individuals without active accounts.
              </li>
              <li>
                You are responsible for managing who is invited to join your
                household and for removing members when necessary.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              4. Acceptable Use
            </h2>
            <p className="mt-4">You agree not to use WeCircle to:</p>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-700 marker:text-neutral-400">
              <li>
                Upload, post, or transmit any content that is illegal, abusive,
                harassing, or violates the privacy of others.
              </li>
              <li>
                Attempt to hack, disrupt, or compromise the security of the App,
                our servers, or our database structure.
              </li>
              <li>
                Reproduce, duplicate, copy, or resell any part of the Service
                without our express written permission.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              5. Limitation of Liability
            </h2>
            <p className="mt-4">
              To the maximum extent permitted by law, WeCircle and its
              creators shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, resulting from
              (a) your access to or use of or inability to access or use the
              Service; (b) any conduct or content of any third party on the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              6. Governing Law
            </h2>
            <p className="mt-4">
              These Terms shall be governed and construed in accordance with the
              laws of the Hong Kong Special Administrative Region, without regard
              to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              7. Changes to Terms
            </h2>
            <p className="mt-4">
              We reserve the right to modify these Terms at any time. We will
              notify users of any significant changes by updating the &quot;Last
              Updated&quot; date at the top of this page. Your continued use of
              the Service after such changes constitutes acceptance of the new
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              8. Contact Information
            </h2>
            <p className="mt-4">
              For any questions regarding these Terms, please contact:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
