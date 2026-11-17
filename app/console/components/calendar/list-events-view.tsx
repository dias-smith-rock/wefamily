"use client";

import {
  formatListEventTime,
  groupEventsByDate,
  type CalendarDateGroup,
} from "../../calendar/list-utils";
import type { CalendarEvent } from "../../calendar/types";
import { dateKey, startOfDay } from "../../calendar/month-utils";
import { eventTrailingPersonLabel } from "../../calendar/utils";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { useCallback, useEffect, useMemo, useRef } from "react";

/** 吸顶 Header 下方锚点 */
const LIST_SCROLL_ANCHOR_PX = 96;

function CompactTaskCard({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const timeLabel = formatListEventTime(event);
  const trailing = eventTrailingPersonLabel(event);

  return (
    <button
      type="button"
      onClick={onPress}
      className="glass-card-day mx-4 mb-2.5 flex w-auto items-center justify-between gap-3 rounded-[16px] px-3.5 py-3.5 text-left transition active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="h-8 w-[3px] shrink-0 rounded-full bg-[#0A84FF]"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-white">
            {event.title}
          </p>
          <p className="mt-0.5 text-[12px] tabular-nums text-white/50">
            {timeLabel}
          </p>
        </div>
      </div>

      {trailing ? (
        <span className="max-w-[7.5rem] shrink-0 truncate text-right text-[12px] font-semibold tabular-nums text-white/55">
          {trailing}
        </span>
      ) : null}
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
    <header className="mb-2.5 mt-5 flex items-baseline gap-2 px-4">
      <span className="text-[34px] font-extrabold tabular-nums leading-none text-white">
        {dayNumber}
      </span>
      <span className="text-[18px] font-semibold text-white/90">
        {weekdayLabel}
      </span>
    </header>
  );
}

/** 对齐 iOS：优先今天；没有今天则最近未来日；再没有则最近过去日 */
function resolveScrollTargetKey(
  groups: CalendarDateGroup[],
  anchor: Date,
): string | null {
  if (groups.length === 0) return null;
  const target = dateKey(startOfDay(anchor));
  const exact = groups.find((g) => dateKey(g.date) === target);
  if (exact) return dateKey(exact.date);

  const upcoming = groups.find((g) => dateKey(g.date) >= target);
  if (upcoming) return dateKey(upcoming.date);

  return dateKey(groups[groups.length - 1]!.date);
}

type ListEventsViewProps = {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onVisibleDateChange: (date: Date) => void;
  /** 进入列表时滚到的锚点日期，默认今天 */
  scrollToDate?: Date;
};

export function ListEventsView({
  events,
  onEventPress,
  onVisibleDateChange,
  scrollToDate,
}: ListEventsViewProps) {
  const { t } = useDictionary();
  const groups = useMemo(() => groupEventsByDate(events), [events]);
  const didInitialScroll = useRef(false);
  const anchorDate = useMemo(
    () => startOfDay(scrollToDate ?? new Date()),
    [scrollToDate],
  );

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

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resolveVisibleDate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [groups, resolveVisibleDate]);

  useEffect(() => {
    if (groups.length === 0 || didInitialScroll.current) return;

    const key = resolveScrollTargetKey(groups, anchorDate);
    if (!key) return;

    const targetGroup = groups.find((g) => dateKey(g.date) === key);
    if (targetGroup) onVisibleDateChange(targetGroup.date);

    const scrollToSection = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-list-date-key="${key}"]`,
      );
      if (!el) return false;
      const top =
        el.getBoundingClientRect().top + window.scrollY - LIST_SCROLL_ANCHOR_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      didInitialScroll.current = true;
      requestAnimationFrame(resolveVisibleDate);
      return true;
    };

    // 布局完成后再滚；最多重试几帧，避免首屏高度未算准
    let attempts = 0;
    let raf = 0;
    const tryScroll = () => {
      attempts += 1;
      if (scrollToSection() || attempts >= 8) return;
      raf = requestAnimationFrame(tryScroll);
    };
    raf = requestAnimationFrame(tryScroll);

    return () => cancelAnimationFrame(raf);
  }, [groups, anchorDate, onVisibleDateChange, resolveVisibleDate]);

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] font-medium text-white/50">
          {t("console.calendar.noEvents")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-32 pt-1">
      {groups.map((group) => (
        <section
          key={dateKey(group.date)}
          className="flex w-full flex-col items-stretch"
          data-list-date-section
          data-list-date-key={dateKey(group.date)}
          data-date={group.date.toISOString()}
          aria-label={group.weekdayLabel}
        >
          <DateSectionHeader
            dayNumber={group.dayNumber}
            weekdayLabel={group.weekdayLabel}
          />
          <div className="flex w-full flex-col items-stretch">
            {group.events.map((event) => (
              <CompactTaskCard
                key={event.id}
                event={event}
                onPress={() => onEventPress(event)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
