"use client";

import { Calendar, Settings, Users } from "lucide-react";
import type { ConsoleNavId } from "../types";

const TABS: {
  id: ConsoleNavId;
  label: string;
  icon: typeof Calendar;
}[] = [
  { id: "calendar", label: "日程表", icon: Calendar },
  { id: "family", label: "家庭", icon: Users },
  { id: "me", label: "我的", icon: Settings },
];

type MobileTabBarProps = {
  active: ConsoleNavId;
  onSelect: (id: ConsoleNavId) => void;
};

export function MobileTabBar({ active, onSelect }: MobileTabBarProps) {
  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label="主导航"
    >
      <div className="pointer-events-auto flex w-full max-w-lg items-stretch justify-around rounded-[28px] border border-white/60 bg-white/90 px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
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
                className={`flex h-9 w-14 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-gray-100 text-blue-600"
                    : "bg-transparent text-current"
                }`}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.5 : 1.75}
                  fill={isActive && id === "calendar" ? "currentColor" : "none"}
                />
              </span>
              <span className="text-[11px] font-medium tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
