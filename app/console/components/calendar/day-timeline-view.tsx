"use client";

import { AlarmClock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { CalendarEvent } from "../../calendar/types";
import {
  eventTrailingPersonLabel,
  formatEventDuration,
  formatEventTime,
  formatEventTimeRange,
} from "../../calendar/utils";
import { SwipeableWeekStrip } from "./swipeable-week-strip";

function NowIndicator({ now }: { now: Date }) {
  const label = formatEventTime(now);
  return (
    <div className="relative my-3 flex items-center" aria-hidden>
      <span className="z-10 rounded-full bg-[#FF453A] px-2 py-0.5 text-[11px] font-bold tabular-nums text-white shadow-[0_0_12px_rgba(255,69,58,0.55)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#FF453A]" />
    </div>
  );
}

function TimelineCard({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const duration = formatEventDuration(event);
  const range = formatEventTimeRange(event);
  const trailing = eventTrailingPersonLabel(event);

  return (
    <button
      type="button"
      onClick={onPress}
      className="glass-card-day animate-glass-pop w-full rounded-[18px] px-3.5 py-3 text-left transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold tracking-tight text-white">
            {event.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/55">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <AlarmClock className="h-3 w-3" strokeWidth={2} aria-hidden />
              {range}
            </span>
            {duration ? <span>· {duration}</span> : null}
          </div>
        </div>
        {trailing ? (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums ${
              /^\d{6,8}$/.test(trailing)
                ? "bg-white/10 text-white/80"
                : "flex h-7 min-w-7 items-center justify-center bg-[#0A84FF]/90 text-white"
            }`}
          >
            {/^\d{6,8}$/.test(trailing) ? trailing : trailing.slice(0, 1)}
          </span>
        ) : event.assignees.length > 0 ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A84FF]/90 text-[12px] font-bold text-white">
            {event.assignees.length}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function DayTimelineView({
  selectedDate,
  events,
  stripEvents,
  onSelectDay,
  onShiftWeek,
  onEventPress,
}: {
  selectedDate: Date;
  events: CalendarEvent[];
  stripEvents: CalendarEvent[];
  onSelectDay: (date: Date) => void;
  onShiftWeek: (weekDelta: number) => void;
  onEventPress: (event: CalendarEvent) => void;
}) {
  const { t } = useDictionary();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const isToday = useMemo(() => {
    const a = new Date();
    return (
      a.getFullYear() === selectedDate.getFullYear() &&
      a.getMonth() === selectedDate.getMonth() &&
      a.getDate() === selectedDate.getDate()
    );
  }, [selectedDate]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
    [events],
  );

  const nowMs = now.getHours() * 60 + now.getMinutes();
  const firstUpcomingId = useMemo(() => {
    if (!isToday) return null;
    const upcoming = sorted.find((e) => {
      if (e.isAllDay) return false;
      const m = e.startAt.getHours() * 60 + e.startAt.getMinutes();
      return m >= nowMs;
    });
    return upcoming?.id ?? null;
  }, [isToday, sorted, nowMs]);

  return (
    <div>
      <SwipeableWeekStrip
        selectedDate={selectedDate}
        events={stripEvents}
        onSelectDay={onSelectDay}
        onShiftWeek={onShiftWeek}
      />

      {sorted.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-[15px] font-medium text-white/50">
            {t("console.calendar.noEventsToday")}
          </p>
        </div>
      ) : (
        <div className="relative px-4 pb-28 pt-3">
          <div
            className="absolute bottom-28 left-[2.35rem] top-6 w-px bg-white/15"
            aria-hidden
          />
          <div className="space-y-4">
            {sorted.map((event) => (
              <div key={event.id}>
                {event.id === firstUpcomingId ? (
                  <NowIndicator now={now} />
                ) : null}
                <div className="relative flex gap-3">
                  <div className="relative z-10 flex w-12 shrink-0 flex-col items-end pt-1">
                    <span className="text-[12px] font-semibold tabular-nums text-white/55">
                      {formatEventTime(event.startAt)}
                    </span>
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#0A84FF] shadow-[0_0_0_4px_rgba(10,132,255,0.25)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <TimelineCard
                      event={event}
                      onPress={() => onEventPress(event)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {isToday && firstUpcomingId == null ? (
              <NowIndicator now={now} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
