"use client";

import { fetchCalendarPageData } from "../calendar/api";
import {
  reviveCalendarEvents,
  serializeCalendarEvents,
} from "../calendar/event-cache";
import type {
  CalendarEvent,
  CalendarModalState,
  CalendarViewMode,
} from "../calendar/types";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import {
  buildWeekView,
  eventsForDate,
  formatCalendarMonthLabel,
  scheduledCalendarEvents,
} from "../calendar/utils";
import { taskInvolvesMembership } from "../lib/task-edit-access";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { startOfDay, startOfMonth } from "../calendar/month-utils";
import { shiftDateByWeeks } from "../calendar/week-calendar";
import { CalendarModals } from "./calendar/calendar-modals";
import { MonthPickerSheet } from "./calendar/month-picker-sheet";
import { ListEventsView } from "./calendar/list-events-view";
import { DayTimelineView } from "./calendar/day-timeline-view";
import { WeekAgendaView } from "./calendar/week-agenda-view";
import { MonthGridView } from "./calendar/month-grid-view";
import { CalendarPageSkeleton } from "./calendar/calendar-skeleton";
import {
  ConsoleTopBar,
  CreateFab,
  MonthJumpPill,
} from "./calendar/glass-chrome";
import {
  getSavedCalendarViewMode,
  setSavedCalendarViewMode,
} from "../lib/calendar-view-preference";

type CalendarViewProps = {
  householdId: string;
  householdName?: string | null;
  membershipId: string;
  membershipRole: string;
  profileId: string | null;
  currentUserId: string;
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
  householdSwitcher?: ReactNode;
};

export function CalendarView({
  householdId,
  householdName,
  membershipId,
  membershipRole,
  profileId,
  currentUserId,
  enabled,
  onSessionLost,
  householdSwitcher,
}: CalendarViewProps) {
  const { t } = useDictionary();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [modal, setModal] = useState<CalendarModalState>({ kind: "none" });
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [relatedToMeOnly, setRelatedToMeOnly] = useState(true);
  const [listHeaderDate, setListHeaderDate] = useState(() => new Date());
  const [viewingMonth, setViewingMonth] = useState(() =>
    startOfMonth(new Date()),
  );

  useEffect(() => {
    const saved = getSavedCalendarViewMode();
    if (saved) setViewMode(saved);
  }, []);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
    setSavedCalendarViewMode(mode);
  }, []);

  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  const handleShiftWeek = useCallback((weekDelta: number) => {
    setSelectedDate((prev) => shiftDateByWeeks(prev, weekDelta));
  }, []);

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
  const scheduledEvents = useMemo(
    () => scheduledCalendarEvents(events),
    [events],
  );

  useEffect(() => {
    if (!isMonthPickerOpen) return;
    const anchor =
      viewMode === "list"
        ? listHeaderDate
        : viewMode === "month"
          ? viewingMonth
          : selectedDate;
    const next = startOfMonth(anchor);
    setViewingMonth((prev) => {
      if (
        prev.getFullYear() === next.getFullYear() &&
        prev.getMonth() === next.getMonth()
      ) {
        return prev;
      }
      return next;
    });
    // viewingMonth 仅作 month 模式锚点读取；同月时返回 prev 避免 Date 新引用死循环
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 打开选择器时按当前视图同步一次
  }, [isMonthPickerOpen, selectedDate, listHeaderDate, viewMode]);

  const weekView = useMemo(
    () => buildWeekView(selectedDate, scheduledEvents),
    [selectedDate, scheduledEvents],
  );

  const filterRelated = useCallback(
    (list: CalendarEvent[]) => {
      if (!relatedToMeOnly) return list;
      return list.filter((event) =>
        taskInvolvesMembership({
          membershipId,
          profileId,
          userId: currentUserId,
          creatorId: event.creatorId,
          involvedMemberIds: event.involvedMemberIds,
          forWhomIds: event.forWhomIds,
        }),
      );
    },
    [relatedToMeOnly, membershipId, profileId, currentUserId],
  );

  const dayEvents = useMemo(
    () => filterRelated(eventsForDate(scheduledEvents, selectedDate)),
    [scheduledEvents, selectedDate, filterRelated],
  );

  const filteredScheduled = useMemo(
    () => filterRelated(scheduledEvents),
    [scheduledEvents, filterRelated],
  );

  useEffect(() => {
    if (viewMode !== "month") return;
    const next = startOfMonth(selectedDate);
    setViewingMonth((prev) => {
      if (
        prev.getFullYear() === next.getFullYear() &&
        prev.getMonth() === next.getMonth()
      ) {
        return prev;
      }
      return next;
    });
  }, [viewMode, selectedDate]);

  const headerMonthLabel = useMemo(() => {
    if (viewMode === "list") return formatCalendarMonthLabel(listHeaderDate);
    if (viewMode === "month") return formatCalendarMonthLabel(viewingMonth);
    return weekView.label;
  }, [viewMode, listHeaderDate, viewingMonth, weekView.label]);

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

  const openEvent = (event: CalendarEvent) =>
    setModal({ kind: "task", event });

  if (loading) {
    return <CalendarPageSkeleton />;
  }

  if (error) {
    return (
      <div className="px-4 pt-8">
        <div className="glass-panel rounded-3xl p-6 text-center">
          <p className="text-[15px] font-medium text-white">
            {t("console.calendar.loadFailed")}
          </p>
          <p className="mt-2 text-sm text-red-300">
            {translateApiMessage(t, error)}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-full bg-[#0A84FF] px-5 py-2 text-sm font-semibold text-white"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-full">
        <ConsoleTopBar
          leading={householdSwitcher}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          isViewMenuOpen={isViewMenuOpen}
          onViewMenuOpenChange={setIsViewMenuOpen}
          onPrint={() => window.print()}
          onSearch={() => setRelatedToMeOnly((v) => !v)}
        />

        {viewMode === "day" ? (
          <div className="flex items-center justify-between gap-2 px-4 pb-1">
            <button
              type="button"
              onClick={() => setRelatedToMeOnly((v) => !v)}
              className={`inline-flex min-h-[32px] items-center rounded-full px-3 text-[11px] font-semibold transition ${
                relatedToMeOnly
                  ? "bg-[#0A84FF] text-white"
                  : "glass-pill text-white/80"
              }`}
              aria-pressed={relatedToMeOnly}
              title={t("console.calendar.relatedToMeHint")}
            >
              {relatedToMeOnly
                ? t("console.calendar.relatedToMe")
                : t("console.calendar.showAllToday")}
            </button>
          </div>
        ) : null}

        {viewMode === "day" ? (
          <DayTimelineView
            selectedDate={selectedDate}
            events={dayEvents}
            stripEvents={scheduledEvents}
            onSelectDay={handleSelectDay}
            onShiftWeek={handleShiftWeek}
            onEventPress={openEvent}
          />
        ) : null}

        {viewMode === "week" ? (
          <WeekAgendaView
            selectedDate={selectedDate}
            events={filteredScheduled}
            stripEvents={scheduledEvents}
            onSelectDay={handleSelectDay}
            onShiftWeek={handleShiftWeek}
            onEventPress={openEvent}
          />
        ) : null}

        {viewMode === "month" ? (
          <MonthGridView
            viewingMonth={viewingMonth}
            selectedDate={selectedDate}
            events={filteredScheduled}
            onSelectDate={(date) => {
              setSelectedDate(startOfDay(date));
              handleViewModeChange("day");
            }}
            onEventPress={openEvent}
          />
        ) : null}

        {viewMode === "list" ? (
          <ListEventsView
            events={filteredScheduled}
            onEventPress={openEvent}
            onVisibleDateChange={handleListVisibleDateChange}
            scrollToDate={selectedDate}
          />
        ) : null}

        <MonthJumpPill
          label={headerMonthLabel}
          onClick={() => setIsMonthPickerOpen(true)}
        />
        <CreateFab
          onClick={() => setModal({ kind: "create", mode: "scheduled" })}
        />
      </div>

      <CalendarModals
        modal={modal}
        householdId={householdId}
        membershipId={membershipId}
        membershipRole={membershipRole}
        householdName={householdName}
        defaultDate={selectedDate}
        onClose={closeModal}
        onSelectCreate={(mode) => setModal({ kind: "create", mode })}
        onOpenReadonlyAlert={() => setModal({ kind: "readonly-alert" })}
        onCreated={() => void load()}
        onSessionLost={onSessionLost}
      />

      <MonthPickerSheet
        open={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(startOfDay(date));
          setViewingMonth(startOfMonth(date));
          if (viewMode === "month") {
            /* stay */
          } else if (viewMode === "list") {
            setListHeaderDate(date);
          }
        }}
        events={scheduledEvents}
        viewingMonth={viewingMonth}
        onViewingMonthChange={setViewingMonth}
      />
    </>
  );
}
