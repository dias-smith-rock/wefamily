"use client";

import { useMemo } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { CalendarEvent } from "../../calendar/types";
import {
  formatEventDuration,
  formatEventTime,
} from "../../calendar/utils";
import {
  daysInWeek,
  localeFirstWeekday,
  startOfWeek,
} from "../../calendar/week-calendar";
import { dateKey, startOfDay } from "../../calendar/month-utils";
import { SwipeableWeekStrip } from "./swipeable-week-strip";

function WeekEventCard({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const duration = formatEventDuration(event);
  const time = event.isAllDay ? "" : formatEventTime(event.startAt);

  return (
    <button
      type="button"
      onClick={onPress}
      className="glass-card animate-glass-pop flex min-h-[88px] flex-col justify-between rounded-[16px] px-3 py-2.5 text-left transition active:scale-[0.99]"
    >
      <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-white">
        {event.title}
      </p>
      <div className="mt-2 text-[11px] tabular-nums text-white/55">
        {time ? <span>{time}</span> : null}
        {time && duration ? <span> · </span> : null}
        {duration ? <span>{duration}</span> : null}
      </div>
    </button>
  );
}

export function WeekAgendaView({
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
  const today = startOfDay(new Date());
  const firstWeekday = useMemo(() => localeFirstWeekday(), []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, firstWeekday);
    return daysInWeek(start).map((date) => {
      const key = dateKey(date);
      const dayEvents = events
        .filter((e) => dateKey(e.startAt) === key)
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
      return { date, dayEvents };
    });
  }, [selectedDate, events, firstWeekday]);

  const weekdayFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
      }),
    [],
  );

  const hasAny = weekDays.some((d) => d.dayEvents.length > 0);

  return (
    <div>
      <SwipeableWeekStrip
        selectedDate={selectedDate}
        events={stripEvents}
        onSelectDay={onSelectDay}
        onShiftWeek={onShiftWeek}
      />

      {!hasAny ? (
        <div className="px-4 py-16 text-center">
          <p className="text-[15px] font-medium text-white/50">
            {t("console.calendar.noEvents")}
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-3 pb-28 pt-3">
          {weekDays.map(({ date, dayEvents }) => {
            if (dayEvents.length === 0) return null;
            const isToday = dateKey(date) === dateKey(today);
            return (
              <section
                key={dateKey(date)}
                className="grid grid-cols-[3.25rem_1fr] gap-2"
              >
                <div className="pt-1 text-center">
                  <p
                    className={`text-[11px] font-semibold ${
                      isToday ? "text-[#7CC4FF]" : "text-white/45"
                    }`}
                  >
                    {weekdayFmt.format(date)}
                  </p>
                  <p
                    className={`mt-0.5 text-[22px] font-bold tabular-nums leading-none ${
                      isToday ? "text-[#3B9EFF]" : "text-white"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                </div>
                <div
                  className={`grid gap-2 ${
                    dayEvents.length === 1
                      ? "grid-cols-1"
                      : dayEvents.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {dayEvents.map((event) => (
                    <WeekEventCard
                      key={event.id}
                      event={event}
                      onPress={() => onEventPress(event)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
