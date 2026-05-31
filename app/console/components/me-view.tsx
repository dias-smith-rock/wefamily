"use client";

import { ConsoleLanguageSwitcher } from "@/components/console-language-switcher";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { ConsoleUser } from "../types";
import { ConsoleTabHeader } from "./console-tab-header";

type MeViewProps = {
  user: ConsoleUser;
  onSignOut: () => void | Promise<void>;
};

export function MeView({ user, onSignOut }: MeViewProps) {
  const { t } = useDictionary();

  return (
    <div className="px-4 pt-2">
      <ConsoleTabHeader title={t("console.me.title")} onSignOut={onSignOut} />

      <div className="mt-6 space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-black/5"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                {user.initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold text-gray-900">{user.name}</p>
              <p className="mt-0.5 text-[13px] text-gray-400">{user.role}</p>
            </div>
            <ConsoleLanguageSwitcher />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-[15px] font-medium text-gray-900">
            {t("console.me.accountSettings")}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-400">
            {t("console.me.settingsHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
