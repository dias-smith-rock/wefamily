"use client";

import {
  Check,
  ChevronDown,
  Menu,
  Plus,
  Printer,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { CalendarViewMode } from "../../calendar/types";

export function ConsoleTopBar({
  leading,
  onPrint,
  onSearch,
  viewMode,
  onViewModeChange,
  isViewMenuOpen,
  onViewMenuOpenChange,
}: {
  leading: ReactNode;
  onPrint?: () => void;
  onSearch?: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  isViewMenuOpen: boolean;
  onViewMenuOpenChange: (open: boolean) => void;
}) {
  const { t } = useDictionary();
  const menuRef = useRef<HTMLDivElement>(null);

  const viewMenuItems = useMemo(
    () =>
      [
        { id: "day" as const, label: t("console.calendar.viewDay") },
        { id: "week" as const, label: t("console.calendar.viewWeek") },
        { id: "month" as const, label: t("console.calendar.viewMonth") },
        { id: "list" as const, label: t("console.calendar.viewList") },
      ] as const,
    [t],
  );

  useEffect(() => {
    if (!isViewMenuOpen) return;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onViewMenuOpenChange(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isViewMenuOpen, onViewMenuOpenChange]);

  return (
    <header className="sticky top-0 z-40 px-4 pb-2 pt-[max(0.55rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">{leading}</div>

        <div className="glass-pill flex items-center gap-0.5 rounded-full p-1">
          <button
            type="button"
            onClick={onPrint}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#7CC4FF] transition active:bg-white/10"
            aria-label="Print"
          >
            <Printer className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#7CC4FF] transition active:bg-white/10"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => onViewMenuOpenChange(!isViewMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7CC4FF] transition active:bg-white/10"
              aria-label={t("console.calendar.switchView")}
              aria-haspopup="menu"
              aria-expanded={isViewMenuOpen}
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
            {isViewMenuOpen ? (
              <div
                role="menu"
                className="glass-panel-strong absolute end-0 top-full z-50 mt-2 min-w-[148px] rounded-2xl py-1.5 shadow-ios-dock"
              >
                {viewMenuItems.map((item) => {
                  const isActive = item.id === viewMode;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onViewModeChange(item.id);
                        onViewMenuOpenChange(false);
                      }}
                      className="flex h-10 w-full items-center px-3 text-left text-[14px] text-white active:bg-white/10"
                    >
                      <span className="mr-2 flex w-4 shrink-0 justify-center">
                        {isActive ? (
                          <Check
                            className="h-3.5 w-3.5 text-[#3B9EFF]"
                            strokeWidth={2.5}
                          />
                        ) : null}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export function MonthJumpPill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const { t } = useDictionary();
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-pill fixed bottom-[calc(5.9rem+env(safe-area-inset-bottom))] left-[max(1rem,calc(50%-14.5rem))] z-40 inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold text-white/90 shadow-ios-card transition active:scale-[0.98]"
      aria-label={t("console.calendar.selectMonth")}
    >
      <span className="tabular-nums">{label}</span>
      <ChevronDown className="h-3.5 w-3.5 text-white/70" strokeWidth={2.5} />
    </button>
  );
}

export function CreateFab({ onClick }: { onClick: () => void }) {
  const { t } = useDictionary();
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-[max(1rem,calc(50%-14.5rem))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A84FF] text-white shadow-ios-fab transition active:scale-95"
      aria-label={t("console.calendar.createNew")}
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}
