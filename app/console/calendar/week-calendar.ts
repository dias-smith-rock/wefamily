import { addDays } from "date-fns";
import { resolveClientLocale } from "@/lib/i18n/client-locale";
import type { CalendarDay, CalendarEvent } from "./types";
import { dateKey, startOfDay } from "./month-utils";
import { isOpenTodoStatus } from "./task-type";

/** JS getDay()：0=周日 … 6=周六 */
export function localeFirstWeekday(): number {
  try {
    const locale = new Intl.Locale(resolveClientLocale());
    const info = (
      locale as Intl.Locale & { weekInfo?: { firstDay?: number } }
    ).weekInfo;
    // Intl: 1=周一 … 7=周日 → JS 0=周日
    if (info?.firstDay != null) {
      return info.firstDay === 7 ? 0 : info.firstDay;
    }
  } catch {
    // fall through
  }
  const loc = resolveClientLocale().toLowerCase();
  if (loc.startsWith("zh") || loc.startsWith("ja") || loc.startsWith("ko")) {
    return 1;
  }
  return 0;
}

export function startOfWeek(
  date: Date,
  firstWeekday: number = localeFirstWeekday(),
): Date {
  const day = startOfDay(date);
  const delta = (day.getDay() - firstWeekday + 7) % 7;
  return addDays(day, -delta);
}

export function daysInWeek(weekStart: Date): Date[] {
  const start = startOfDay(weekStart);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function shiftDateByWeeks(date: Date, weekDelta: number): Date {
  return addDays(startOfDay(date), weekDelta * 7);
}

function weekdayShortLabel(date: Date): string {
  return new Intl.DateTimeFormat(resolveClientLocale(), {
    weekday: "short",
  }).format(date);
}

/** 生成选中日所在自然周的 7 天条 */
export function buildWeekStripDays(
  selectedDate: Date,
  events: CalendarEvent[],
  firstWeekday: number = localeFirstWeekday(),
): CalendarDay[] {
  const selected = startOfDay(selectedDate);
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(selected, firstWeekday);
  const incomplete = new Set<string>();
  for (const event of events) {
    if (isOpenTodoStatus(event.status)) {
      incomplete.add(dateKey(event.startAt));
    }
  }

  return daysInWeek(weekStart).map((date) => ({
    date,
    weekdayShort: weekdayShortLabel(date),
    dayNumber: date.getDate(),
    hasEvents: incomplete.has(dateKey(date)),
    isSelected: dateKey(date) === dateKey(selected),
    isToday: dateKey(date) === dateKey(today),
  }));
}
