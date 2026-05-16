"use client";

import {
  formatListEventTime,
  groupEventsByDate,
} from "../../calendar/list-utils";
import type { CalendarEvent } from "../../calendar/types";
import { useCallback, useEffect, useMemo } from "react";

/** 吸顶 Header 下方锚点（safe-area + 导航栏近似高度） */
const LIST_SCROLL_ANCHOR_PX = 96;

function CompactTaskCard({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const timeLabel = formatListEventTime(event);

  return (
    <button
      type="button"
      onClick={onPress}
      className="mx-4 mb-3 flex items-center rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition active:opacity-95"
    >
      <span
        className="mr-3 h-2 w-2 shrink-0 rounded-full bg-blue-500"
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-gray-900">
          {event.title}
        </span>
        <span className="mt-1 block text-xs text-gray-400 tabular-nums">
          {timeLabel}
        </span>
      </span>
    </button>
  );
}

function DateSectionHeader({
  dayNumber,
  weekdayLabel,
}: {
  dayNumber: number;
  weekdayLabel: string;
}) {
  return (
    <header className="mb-3 mt-6 flex items-baseline gap-2 px-4">
      <span className="text-4xl font-extrabold tabular-nums text-black">
        {dayNumber}
      </span>
      <span className="text-xl font-bold text-black">{weekdayLabel}</span>
    </header>
  );
}

type ListEventsViewProps = {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onVisibleDateChange: (date: Date) => void;
};

export function ListEventsView({
  events,
  onEventPress,
  onVisibleDateChange,
}: ListEventsViewProps) {
  const groups = useMemo(() => groupEventsByDate(events), [events]);

  const resolveVisibleDate = useCallback(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-list-date-section]",
    );
    if (sections.length === 0) return;

    let active: Date | null = null;
    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      if (top <= LIST_SCROLL_ANCHOR_PX) {
        const iso = section.dataset.date;
        if (iso) active = new Date(iso);
      } else {
        break;
      }
    }

    if (active) {
      onVisibleDateChange(active);
      return;
    }

    const firstIso = sections[0]?.dataset.date;
    if (firstIso) onVisibleDateChange(new Date(firstIso));
  }, [onVisibleDateChange]);

  useEffect(() => {
    if (groups.length === 0) return;

    onVisibleDateChange(groups[0]!.date);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resolveVisibleDate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    requestAnimationFrame(resolveVisibleDate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [groups, onVisibleDateChange, resolveVisibleDate]);

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] font-medium text-gray-400">暂无日程安排</p>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-1">
      {groups.map((group) => (
        <section
          key={group.date.toISOString()}
          data-list-date-section
          data-date={group.date.toISOString()}
          aria-label={group.weekdayLabel}
        >
          <DateSectionHeader
            dayNumber={group.dayNumber}
            weekdayLabel={group.weekdayLabel}
          />
          {group.events.map((event) => (
            <CompactTaskCard
              key={event.id}
              event={event}
              onPress={() => onEventPress(event)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
