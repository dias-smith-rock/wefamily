"use client";

import { ConsoleLanguageSwitcher } from "@/components/console-language-switcher";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { ReactNode } from "react";
import type { ConsoleUser } from "../types";
import { ConsoleTabHeader } from "./console-tab-header";

type MeViewProps = {
  user: ConsoleUser;
  onSignOut: () => void | Promise<void>;
  householdSwitcher?: ReactNode;
};

export function MeView({ user, onSignOut, householdSwitcher }: MeViewProps) {
  const { t } = useDictionary();

  return (
    <div className="px-4 pt-2">
      <ConsoleTabHeader
        title={t("console.me.title")}
        onSignOut={onSignOut}
        leading={householdSwitcher}
      />

      <div className="mt-6 space-y-4">
        <div className="glass-panel rounded-3xl p-4">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0A84FF] text-lg font-semibold text-white">
                {user.initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold text-white">{user.name}</p>
              <p className="mt-0.5 text-[13px] text-white/50">{user.role}</p>
            </div>
            <ConsoleLanguageSwitcher />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <p className="text-[15px] font-medium text-white">
            {t("console.me.accountSettings")}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            {t("console.me.settingsHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
