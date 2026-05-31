import type { CalendarEvent } from "./types";
import { getActiveDictionary } from "@/lib/i18n/client-dictionary";
import { formatTodoDeadlineLabel } from "./todo-list-utils";
import { dateKey, startOfDay } from "./month-utils";
import { formatEventTime } from "./utils";

export type CalendarDateGroup = {
  date: Date;
  dayNumber: number;
  weekdayLabel: string;
  events: CalendarEvent[];
};

const listWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

/** 按 due_date 日历日分组，升序；无任务的日期不返回 */
export function groupEventsByDate(events: CalendarEvent[]): CalendarDateGroup[] {
  const byDate = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = dateKey(event.startAt);
    const bucket = byDate.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      byDate.set(key, [event]);
    }
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, dayEvents]) => {
      const sorted = [...dayEvents].sort(
        (a, b) => a.startAt.getTime() - b.startAt.getTime(),
      );
      const date = startOfDay(sorted[0]!.startAt);
      return {
        date,
        dayNumber: date.getDate(),
        weekdayLabel: listWeekdayFormatter.format(date),
        events: sorted,
      };
    });
}

/** 列表卡片时间：单点 "16:00"、区间 "14:55 - 15:55"，待办显示截止日 */
export function formatListEventTime(event: CalendarEvent): string {
  if (event.isFlexibleTodo) {
    return formatTodoDeadlineLabel(event);
  }

  if (event.isAllDay) return getActiveDictionary().console.calendar.allDay;

  const start = formatEventTime(event.startAt);
  if (!event.endAt) return start;

  const end = formatEventTime(event.endAt);
  if (end === start) return start;
  return `${start} - ${end}`;
}
