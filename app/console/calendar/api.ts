import { requireAuthenticatedSession } from "@/lib/auth/require-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { mapTasksToCalendarEvents } from "./utils";
import type {
  CalendarPageData,
  FetchCalendarResult,
  MembershipLookupRow,
  ProfileLookupRow,
  TaskRow,
} from "./types";

const TASK_COLUMNS =
  "id, title, description, status, priority, due_date, end_datetime, is_all_day, involved_member_ids, target_profile_ids, recurrence_rule, recurrence_interval";

const MEMBERSHIP_COLUMNS =
  "id, user_id, profile_id, nickname, avatar_url";

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
  return {
    id: String(raw.id),
    title: String(raw.title ?? ""),
    description: (raw.description as string | null) ?? null,
    status: String(raw.status ?? "pending"),
    priority: (raw.priority as string | null) ?? null,
    due_date: (raw.due_date as string | null) ?? null,
    end_datetime: (raw.end_datetime as string | null) ?? null,
    is_all_day: (raw.is_all_day as boolean | null) ?? null,
    involved_member_ids: (raw.involved_member_ids as string[] | null) ?? null,
    target_profile_ids: (raw.target_profile_ids as string[] | null) ?? null,
    recurrence_rule: toOptionalString(raw.recurrence_rule),
    recurrence_interval: toOptionalString(raw.recurrence_interval),
  };
}

function collectReferencedPersonIds(tasks: TaskRow[]): string[] {
  const ids = new Set<string>();
  for (const task of tasks) {
    for (const id of task.target_profile_ids ?? []) {
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
    avatar_url: (raw.avatar_url as string | null) ?? null,
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
    return { ok: false, reason: "no_client", message: "缺少 Supabase 配置" };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { ok: false, reason: "no_session", message: "请先登录" };
  }

  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    if (guard.reason === "expired") {
      return {
        ok: false,
        reason: "expired",
        message: guard.message ?? "登录已过期，请重新登录",
      };
    }
    return { ok: false, reason: "no_session", message: "请先登录" };
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
