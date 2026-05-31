"use client";

import { Calendar, ListTodo, Settings, Users } from "lucide-react";
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
        { id: "calendar" as const, label: t("console.nav.calendar"), icon: Calendar },
        { id: "todo" as const, label: t("console.calendar.viewTodo"), icon: ListTodo },
        { id: "family" as const, label: t("console.nav.group"), icon: Users },
        { id: "me" as const, label: t("console.nav.me"), icon: Settings },
      ] as const,
    [t],
  );

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label={t("console.nav.main")}
    >
      <div className="pointer-events-auto flex w-full max-w-lg items-stretch justify-around rounded-[28px] border border-white/60 bg-white/90 px-1 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const filledIcon = isActive && (id === "calendar" || id === "todo");
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-gray-100 text-blue-600"
                    : "bg-transparent text-current"
                }`}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.5 : 1.75}
                  fill={filledIcon ? "currentColor" : "none"}
                />
              </span>
              <span className="text-[10px] font-medium tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
