import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-slate-500">The page you are looking for does not exist.</p>
      <Link
        href={`/${defaultLocale}`}
        className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Back to home
      </Link>
    </div>
  );
}
