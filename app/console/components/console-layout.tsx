"use client";

import { Bell, Clock, Info } from "lucide-react";
import { useEffect, useState } from "react";
import type { ConsoleNavId, ConsoleUser } from "../types";
import { DashboardView } from "./dashboard-view";
import { FamilyMembers } from "./family-members";
import { MobileTabBar } from "./mobile-tab-bar";
import { Sidebar } from "./sidebar";
import { TasksChoresPanel } from "./tasks-chores-panel";

const BREADCRUMB_LABEL: Record<ConsoleNavId, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks & Chores",
  members: "Family Members",
  settings: "Settings",
};

function formatHeaderDate(d: Date) {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${weekday}, ${month} ${day} · ${time}`;
}

type ConsoleLayoutProps = {
  user: ConsoleUser;
  children?: React.ReactNode;
};

export function ConsoleLayout({ user, children }: ConsoleLayoutProps) {
  const [active, setActive] = useState<ConsoleNavId>("dashboard");
  const [headerDate, setHeaderDate] = useState("");
  const [headerDateTime, setHeaderDateTime] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setHeaderDate(formatHeaderDate(d));
      setHeaderDateTime(d.toISOString());
    };
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-gray-900">
      <Sidebar user={user} active={active} onSelect={setActive} />
      <MobileTabBar active={active} onSelect={setActive} />

      <div className="w-full pb-24 md:ml-64 md:pb-8">
        <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-[#F2F2F7]/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 md:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <p className="truncate text-base font-bold tracking-tight text-gray-900 md:hidden">
                WeFamily<span className="text-blue-600">.ai</span>
              </p>
              <nav
                className="hidden min-w-0 text-sm text-gray-500 md:block"
                aria-label="Breadcrumb"
              >
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li className="font-medium text-gray-400">WeFamily.ai</li>
                  <li className="text-gray-300" aria-hidden>
                    &gt;
                  </li>
                  <li className="font-semibold text-blue-600">
                    {BREADCRUMB_LABEL[active]}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-3 text-gray-400 sm:flex">
                <Clock className="h-4 w-4" strokeWidth={2} aria-hidden />
                <time
                  className="text-xs font-medium tabular-nums text-gray-500 sm:text-sm"
                  dateTime={headerDateTime}
                >
                  {headerDate || "…"}
                </time>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white sm:hidden">
                {user.initials}
              </div>
              <button
                type="button"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200/80 hover:text-gray-700 sm:min-h-0 sm:min-w-0 sm:p-1.5"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 border-t border-blue-100/60 bg-blue-50/50 px-4 py-2.5 text-xs text-blue-600 sm:py-3 sm:text-sm md:px-8">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
              strokeWidth={2}
              aria-hidden
            />
            <p className="leading-snug">
              Read-Only Mode — Editing tasks and family settings requires the
              WeFamily.ai iOS app. Changes made here won&apos;t be saved.
            </p>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children ??
            (active === "members" ? (
              <FamilyMembers />
            ) : active === "tasks" ? (
              <TasksChoresPanel />
            ) : active === "dashboard" ? (
              <DashboardView user={user} />
            ) : (
              <MainPlaceholder section={active} />
            ))}
        </main>
      </div>
    </div>
  );
}

function MainPlaceholder({ section }: { section: ConsoleNavId }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:rounded-3xl md:p-8">
        <h1 className="text-xl font-bold text-gray-900">
          {BREADCRUMB_LABEL[section]}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          此区域为布局骨架占位。后续可接入真实数据与路由。
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:rounded-2xl md:p-6"
            >
              <div className="h-3 w-24 rounded-full bg-gray-200" />
              <div className="mt-4 h-8 w-16 rounded-lg bg-gray-200/80" />
              <div className="mt-3 h-2 w-full rounded-full bg-gray-200/60" />
              <div className="mt-2 h-2 w-[85%] rounded-full bg-gray-200/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
