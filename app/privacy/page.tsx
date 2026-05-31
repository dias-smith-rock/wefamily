import type { Metadata } from "next";
import Link from "next/link";
import { LANDINGPAGE_CONSOLE_HREF, PRODUCT_NAME_EN, PRODUCT_NAME_ZH } from "@/lib/site-urls";

export const metadata: Metadata = {
  title: "Privacy Policy — WeCircle",
  description:
    "How WeCircle collects, uses, and protects your information when you use our website and mobile application.",
};

const SUPPORT_EMAIL = "music.player.250617@gmail.com";
const LAST_UPDATED = "May 14, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#FAFAFA] pb-24 pt-8 sm:pt-12">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <Link
          href={LANDINGPAGE_CONSOLE_HREF}
          className="inline-block text-[15px] font-medium text-[#007AFF] transition-colors hover:text-[#0066D6] hover:underline"
        >
          {PRODUCT_NAME_ZH} {PRODUCT_NAME_EN}
        </Link>
      </div>

      <article className="mx-auto mt-10 max-w-3xl px-5 sm:mt-14 sm:px-6">
        <header className="border-b border-neutral-200/90 pb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-[2rem] sm:leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Last Updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="space-y-10 pt-10 text-[17px] leading-[1.65] text-neutral-800">
          <p>
            Welcome to WeCircle. Your family&apos;s privacy and data security
            are our highest priorities. This Privacy Policy explains how we
            collect, use, and protect your information when you use our website
            and mobile application.
          </p>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              1. Information We Collect
            </h2>
            <p className="mt-4">
              We only collect information that is necessary to provide and
              improve our service:
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-700 marker:text-neutral-400">
              <li>
                <span className="font-medium text-neutral-900">
                  Account Information:
                </span>{" "}
                When you sign in using &quot;Sign in with Apple,&quot; we
                collect the name and email address provided by Apple to create
                your secure account.
              </li>
              <li>
                <span className="font-medium text-neutral-900">
                  Family &amp; Household Data:
                </span>{" "}
                To enable family collaboration, we store the tasks, events, and
                household structures you create.
              </li>
              <li>
                <span className="font-medium text-neutral-900">
                  Managed Profiles:
                </span>{" "}
                If you create &quot;Virtual Profiles&quot; (档案成员) for family
                members who do not have their own accounts (such as young
                children or elders), you confirm that you have the right to
                provide their basic identifying information (like names or
                nicknames) for household management purposes.
              </li>
              <li>
                <span className="font-medium text-neutral-900">
                  Technical Data:
                </span>{" "}
                We may collect non-personally identifiable information such as
                device type, app crash logs, and usage metrics to ensure the
                stability of the App.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              2. How We Use Your Information
            </h2>
            <p className="mt-4">
              We use your data strictly to deliver the WeCircle experience:
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-700 marker:text-neutral-400">
              <li>
                To sync tasks, events, and household roles across your devices in
                real-time.
              </li>
              <li>To authenticate your identity securely.</li>
              <li>
                To provide customer support and respond to your feedback.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              3. Data Storage &amp; Security
            </h2>
            <p className="mt-4">
              We utilize enterprise-grade cloud infrastructure (including
              Supabase) to store your data securely. Your data is encrypted in
              transit and at rest. We employ strict Row-Level Security (RLS)
              database policies to ensure that your household data is completely
              isolated and only accessible to authorized members of your
              specific household.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              4. Information Sharing
            </h2>
            <p className="mt-4">
              We do not, and will never, sell your personal data to third
              parties. We only share information with trusted service providers
              (such as secure cloud hosting) strictly for the purpose of
              operating our service. We may also disclose information if required
              by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              5. Your Rights and Data Deletion
            </h2>
            <p className="mt-4">
              You have full control over your data. You can edit your profile,
              delete specific tasks, or remove family members at any time within
              the App. You may also permanently delete your entire account and
              all associated data via the &quot;Danger Zone&quot; in the
              App&apos;s settings. Once deleted, this action is irreversible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              6. Contact Us
            </h2>
            <p className="mt-4">
              If you have any questions about this Privacy Policy, please
              contact us at:{" "}
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
