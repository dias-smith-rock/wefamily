import { requireAuthenticatedSession } from "@/lib/auth/require-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { HOUSEHOLD_MEMBERSHIP_COLUMNS } from "../lib/membership-query";
import { normalizeTaskTargetFields, taskTargetProfileIds } from "../lib/task-fields";
import { mapTasksToCalendarEvents } from "./utils";
import { resolveGuestDisplayName } from "../lib/guest-display-name";
import type {
  CalendarPageData,
  CreateTaskInput,
  FetchCalendarResult,
  HouseholdPersonOption,
  MembershipLookupRow,
  ProfileLookupRow,
  TaskRow,
} from "./types";

const TASK_COLUMNS =
  "id, title, description, status, priority, due_date, end_datetime, is_all_day, creator_id, involved_member_ids, target_profile_ids, recurrence_rule, recurrence_interval, task_type, created_at";

const MEMBERSHIP_COLUMNS = HOUSEHOLD_MEMBERSHIP_COLUMNS;

const PROFILE_COLUMNS =
  "id, name, avatar_url, user_id";

function toOptionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && !Number.isNaN(value)) {
    return String(value);
  }
  return String(value).trim() || null;
}

function normalizeTask(raw: Record<string, unknown>): TaskRow {
  const targetFields = normalizeTaskTargetFields(raw);
  return {
    id: String(raw.id),
    title: String(raw.title ?? ""),
    description: (raw.description as string | null) ?? null,
    status: String(raw.status ?? "pending"),
    priority: (raw.priority as string | null) ?? null,
    due_date: (raw.due_date as string | null) ?? null,
    end_datetime: (raw.end_datetime as string | null) ?? null,
    is_all_day: (raw.is_all_day as boolean | null) ?? null,
    creator_id: (raw.creator_id as string | null) ?? null,
    involved_member_ids: (raw.involved_member_ids as string[] | null) ?? null,
    ...targetFields,
    recurrence_rule: toOptionalString(raw.recurrence_rule),
    recurrence_interval: toOptionalString(raw.recurrence_interval),
    task_type: toOptionalString(raw.task_type),
    created_at: toOptionalString(raw.created_at),
  };
}

function collectReferencedPersonIds(tasks: TaskRow[]): string[] {
  const ids = new Set<string>();
  for (const task of tasks) {
    for (const id of taskTargetProfileIds(task)) {
      if (id) ids.add(id);
    }
    for (const id of task.involved_member_ids ?? []) {
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

function normalizeMembership(raw: Record<string, unknown>): MembershipLookupRow {
  return {
    id: String(raw.id),
    user_id: (raw.user_id as string | null) ?? null,
    profile_id: (raw.profile_id as string | null) ?? null,
    nickname: (raw.nickname as string | null) ?? null,
  };
}

function normalizeProfile(raw: Record<string, unknown>): ProfileLookupRow {
  return {
    id: String(raw.id),
    name: (raw.name as string | null) ?? null,
    avatar_url: (raw.avatar_url as string | null) ?? null,
    user_id: (raw.user_id as string | null) ?? null,
  };
}

export async function fetchCalendarPageData(
  householdId: string,
): Promise<FetchCalendarResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { ok: false, reason: "no_session", message: "pleaseSignIn" };
  }

  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    if (guard.reason === "expired") {
      return { ok: false, reason: "expired", message: "sessionExpired" };
    }
    return { ok: false, reason: "no_session", message: "pleaseSignIn" };
  }

  const [tasksRes, membershipsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select(TASK_COLUMNS)
      .eq("household_id", householdId)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("household_memberships")
      .select(MEMBERSHIP_COLUMNS)
      .eq("household_id", householdId)
      .eq("status", "active"),
  ]);

  if (tasksRes.error) {
    return { ok: false, reason: "error", message: tasksRes.error.message };
  }
  if (membershipsRes.error) {
    return { ok: false, reason: "error", message: membershipsRes.error.message };
  }

  const memberships = (membershipsRes.data ?? []).map((r) =>
    normalizeMembership(r as unknown as Record<string, unknown>),
  );

  const profileIds = [
    ...new Set(
      memberships
        .map((m) => m.profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const tasks = (tasksRes.data ?? []).map((r) =>
    normalizeTask(r as unknown as Record<string, unknown>),
  );

  const profileIdSet = new Set(profileIds);
  for (const id of collectReferencedPersonIds(tasks)) {
    profileIdSet.add(id);
  }

  let profiles: ProfileLookupRow[] = [];
  const allProfileIds = [...profileIdSet];
  if (allProfileIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from("family_profiles")
      .select(PROFILE_COLUMNS)
      .eq("household_id", householdId)
      .in("id", allProfileIds);

    if (profilesError) {
      return { ok: false, reason: "error", message: profilesError.message };
    }

    profiles = (profileRows ?? []).map((r) =>
      normalizeProfile(r as unknown as Record<string, unknown>),
    );
  }

  const events = mapTasksToCalendarEvents(tasks, memberships, profiles);

  return {
    ok: true,
    data: { events },
  };
}

export type CreateTaskResult =
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error" | "validation";
      message: string;
    };

export type FetchHouseholdPeopleResult =
  | { ok: true; data: HouseholdPersonOption[] }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error";
      message: string;
    };

export async function fetchHouseholdPeople(
  householdId: string,
): Promise<FetchHouseholdPeopleResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    if (guard.reason === "expired") {
      return { ok: false, reason: "expired", message: "sessionExpired" };
    }
    return { ok: false, reason: "no_session", message: "pleaseSignIn" };
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from("household_memberships")
    .select(MEMBERSHIP_COLUMNS)
    .eq("household_id", householdId)
    .eq("status", "active");

  if (membershipError) {
    return { ok: false, reason: "error", message: membershipError.message };
  }

  const memberships = (membershipRows ?? []).map((r) =>
    normalizeMembership(r as unknown as Record<string, unknown>),
  );

  const profileIds = [
    ...new Set(
      memberships
        .map((m) => m.profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  let profiles: ProfileLookupRow[] = [];
  if (profileIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from("family_profiles")
      .select(PROFILE_COLUMNS)
      .eq("household_id", householdId)
      .in("id", profileIds);

    if (profilesError) {
      return { ok: false, reason: "error", message: profilesError.message };
    }

    profiles = (profileRows ?? []).map((r) =>
      normalizeProfile(r as unknown as Record<string, unknown>),
    );
  }

  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const people: HouseholdPersonOption[] = memberships.map((m) => {
    const profile = m.profile_id ? profileById.get(m.profile_id) : undefined;
    const rawName =
      m.nickname?.trim() ||
      profile?.name?.trim() ||
      "";
    const name = m.profile_id
      ? resolveGuestDisplayName(rawName || "新成员", m.profile_id)
      : rawName || m.id.slice(0, 8);

    return {
      membershipId: m.id,
      profileId: m.profile_id,
      name,
    };
  });

  people.sort((a, b) => a.name.localeCompare(b.name, "zh"));
  return { ok: true, data: people };
}

export async function createTask(
  input: CreateTaskInput,
): Promise<CreateTaskResult> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, reason: "validation", message: "titleRequired" };
  }
  if (!input.householdId || !input.creatorId) {
    return { ok: false, reason: "validation", message: "missingConfig" };
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "missingConfig" };
  }

  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    if (guard.reason === "expired") {
      return { ok: false, reason: "expired", message: "sessionExpired" };
    }
    return { ok: false, reason: "no_session", message: "pleaseSignIn" };
  }

  const isFlexible = input.mode === "flexible";
  const isAllDay = isFlexible ? false : Boolean(input.isAllDay);
  const dueDate = isFlexible ? null : input.dueDate ?? null;
  const endDatetime = input.endDatetime ?? null;

  if (!isFlexible && !dueDate) {
    return { ok: false, reason: "validation", message: "startRequired" };
  }

  let durationMinutes = input.durationMinutes;
  if (durationMinutes == null) {
    if (isFlexible) {
      durationMinutes = 60;
    } else if (isAllDay) {
      durationMinutes = 0;
    } else if (dueDate && endDatetime) {
      const ms = new Date(endDatetime).getTime() - new Date(dueDate).getTime();
      durationMinutes = Math.max(0, Math.round(ms / 60000));
    } else {
      durationMinutes = 30;
    }
  }

  const priority = input.priority ?? "normal";
  const recurrenceRule = input.recurrenceRule?.trim() || null;

  const payload = {
    household_id: input.householdId,
    creator_id: input.creatorId,
    title,
    description: input.description?.trim() || null,
    status: "new",
    priority,
    task_type: isFlexible ? "flexible" : "scheduled",
    due_date: dueDate,
    end_datetime: endDatetime,
    is_all_day: isAllDay,
    involved_member_ids:
      input.involvedMemberIds && input.involvedMemberIds.length > 0
        ? input.involvedMemberIds
        : null,
    target_profile_ids:
      input.targetProfileIds && input.targetProfileIds.length > 0
        ? input.targetProfileIds
        : null,
    recurrence_rule: recurrenceRule,
    recurrence_interval: 1,
    duration_minutes: durationMinutes,
    source: "manual",
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { ok: false, reason: "error", message: error.message };
  }

  return { ok: true, id: String(data.id) };
}
