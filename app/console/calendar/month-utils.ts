import type { CalendarEvent } from "./types";

export const MONTH_PICKER_WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

const MONTH_TITLE_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type TaskDotTone = "blue" | "orange";

export type MonthGridCell = {
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months, 1);
  return startOfMonth(x);
}

export function sameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function dateKey(d: Date): string {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 月历抽屉标题，如 "May 2026" */
export function formatMonthYearTitle(monthAnchor: Date): string {
  const m = monthAnchor.getMonth();
  const y = monthAnchor.getFullYear();
  return `${MONTH_TITLE_NAMES[m]} ${y}`;
}

/** 生成含上月末、下月初补齐的 6 行月历格（42 格） */
export function buildMonthGrid(
  monthAnchor: Date,
  selectedDate: Date,
): MonthGridCell[] {
  const anchor = startOfMonth(monthAnchor);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const today = startOfDay(new Date());

  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: MonthGridCell[] = [];

  for (let i = 0; i < 42; i++) {
    const dayOffset = i - firstWeekday;
    const date = new Date(year, month, 1 + dayOffset);
    const inCurrentMonth = date.getMonth() === month;

    cells.push({
      date: startOfDay(date),
      dayNumber: date.getDate(),
      inCurrentMonth,
      isToday: sameCalendarDay(date, today),
      isSelected: sameCalendarDay(date, selectedDate),
    });
  }

  return cells;
}

export function dotToneFromPriority(priority: string | null | undefined): TaskDotTone {
  const p = (priority ?? "").trim().toLowerCase();
  if (
    p === "high" ||
    p === "urgent" ||
    p === "critical" ||
    p === "important"
  ) {
    return "orange";
  }
  return "blue";
}

/** 某日任务圆点（最多 4 个，按优先级着色） */
export function taskDotsForDate(
  events: CalendarEvent[],
  date: Date,
): TaskDotTone[] {
  const key = dateKey(date);
  const dayEvents = events.filter((e) => dateKey(e.startAt) === key);
  if (dayEvents.length === 0) return [];

  const tones = dayEvents
    .slice(0, 4)
    .map((e) => dotToneFromPriority(e.priority));

  return tones;
}

export function eventsOnDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const key = dateKey(date);
  return events.filter((e) => dateKey(e.startAt) === key);
}
