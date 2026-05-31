"use client";

import { useDictionary } from "@/lib/i18n/dictionary-provider";

type SignOutButtonProps = {
  onSignOut: () => void;
  className?: string;
};

export function SignOutButton({ onSignOut, className = "" }: SignOutButtonProps) {
  const { t } = useDictionary();

  return (
    <button
      type="button"
      onClick={() => void onSignOut()}
      className={`min-h-[44px] shrink-0 text-sm font-medium text-red-500 pr-2 transition active:opacity-70 ${className}`}
    >
      {t("common.signOut")}
    </button>
  );
}
