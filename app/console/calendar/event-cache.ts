import type { CalendarEvent, CalendarPerson } from "./types";
import { normalizeIdArray } from "./utils";

type SerializedCalendarEvent = Omit<CalendarEvent, "startAt" | "endAt"> & {
  startAt: string;
  endAt: string | null;
};

export function serializeCalendarEvents(events: CalendarEvent[]): SerializedCalendarEvent[] {
  return events.map((event) => ({
    ...event,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
  }));
}

export function reviveCalendarEvents(raw: unknown): CalendarEvent[] | null {
  if (!Array.isArray(raw)) return null;
  try {
    return raw.map((item) => {
      const row = item as SerializedCalendarEvent & {
        forWhomIds?: unknown;
        beneficiaries?: CalendarPerson[];
      };
      const beneficiaries = (row.beneficiaries ?? []).map((person) => ({
        ...person,
        matchIds:
          person.matchIds?.length > 0 ? person.matchIds : [person.id],
      }));
      return {
        ...row,
        startAt: new Date(row.startAt),
        endAt: row.endAt ? new Date(row.endAt) : null,
        forWhomIds: normalizeIdArray(row.forWhomIds),
        isFlexibleTodo: row.isFlexibleTodo ?? false,
        taskType: row.taskType ?? null,
        beneficiaries,
      };
    });
  } catch (error) {
    console.warn("[wefamily-cache] revive calendar events failed:", error);
    return null;
  }
}
