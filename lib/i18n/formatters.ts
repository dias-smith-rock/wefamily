import type { Locale } from "./config";
import type { Dictionary } from "./types";

export function formatLocaleDate(
  locale: Locale,
  iso: string | null | undefined,
): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatTaskDetailDateTime(
  locale: Locale,
  startAt: Date,
  isAllDay: boolean,
): string {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
    startAt,
  );
  const datePart = new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
  }).format(startAt);

  if (isAllDay) {
    return locale.startsWith("zh")
      ? `${datePart} ${weekday}`
      : `${weekday}, ${datePart}`;
  }

  const timePart = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(startAt);

  return locale.startsWith("zh")
    ? `${datePart} ${weekday} ${timePart}`
    : `${weekday}, ${datePart} ${timePart}`;
}

export function formatCalendarMonthLabel(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

export function formatEventTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function formatStatusLabel(
  dictionary: Dictionary,
  status: string,
): string {
  const s = status.trim().toLowerCase();
  const labels = dictionary.console.status;
  if (s === "pending" || s === "todo" || s === "待接受") return labels.pending;
  if (s === "accepted" || s === "in_progress" || s === "进行中") {
    return labels.inProgress;
  }
  if (s === "done" || s === "completed" || s === "已完成") return labels.done;
  if (s === "declined" || s === "cancelled" || s === "canceled") {
    return labels.cancelled;
  }
  return status || labels.fallback;
}

export function formatRoleLabel(dictionary: Dictionary, role: string): string {
  const r = role.trim().toLowerCase();
  const labels = dictionary.common.roles;
  if (r === "owner" || r === "creator") return labels.creator;
  if (r === "admin") return labels.admin;
  if (r === "member") return labels.member;
  return role.replace(/_/g, " ") || labels.member;
}

export function formatRecurrenceLabel(
  dictionary: Dictionary,
  rule: unknown,
  interval: unknown,
): string {
  const recurrence = dictionary.console.recurrence;
  const toToken = (value: unknown): string => {
    if (value == null) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" && !Number.isNaN(value)) return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    return String(value).trim();
  };

  const rawRule = toToken(rule);
  const rawInterval = toToken(interval);
  if (!rawRule && !rawInterval) return recurrence.never;

  const ruleLower = rawRule.toLowerCase();
  const intervalLower = rawInterval.toLowerCase();

  if (
    ruleLower === "none" ||
    ruleLower === "never" ||
    intervalLower === "none" ||
    intervalLower === "never"
  ) {
    return recurrence.never;
  }

  const map: Record<string, string> = {
    none: recurrence.never,
    never: recurrence.never,
    null: recurrence.never,
    daily: recurrence.daily,
    day: recurrence.daily,
    weekly: recurrence.weekly,
    week: recurrence.weekly,
    monthly: recurrence.monthly,
    month: recurrence.monthly,
    yearly: recurrence.yearly,
    year: recurrence.yearly,
    annual: recurrence.yearly,
  };

  for (const token of [ruleLower, intervalLower].filter(Boolean)) {
    if (map[token]) return map[token]!;
    if (token.includes("daily") || token.includes("freq=daily")) {
      return recurrence.daily;
    }
    if (token.includes("weekly") || token.includes("freq=weekly")) {
      return recurrence.weekly;
    }
    if (token.includes("monthly") || token.includes("freq=monthly")) {
      return recurrence.monthly;
    }
    if (
      token.includes("yearly") ||
      token.includes("annual") ||
      token.includes("freq=yearly")
    ) {
      return recurrence.yearly;
    }
  }

  return recurrence.never;
}

export function isStatusHighlight(
  dictionary: Dictionary,
  statusLabel: string,
): boolean {
  const s = statusLabel.trim();
  const labels = dictionary.console.status;
  return s === labels.pending || s === labels.inProgress || s === labels.fallback;
}

export type TaskPrioritySegment = "urgent" | "normal";

function toPriorityToken(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value).trim();
}

export function resolveTaskPrioritySegment(
  priority: unknown,
): TaskPrioritySegment {
  const p = toPriorityToken(priority).toLowerCase();
  if (
    p === "high" ||
    p === "urgent" ||
    p === "critical" ||
    p === "important"
  ) {
    return "urgent";
  }
  return "normal";
}
