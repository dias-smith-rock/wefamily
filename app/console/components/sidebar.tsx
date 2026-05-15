"use client";

import {
  CheckSquare,
  LayoutDashboard,
  Leaf,
  Settings,
  Users,
} from "lucide-react";
import type { ConsoleNavId, ConsoleUser } from "../types";

const NAV: { id: ConsoleNavId; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks & Chores", icon: CheckSquare },
    { id: "members", label: "Family Members", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

type SidebarProps = {
  user: ConsoleUser;
  active: ConsoleNavId;
  onSelect: (id: ConsoleNavId) => void;
};

export function Sidebar({ user, active, onSelect }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100/80 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
            aria-hidden
          >
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{user.name}</p>
            <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          Menu
        </p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 px-5 py-4">
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <Leaf className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} aria-hidden />
          <span>WeFamily.ai · v2.4.1</span>
        </p>
      </div>
    </aside>
  );
}
