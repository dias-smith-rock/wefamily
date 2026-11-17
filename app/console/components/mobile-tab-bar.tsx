"use client";

import { CalendarDays, ListTodo, Settings } from "lucide-react";
import { useMemo } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { ConsoleNavId } from "../types";

type MobileTabBarProps = {
  active: ConsoleNavId;
  onSelect: (id: ConsoleNavId) => void;
};

export function MobileTabBar({ active, onSelect }: MobileTabBarProps) {
  const { t } = useDictionary();

  const tabs = useMemo(
    () =>
      [
        {
          id: "calendar" as const,
          label: t("console.nav.calendar"),
          icon: CalendarDays,
        },
        {
          id: "todo" as const,
          label: t("console.calendar.viewTodo"),
          icon: ListTodo,
        },
        {
          id: "settings" as const,
          label: t("console.nav.settings"),
          icon: Settings,
        },
      ] as const,
    [t],
  );

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
      aria-label={t("console.nav.main")}
    >
      <div className="glass-panel-strong pointer-events-auto flex w-full max-w-lg items-stretch justify-around rounded-[28px] px-1.5 py-1.5 shadow-ios-dock">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors ${
                isActive ? "text-[#3B9EFF]" : "text-white/70"
              }`}
            >
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={isActive ? 2.4 : 1.8}
                fill={isActive && id === "calendar" ? "currentColor" : "none"}
              />
              <span className="text-[10px] font-semibold tracking-tight">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
