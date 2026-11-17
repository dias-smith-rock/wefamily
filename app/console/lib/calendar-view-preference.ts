import type { CalendarViewMode } from "../calendar/types";

const KEY = "wefamily_calendar_view_mode";

const VALID: ReadonlySet<CalendarViewMode> = new Set([
  "day",
  "week",
  "month",
  "list",
]);

export function getSavedCalendarViewMode(): CalendarViewMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && VALID.has(raw as CalendarViewMode)) {
      return raw as CalendarViewMode;
    }
    return null;
  } catch {
    return null;
  }
}

export function setSavedCalendarViewMode(mode: CalendarViewMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // ignore quota errors
  }
}
