import type { CalendarEvent } from "./types";
import { getActiveDictionary } from "@/lib/i18n/client-dictionary";
import { interpolate } from "@/lib/i18n/translate";
import { resolveClientLocale } from "@/lib/i18n/client-locale";
import { startOfDay } from "./month-utils";

export type TodoSectionId = "overdue" | "today" | "thisWeek" | "later";

export type TodoSection = {
  id: TodoSectionId;
  labelKey: string;
  events: CalendarEvent[];
};

function isOverdue(event: CalendarEvent, now: Date): boolean {
  if (!event.isFlexibleTodo || !event.endAt) return false;
  return event.endAt.getTime() < now.getTime();
}

function deadlineDay(event: CalendarEvent): Date | null {
  if (!event.isFlexibleTodo) return null;
  if (event.endAt) return startOfDay(event.endAt);
  return startOfDay(event.startAt);
}

/** 与 iOS TodoListViewModel.mainSectionedTasks 对齐（不含已逾期） */
export function groupTodosBySection(
  todos: CalendarEvent[],
  includeOverdue = false,
): TodoSection[] {
  const now = new Date();
  const today = startOfDay(now);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const buckets: Record<TodoSectionId, CalendarEvent[]> = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
  };

  for (const event of todos) {
    if (isOverdue(event, now)) {
      if (includeOverdue) buckets.overdue.push(event);
      continue;
    }

    const day = deadlineDay(event);
    if (!day) {
      buckets.later.push(event);
      continue;
    }

    if (day.getTime() === today.getTime()) {
      buckets.today.push(event);
    } else if (day.getTime() < weekEnd.getTime()) {
      buckets.thisWeek.push(event);
    } else {
      buckets.later.push(event);
    }
  }

  const sortByDeadline = (a: CalendarEvent, b: CalendarEvent) => {
    const aKey = a.endAt?.getTime() ?? a.startAt.getTime();
    const bKey = b.endAt?.getTime() ?? b.startAt.getTime();
    return aKey - bKey;
  };

  for (const key of Object.keys(buckets) as TodoSectionId[]) {
    buckets[key].sort(sortByDeadline);
  }

  const sectionOrder: TodoSectionId[] = includeOverdue
    ? ["overdue", "today", "thisWeek", "later"]
    : ["today", "thisWeek", "later"];

  const labelKeys: Record<TodoSectionId, string> = {
    overdue: "console.calendar.todoSectionOverdue",
    today: "console.calendar.todoSectionToday",
    thisWeek: "console.calendar.todoSectionThisWeek",
    later: "console.calendar.todoSectionLater",
  };

  return sectionOrder
    .map((id) => ({
      id,
      labelKey: labelKeys[id],
      events: buckets[id],
    }))
    .filter((section) => section.events.length > 0);
}

export function overdueTodos(todos: CalendarEvent[]): CalendarEvent[] {
  const now = new Date();
  return todos
    .filter((event) => isOverdue(event, now))
    .sort(
      (a, b) =>
        (a.endAt?.getTime() ?? 0) - (b.endAt?.getTime() ?? 0),
    );
}

/** 待办卡片截止文案，如「5/31 周六前」 */
export function formatTodoDeadlineLabel(event: CalendarEvent): string {
  const dictionary = getActiveDictionary();
  const locale = resolveClientLocale();

  if (!event.endAt) {
    return dictionary.console.calendar.todoNoDeadline;
  }

  const formatted = new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(event.endAt);

  if (locale.startsWith("zh")) {
    return `${formatted}前`;
  }
  return interpolate("Due {date}", { date: formatted });
}
