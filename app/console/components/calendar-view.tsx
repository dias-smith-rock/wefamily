"use client";

import { fetchCalendarPageData } from "../calendar/api";
import {
  reviveCalendarEvents,
  serializeCalendarEvents,
} from "../calendar/event-cache";
import type {
  CalendarDay,
  CalendarEvent,
  CalendarModalState,
  CalendarViewMode,
} from "../calendar/types";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import { groupEventsByDate } from "../calendar/list-utils";
import {
  buildWeekView,
  eventsForDate,
  formatCalendarMonthLabel,
  formatEventTime,
} from "../calendar/utils";
import {
  AlarmClock,
  Check,
  ChevronDown,
  Menu,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ForWhomCardRow } from "./calendar/for-whom-display";
import { SignOutButton } from "./console-sign-out-button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dateKey, startOfDay } from "../calendar/month-utils";
import { startOfMonth } from "../calendar/month-utils";
import { CalendarModals } from "./calendar/calendar-modals";
import { MonthPickerSheet } from "./calendar/month-picker-sheet";
import { ListEventsView } from "./calendar/list-events-view";
import { CalendarPageSkeleton } from "./calendar/calendar-skeleton";
const CARD_SHADOW = "shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

const VIEW_MENU_ITEMS: {
  id: CalendarViewMode | "3day" | "week" | "month" | "year";
  label: string;
  enabled: boolean;
}[] = [
  { id: "list", label: "List", enabled: true },
  { id: "day", label: "Day", enabled: true },
  { id: "3day", label: "3 Day", enabled: false },
  { id: "week", label: "Week", enabled: false },
  { id: "month", label: "Month", enabled: false },
  { id: "year", label: "Year", enabled: false },
];

function CalendarNavBar({
  monthLabel,
  onSignOut,
  onOpenMonthPicker,
  viewMode,
  onViewModeChange,
  isViewMenuOpen,
  onViewMenuOpenChange,
}: {
  monthLabel: string;
  onSignOut: () => void | Promise<void>;
  onOpenMonthPicker: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  isViewMenuOpen: boolean;
  onViewMenuOpenChange: (open: boolean) => void;
}) {
  const viewMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isViewMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(event.target as Node)
      ) {
        onViewMenuOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isViewMenuOpen, onViewMenuOpenChange]);

  return (
    <header className="sticky top-0 z-40 overflow-visible bg-[#F2F2F7]/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="relative shrink-0" ref={viewMenuRef}>
          <button
            type="button"
            onClick={() => onViewMenuOpenChange(!isViewMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition active:bg-black/5"
            aria-label="切换视图"
            aria-haspopup="menu"
            aria-expanded={isViewMenuOpen}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>

          {isViewMenuOpen ? (
            <div
              role="menu"
              className="absolute top-full left-0 z-50 mt-2 min-w-[160px] rounded-2xl border border-gray-100 bg-white/95 py-2 shadow-lg backdrop-blur-xl"
            >
              {VIEW_MENU_ITEMS.map((item) => {
                const isActive = item.enabled && item.id === viewMode;
                const isSelectable =
                  item.enabled && (item.id === "list" || item.id === "day");

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    disabled={!isSelectable}
                    onClick={() => {
                      if (!isSelectable) return;
                      onViewModeChange(item.id as CalendarViewMode);
                      onViewMenuOpenChange(false);
                    }}
                    className={`flex h-11 w-full items-center px-4 text-left text-[15px] ${
                      isSelectable
                        ? "text-gray-900 active:bg-black/5"
                        : "pointer-events-none text-gray-300"
                    }`}
                  >
                    <span className="mr-2 flex w-5 shrink-0 items-center justify-center">
                      {isActive ? (
                        <Check
                          className="h-4 w-4 text-blue-500"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onOpenMonthPicker}
          className="flex min-w-0 items-center gap-1 rounded-lg px-2 py-1 transition active:bg-black/5"
          aria-label="选择月份"
          aria-expanded={false}
        >
          <span className="truncate text-[17px] font-bold tracking-wide text-gray-900">
            {monthLabel}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-gray-400"
            strokeWidth={2.25}
            aria-hidden
          />
        </button>

        <SignOutButton onSignOut={onSignOut} />
      </div>
      <div className="h-px w-full bg-gray-200/90" role="separator" aria-hidden />
    </header>
  );
}

function WeekStrip({
  days,
  selectedDate,
  onSelectDay,
}: {
  days: CalendarDay[];
  selectedDate: Date;
  onSelectDay: (date: Date) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedKey = dateKey(selectedDate);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const selectedEl = container.querySelector<HTMLElement>(
      `#date-${selectedKey}`,
    );
    if (!selectedEl) return;

    const frame = requestAnimationFrame(() => {
      const targetLeft =
        selectedEl.offsetLeft -
        container.clientWidth / 2 +
        selectedEl.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedKey, days]);

  return (
    <div className="w-full min-w-0" aria-label="日期时间轴">
      <div
        ref={scrollContainerRef}
        role="list"
        className="flex w-full touch-pan-x snap-x snap-mandatory scroll-smooth overflow-x-auto overscroll-x-contain px-4 pb-1 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {days.map((day) => {
          const selected = day.isSelected;
          const key = dateKey(day.date);
          return (
            <div
              key={key}
              id={`date-${key}`}
              role="listitem"
              className="w-[14%] min-w-[3.5rem] flex-shrink-0 snap-center"
            >
            <button
              type="button"
              onClick={() => onSelectDay(day.date)}
              aria-pressed={selected}
              aria-label={`${day.weekdayShort} ${day.dayNumber}`}
              className="flex w-full flex-col items-center gap-1.5 py-1"
            >
              <span
                className={`text-[11px] font-medium ${
                  selected ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {day.weekdayShort}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold tabular-nums transition-colors ${
                  selected ? "bg-blue-600 text-white" : "text-gray-900"
                }`}
              >
                {day.dayNumber}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  day.hasEvents
                    ? selected
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : "bg-transparent"
                }`}
                aria-hidden={!day.hasEvents}
              />
            </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const timeLabel = formatEventTime(event.startAt);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPress();
        }
      }}
      className={`relative cursor-pointer overflow-hidden rounded-3xl bg-white ${CARD_SHADOW} active:opacity-95`}
    >
      <div className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-blue-600" aria-hidden />
      <div className="px-5 py-4 pl-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            {event.title}
          </h2>
          <span className="shrink-0 rounded-full bg-blue-50/80 px-2.5 py-1 text-xs font-medium text-blue-600">
            {event.statusLabel}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[13px] text-gray-400">
          <AlarmClock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="tabular-nums">{timeLabel}</span>
        </div>

        <ForWhomCardRow event={event} />

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <UserRound className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span>谁去办 (Assignee)</span>
          </div>
          <span className="text-[13px] text-gray-400">{event.assigneeLabel}</span>
        </div>
      </div>
    </article>
  );
}

function EventsSection({
  events,
  onEventPress,
}: {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] font-medium text-gray-400">今天没有安排日程</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {events.map((event) => {
        const timeLabel = formatEventTime(event.startAt);
        return (
          <div key={event.id} className="relative flex gap-4">
            <div className="flex w-12 shrink-0 flex-col items-end">
              <span className="text-[12px] font-medium tabular-nums text-gray-400">
                {timeLabel}
              </span>
              <div
                className="mt-2 min-h-[80px] w-px flex-1 bg-gray-200"
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <EventCard event={event} onPress={() => onEventPress(event)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type CalendarViewProps = {
  householdId: string;
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
};

export function CalendarView({
  householdId,
  enabled,
  onSessionLost,
  onSignOut,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [modal, setModal] = useState<CalendarModalState>({ kind: "none" });
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [listHeaderDate, setListHeaderDate] = useState(() => new Date());
  const [viewingMonth, setViewingMonth] = useState(() =>
    startOfMonth(new Date()),
  );

  const {
    data: cachedEvents,
    loading,
    error,
    revalidate: load,
  } = useCachedSupabase({
    cacheKey: LOCAL_CACHE_KEYS.tasks,
    householdId,
    enabled,
    fetchData: async () => {
      const result = await fetchCalendarPageData(householdId);
      if (!result.ok) return result;
      return { ok: true as const, data: result.data.events };
    },
    revive: reviveCalendarEvents,
    serialize: serializeCalendarEvents,
    onSessionLost,
  });

  const events = useMemo(() => cachedEvents ?? [], [cachedEvents]);

  useEffect(() => {
    if (isMonthPickerOpen) {
      const anchor = viewMode === "list" ? listHeaderDate : selectedDate;
      setViewingMonth(startOfMonth(anchor));
    }
  }, [isMonthPickerOpen, selectedDate, listHeaderDate, viewMode]);

  const weekView = useMemo(
    () => buildWeekView(selectedDate, events),
    [selectedDate, events],
  );

  const dayEvents = useMemo(
    () => eventsForDate(events, selectedDate),
    [events, selectedDate],
  );

  const listGroups = useMemo(() => groupEventsByDate(events), [events]);

  useEffect(() => {
    if (viewMode !== "list" || listGroups.length === 0) return;
    setListHeaderDate(listGroups[0]!.date);
  }, [viewMode, listGroups]);

  const headerMonthLabel =
    viewMode === "list"
      ? formatCalendarMonthLabel(listHeaderDate)
      : weekView.label;

  const handleListVisibleDateChange = useCallback((date: Date) => {
    setListHeaderDate((prev) => {
      if (
        prev.getFullYear() === date.getFullYear() &&
        prev.getMonth() === date.getMonth()
      ) {
        return prev;
      }
      return date;
    });
  }, []);

  const closeModal = () => setModal({ kind: "none" });

  const modalOpen = modal.kind !== "none" || isMonthPickerOpen;

  if (loading) {
    return <CalendarPageSkeleton />;
  }

  if (error) {
    return (
      <div className="px-4 pt-8">
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-[15px] font-medium text-gray-900">无法加载日程数据</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-full">
        <CalendarNavBar
          monthLabel={headerMonthLabel}
          onSignOut={onSignOut}
          onOpenMonthPicker={() => setIsMonthPickerOpen(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isViewMenuOpen={isViewMenuOpen}
          onViewMenuOpenChange={setIsViewMenuOpen}
        />
        <div
          className={
            modalOpen ? "overflow-x-hidden overflow-y-hidden" : undefined
          }
        >
        {viewMode === "day" ? (
          <WeekStrip
            days={weekView.days}
            selectedDate={selectedDate}
            onSelectDay={(date) => setSelectedDate(startOfDay(date))}
          />
        ) : null}

        {viewMode === "list" ? (
          <ListEventsView
            events={events}
            onEventPress={(event) => setModal({ kind: "task", event })}
            onVisibleDateChange={handleListVisibleDateChange}
          />
        ) : (
          <div className="px-4 pb-28 pt-2">
            <EventsSection
              events={dayEvents}
              onEventPress={(event) => setModal({ kind: "task", event })}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setModal({ kind: "action-sheet" })}
          className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-[0_12px_28px_rgba(168,85,247,0.35)] transition active:scale-95"
          aria-label="新建"
        >
          <span className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5" strokeWidth={2} fill="currentColor" />
            <Sparkles
              className="absolute -right-1.5 -top-1.5 h-3 w-3 opacity-90"
              strokeWidth={2}
              fill="currentColor"
            />
            <Sparkles
              className="absolute -bottom-1 -left-2 h-2.5 w-2.5 opacity-75"
              strokeWidth={2}
              fill="currentColor"
            />
          </span>
        </button>
        </div>
      </div>

      <CalendarModals
        modal={modal}
        onClose={closeModal}
        onOpenReadonlyAlert={() => setModal({ kind: "readonly-alert" })}
      />

      <MonthPickerSheet
        open={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(startOfDay(date))}
        events={events}
        viewingMonth={viewingMonth}
        onViewingMonthChange={setViewingMonth}
      />
    </>
  );
}

