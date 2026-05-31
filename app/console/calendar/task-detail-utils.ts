import type { CalendarEvent } from "./types";
import { getActiveDictionary } from "@/lib/i18n/client-dictionary";
import {
  formatRecurrenceLabel,
  formatTaskDetailDateTime,
  isStatusHighlight as isStatusHighlightI18n,
  resolveTaskPrioritySegment,
} from "@/lib/i18n/formatters";
import { resolveClientLocale } from "@/lib/i18n/client-locale";

export type TaskPrioritySegment = "urgent" | "normal";

export { resolveTaskPrioritySegment };

export function formatTaskDetailDateTimeLegacy(
  startAt: Date,
  isAllDay: boolean,
): string {
  return formatTaskDetailDateTime(resolveClientLocale(), startAt, isAllDay);
}

export function isStatusHighlight(statusLabel: string): boolean {
  return isStatusHighlightI18n(getActiveDictionary(), statusLabel);
}

export function getTaskDetailFieldValues(event: CalendarEvent) {
  const dictionary = getActiveDictionary();
  const detail = dictionary.console.taskDetail;
  const calendar = dictionary.console.calendar;
  const timeValue = formatTaskDetailDateTime(
    resolveClientLocale(),
    event.startAt,
    event.isAllDay,
  );
  const prioritySegment = resolveTaskPrioritySegment(event.priority);

  return {
    timeValue,
    repeatValue: formatRecurrenceLabel(
      dictionary,
      event.recurrenceRule,
      event.recurrenceInterval,
    ),
    reminderValue: detail.reminderDefault,
    assigneeValue: event.assigneeLabel || dictionary.common.everyone,
    budgetValue: detail.budgetDefault,
    statusValue: event.statusLabel,
    statusHighlight: isStatusHighlight(event.statusLabel),
    prioritySegment,
    locationValue: detail.locationDefault,
    emergencyContactValue: detail.emergencyDefault,
    descriptionValue: event.description?.trim() || "",
    descriptionPlaceholder: event.description?.trim()
      ? null
      : detail.descriptionPlaceholder,
    notesEmptyLabel: detail.notesEmpty,
    labels: calendar,
    priorityUrgent: calendar.priorityUrgent,
    priorityNormal: calendar.priorityNormal,
  };
}
