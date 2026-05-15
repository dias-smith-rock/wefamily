"use client";

import { CheckSquare, LayoutDashboard, Users } from "lucide-react";
import type { ConsoleNavId } from "../types";

const TABS: {
  id: Extract<ConsoleNavId, "dashboard" | "tasks" | "members">;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "members", label: "Members", icon: Users },
];

type MobileTabBarProps = {
  active: ConsoleNavId;
  onSelect: (id: ConsoleNavId) => void;
};

export function MobileTabBar({ active, onSelect }: MobileTabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-gray-200 bg-white/90 backdrop-blur-md pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="主导航"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 transition-colors ${
              isActive ? "text-blue-600" : "text-gray-500 active:bg-gray-100"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                isActive ? "bg-blue-50 text-blue-600" : "text-current"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
            </span>
            <span className="max-w-full truncate text-[10px] font-semibold">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
