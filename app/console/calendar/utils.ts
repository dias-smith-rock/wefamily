import { addDays, subDays } from "date-fns";
import { getActiveDictionary } from "@/lib/i18n/client-dictionary";
import { profileAvatarDisplayUrl } from "../family/utils";
import {
  formatCalendarMonthLabel as formatCalendarMonthLabelI18n,
  formatStatusLabel as formatStatusLabelI18n,
} from "@/lib/i18n/formatters";
import { interpolate } from "@/lib/i18n/translate";
import { resolveClientLocale } from "@/lib/i18n/client-locale";
import {
  isFlexibleTodoTask,
  isOpenTodoStatus,
  isScheduledCalendarTask,
} from "./task-type";
import { taskTargetProfileIds } from "../lib/task-fields";
import type {
  CalendarDay,
  CalendarEvent,
  CalendarPerson,
  CalendarWeekView,
  MembershipLookupRow,
  ProfileLookupRow,
  TaskRow,
} from "./types";

function weekdayShort(dayIndex: number): string {
  return new Intl.DateTimeFormat(resolveClientLocale(), { weekday: "short" }).format(
    new Date(2024, 0, dayIndex),
  );
}

/** Header 月份标签 */
export function formatCalendarMonthLabel(date: Date): string {
  return formatCalendarMonthLabelI18n(resolveClientLocale(), date);
}

const AVATAR_CLASSES = [
  "bg-rose-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-fuchsia-500",
] as const;

function pickAvatarClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % AVATAR_CLASSES.length;
  }
  return AVATAR_CLASSES[hash]!;
}

export function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  if (/[\u4e00-\u9fff]/.test(trimmed)) return trimmed.slice(0, 1);
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function formatEventTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function formatStatusLabel(status: string): string {
  return formatStatusLabelI18n(getActiveDictionary(), status);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** 滚动时间轴：选中日前后各 14 天（共 29 天） */
export const TIMELINE_DAY_RADIUS = 14;

function collectIncompleteEventDates(events: CalendarEvent[]): Set<string> {
  const incompleteDates = new Set<string>();
  for (const e of events) {
    if (isIncompleteTask(e.status)) {
      incompleteDates.add(startOfDay(e.startAt).toDateString());
    }
  }
  return incompleteDates;
}

/** 围绕 anchorDate 生成 29 天滚动时间轴 */
export function buildTimelineDates(
  anchorDate: Date,
  events: CalendarEvent[],
): CalendarDay[] {
  const center = startOfDay(anchorDate);
  const today = startOfDay(new Date());
  const rangeStart = subDays(center, TIMELINE_DAY_RADIUS);
  const incompleteDates = collectIncompleteEventDates(events);
  const totalDays = TIMELINE_DAY_RADIUS * 2 + 1;

  return Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(rangeStart, index);
    return {
      date,
      weekdayShort: weekdayShort(date.getDay()),
      dayNumber: date.getDate(),
      hasEvents: incompleteDates.has(date.toDateString()),
      isSelected: sameCalendarDay(date, center),
      isToday: sameCalendarDay(date, today),
    };
  });
}

export function buildWeekView(
  selectedDate: Date,
  events: CalendarEvent[],
): CalendarWeekView {
  const anchor = startOfDay(selectedDate);
  const days = buildTimelineDates(anchor, events);
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  return {
    year: y,
    month: m + 1,
    label: formatCalendarMonthLabel(anchor),
    days,
  };
}

export function eventsForDate(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events
    .filter((e) => sameCalendarDay(e.startAt, date))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

type LookupMaps = {
  membershipById: Map<string, MembershipLookupRow>;
  profileById: Map<string, ProfileLookupRow>;
  profileByUserId: Map<string, ProfileLookupRow>;
  membershipByProfileId: Map<string, MembershipLookupRow>;
  membershipByUserId: Map<string, MembershipLookupRow>;
};

function buildLookupMaps(
  memberships: MembershipLookupRow[],
  profiles: ProfileLookupRow[],
): LookupMaps {
  const membershipById = new Map(memberships.map((m) => [m.id, m]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const profileByUserId = new Map<string, ProfileLookupRow>();
  const membershipByProfileId = new Map<string, MembershipLookupRow>();
  const membershipByUserId = new Map<string, MembershipLookupRow>();

  for (const p of profiles) {
    if (p.user_id) profileByUserId.set(p.user_id, p);
  }

  for (const m of memberships) {
    if (m.profile_id) membershipByProfileId.set(m.profile_id, m);
    if (m.user_id) membershipByUserId.set(m.user_id, m);
  }

  return {
    membershipById,
    profileById,
    profileByUserId,
    membershipByProfileId,
    membershipByUserId,
  };
}

/** 安全解析 for_whom / target_profile_ids 等 ID 数组 */
export function normalizeIdArray(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

function collectMatchIds(
  seed: string,
  extra: Array<string | null | undefined>,
): string[] {
  const out = new Set<string>([seed]);
  for (const id of extra) {
    if (id && id.trim()) out.add(id);
  }
  return [...out];
}

function resolvePerson(
  id: string,
  maps: LookupMaps,
): CalendarPerson | null {
  const dictionary = getActiveDictionary();
  const defaults = dictionary.common.defaults;
  const membership = maps.membershipById.get(id);
  if (membership) {
    const profile =
      (membership.profile_id
        ? maps.profileById.get(membership.profile_id)
        : null) ??
      (membership.user_id
        ? maps.profileByUserId.get(membership.user_id) ?? null
        : null);
    const name =
      membership.nickname?.trim() ||
      profile?.name?.trim() ||
      defaults.member;
    const isManaged = !membership.user_id || Boolean(profile && !profile.user_id);
    return {
      id: membership.id,
      name,
      avatarUrl: profileAvatarDisplayUrl(profile),
      initials: initialsFromName(name),
      avatarClass: pickAvatarClass(membership.id),
      isManagedProfile: isManaged,
      matchIds: collectMatchIds(membership.id, [
        membership.profile_id,
        membership.user_id,
        profile?.id,
        profile?.user_id,
      ]),
    };
  }

  const profile = maps.profileById.get(id);
  if (profile) {
    const name = profile.name?.trim() || defaults.profileMember;
    const isManaged = !profile.user_id;
    const linked = maps.membershipByProfileId.get(profile.id);
    return {
      id: profile.id,
      name,
      avatarUrl: profileAvatarDisplayUrl(profile),
      initials: initialsFromName(name),
      avatarClass: pickAvatarClass(profile.id),
      isManagedProfile: isManaged,
      matchIds: collectMatchIds(profile.id, [
        profile.user_id,
        linked?.id,
        linked?.user_id,
      ]),
    };
  }

  const byProfile = maps.membershipByProfileId.get(id);
  if (byProfile) return resolvePerson(byProfile.id, maps);

  const byUser = maps.membershipByUserId.get(id);
  if (byUser) return resolvePerson(byUser.id, maps);

  return null;
}

/** 判断成员是否在当前任务的 for_whom / target_profile_ids 中 */
export function personIsInForWhomList(
  person: CalendarPerson,
  forWhomIds: string[] | null | undefined,
): boolean {
  const ids = normalizeIdArray(forWhomIds);
  if (ids.length === 0) return false;
  const set = new Set(ids);
  return person.matchIds.some((key) => set.has(key));
}

function resolvePeople(ids: string[] | null | undefined, maps: LookupMaps): CalendarPerson[] {
  const normalized = normalizeIdArray(ids);
  if (normalized.length === 0) return [];
  const seen = new Set<string>();
  const out: CalendarPerson[] = [];
  for (const id of normalized) {
    const p = resolvePerson(id, maps);
    if (!p) continue;
    const dedupeKey = p.matchIds.join("|");
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(p);
  }
  return out;
}

function formatAssigneeLabel(assignees: CalendarPerson[]): string {
  const dictionary = getActiveDictionary();
  if (assignees.length === 0) return dictionary.common.everyone;
  if (assignees.length === 1) return assignees[0]!.name;
  if (assignees.length <= 3) {
    return assignees.map((a) => a.name).join("、");
  }
  return interpolate(dictionary.common.defaults.peopleCount, {
    count: assignees[0]!.name,
    total: assignees.length,
  });
}

function startOfDayLocal(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 灵活待办截止日（`end_datetime` 的日历日） */
export function flexibleDeadlineDay(task: TaskRow): Date | null {
  if (!isFlexibleTodoTask(task) || !task.end_datetime) return null;
  return startOfDayLocal(new Date(task.end_datetime));
}

function buildCalendarEventBase(
  task: TaskRow,
  maps: LookupMaps,
): Omit<CalendarEvent, "startAt" | "endAt" | "isAllDay"> {
  const forWhomIds = taskTargetProfileIds(task);
  const beneficiaries = resolvePeople(forWhomIds, maps);
  const assignees = resolvePeople(task.involved_member_ids, maps);
  const forPerson = beneficiaries[0] ?? null;

  return {
    id: task.id,
    title: task.title?.trim() || getActiveDictionary().common.defaults.unnamedTask,
    description: task.description,
    status: task.status,
    priority: task.priority,
    statusLabel: formatStatusLabel(task.status),
    forPerson,
    forWhomIds,
    assigneeLabel: formatAssigneeLabel(assignees),
    assignees,
    beneficiaries,
    recurrenceRule: task.recurrence_rule,
    recurrenceInterval: task.recurrence_interval,
    taskType: task.task_type,
    isFlexibleTodo: isFlexibleTodoTask(task),
  };
}

function mapScheduledTask(
  task: TaskRow,
  maps: LookupMaps,
): CalendarEvent | null {
  if (!isScheduledCalendarTask(task) || !task.due_date) return null;

  const startAt = new Date(task.due_date);
  const endAt = task.end_datetime ? new Date(task.end_datetime) : null;

  return {
    ...buildCalendarEventBase(task, maps),
    startAt,
    endAt,
    isAllDay: Boolean(task.is_all_day),
    isFlexibleTodo: false,
  };
}

function mapFlexibleTodoTask(
  task: TaskRow,
  maps: LookupMaps,
): CalendarEvent | null {
  if (!isFlexibleTodoTask(task)) return null;

  const deadline = task.end_datetime ? new Date(task.end_datetime) : null;
  const deadlineDay = flexibleDeadlineDay(task);
  const fallbackStart = task.created_at
    ? new Date(task.created_at)
    : new Date();

  return {
    ...buildCalendarEventBase(task, maps),
    startAt: deadlineDay ?? startOfDayLocal(fallbackStart),
    endAt: deadline,
    isAllDay: true,
    isFlexibleTodo: true,
  };
}

export function mapTasksToCalendarEvents(
  tasks: TaskRow[],
  memberships: MembershipLookupRow[],
  profiles: ProfileLookupRow[],
): CalendarEvent[] {
  const maps = buildLookupMaps(memberships, profiles);
  const events: CalendarEvent[] = [];

  for (const task of tasks) {
    const mapped = isFlexibleTodoTask(task)
      ? mapFlexibleTodoTask(task, maps)
      : mapScheduledTask(task, maps);
    if (mapped) events.push(mapped);
  }

  return events;
}

/** 日程 Tab 可见事件（排除灵活待办） */
export function scheduledCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => !event.isFlexibleTodo);
}

/** 待办 Tab 可见事件（灵活待办且未完成） */
export function openFlexibleTodoEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(
    (event) => event.isFlexibleTodo && isOpenTodoStatus(event.status),
  );
}

export function isIncompleteTask(status: string): boolean {
  return isOpenTodoStatus(status);
}

/** 详情抽屉：是否未指定具体受益人（全家任务） */
export function isHouseholdWideBeneficiaries(event: CalendarEvent): boolean {
  const ids = normalizeIdArray(event.forWhomIds);
  return ids.length === 0 && event.beneficiaries.length === 0;
}

/** 任务卡片：解析「为了谁」展示用成员列表 */
export function getForWhomPeople(event: CalendarEvent): CalendarPerson[] {
  if (isHouseholdWideBeneficiaries(event)) return [];
  if (event.beneficiaries.length > 0) return event.beneficiaries;
  return event.forPerson ? [event.forPerson] : [];
}
