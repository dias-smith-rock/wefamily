import type { CalendarEvent } from "./types";
import { formatEventTime } from "./utils";

const WEEKDAY_ZH = new Intl.DateTimeFormat("zh-CN", { weekday: "long" });

export type TaskPrioritySegment = "urgent" | "normal";

const RECURRENCE_LABELS: Record<string, string> = {
  none: "永不",
  never: "永不",
  null: "永不",
  daily: "每天",
  day: "每天",
  weekly: "每周",
  week: "每周",
  monthly: "每月",
  month: "每月",
  yearly: "每年",
  year: "每年",
  annual: "每年",
};

function toRecurrenceToken(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value).trim();
}

/** 将 recurrence_rule / recurrence_interval 转为中文展示 */
export function formatRecurrenceLabel(
  rule: unknown,
  interval: unknown,
): string {
  const rawRule = toRecurrenceToken(rule);
  const rawInterval = toRecurrenceToken(interval);

  if (!rawRule && !rawInterval) return "永不";

  const ruleLower = rawRule.toLowerCase();
  const intervalLower = rawInterval.toLowerCase();

  if (
    ruleLower === "none" ||
    ruleLower === "never" ||
    intervalLower === "none" ||
    intervalLower === "never"
  ) {
    return "永不";
  }

  const tokens = [ruleLower, intervalLower].filter(Boolean);
  for (const token of tokens) {
    if (RECURRENCE_LABELS[token]) return RECURRENCE_LABELS[token]!;

    if (token.includes("daily") || token.includes("freq=daily")) return "每天";
    if (token.includes("weekly") || token.includes("freq=weekly")) return "每周";
    if (token.includes("monthly") || token.includes("freq=monthly")) return "每月";
    if (
      token.includes("yearly") ||
      token.includes("annual") ||
      token.includes("freq=yearly")
    ) {
      return "每年";
    }
  }

  return "永不";
}

export function resolveTaskPrioritySegment(
  priority: unknown,
): TaskPrioritySegment {
  const p = toRecurrenceToken(priority).toLowerCase();
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

export function formatTaskDetailDateTime(
  startAt: Date,
  isAllDay: boolean,
): string {
  const m = startAt.getMonth() + 1;
  const d = startAt.getDate();
  const weekday = WEEKDAY_ZH.format(startAt);
  if (isAllDay) return `${m}月${d}日 ${weekday}`;
  return `${m}月${d}日 ${weekday} ${formatEventTime(startAt)}`;
}

export function isStatusHighlight(statusLabel: string): boolean {
  const s = statusLabel.trim();
  return s === "待接受" || s === "进行中" || s === "待处理";
}

export function getTaskDetailFieldValues(event: CalendarEvent) {
  const timeValue = formatTaskDetailDateTime(event.startAt, event.isAllDay);
  const prioritySegment = resolveTaskPrioritySegment(event.priority);

  return {
    timeValue,
    repeatValue: formatRecurrenceLabel(
      event.recurrenceRule,
      event.recurrenceInterval,
    ),
    reminderValue: "提前 15 分钟",
    assigneeValue: event.assigneeLabel || "所有人",
    budgetValue: "无",
    statusValue: event.statusLabel,
    statusHighlight: isStatusHighlight(event.statusLabel),
    prioritySegment,
    locationValue: "东田丽园",
    emergencyContactValue: "无",
    descriptionValue: event.description?.trim() || "",
    descriptionPlaceholder: event.description?.trim()
      ? null
      : "可填写开支明细、支付方式等…",
    notesEmptyLabel: "暂无备注",
  };
}
