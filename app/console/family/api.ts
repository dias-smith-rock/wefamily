import { requireAuthenticatedSession } from "@/lib/auth/require-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  isIncompleteTask,
  memberTaskFilterIds,
  membershipToDisplay,
  profileToDisplay,
  sortFamilyMembers,
  taskMatchesMember,
} from "./utils";
import { HOUSEHOLD_MEMBERSHIP_COLUMNS } from "../lib/membership-query";
import { normalizeTaskTargetFields } from "../lib/task-fields";
import type {
  FamilyMemberDisplay,
  FamilyProfileRow,
  FetchFamilyResult,
  HouseholdRow,
  MembershipRow,
  MembershipRowBase,
  TaskRow,
} from "./types";

const MEMBERSHIP_COLUMNS = HOUSEHOLD_MEMBERSHIP_COLUMNS;

const PROFILE_COLUMNS = [
  "id",
  "household_id",
  "name",
  "gender",
  "birth_date",
  "avatar_url",
  "email",
  "mainphone",
  "secondphone",
  "user_id",
  "school",
  "grade",
].join(", ");

function normalizeMembership(raw: Record<string, unknown>): MembershipRowBase {
  return {
    id: String(raw.id),
    household_id: String(raw.household_id),
    user_id: (raw.user_id as string | null) ?? null,
    profile_id: (raw.profile_id as string | null) ?? null,
    role: String(raw.role ?? "member"),
    nickname: (raw.nickname as string | null) ?? null,
    status: String(raw.status ?? "active"),
    joined_at: (raw.joined_at as string | null) ?? null,
    created_at: (raw.created_at as string | null) ?? null,
  };
}

function normalizeProfile(raw: Record<string, unknown>): FamilyProfileRow {
  const num = (v: unknown) =>
    v == null || v === "" ? null : Number(v);

  return {
    id: String(raw.id),
    household_id: String(raw.household_id ?? ""),
    name: (raw.name as string | null) ?? null,
    gender: (raw.gender as string | null) ?? null,
    birth_date: (raw.birth_date as string | null) ?? null,
    id_card_num: (raw.id_card_num as string | null) ?? null,
    other_id_1: (raw.other_id_1 as string | null) ?? null,
    other_id_2: (raw.other_id_2 as string | null) ?? null,
    height: num(raw.height),
    weight: num(raw.weight),
    school: (raw.school as string | null) ?? null,
    grade: (raw.grade as string | null) ?? null,
    created_by: (raw.created_by as string | null) ?? null,
    created_at: (raw.created_at as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
    avatar_url: (raw.avatar_url as string | null) ?? null,
    user_id: (raw.user_id as string | null) ?? null,
    passport_num: (raw.passport_num as string | null) ?? null,
    permit_num: (raw.permit_num as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    mainphone: (raw.mainphone as string | null) ?? null,
    secondphone: (raw.secondphone as string | null) ?? null,
  };
}

function mergeMembershipsWithProfiles(
  memberships: MembershipRowBase[],
  profiles: FamilyProfileRow[],
): MembershipRow[] {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  return memberships.map((m) => ({
    ...m,
    family_profiles: m.profile_id
      ? (profileMap.get(m.profile_id) ?? null)
      : null,
  }));
}

export async function fetchFamilyPageData(
  householdId: string,
  currentUserId: string,
): Promise<FetchFamilyResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, reason: "no_client", message: "缺少 Supabase 配置" };
  }

  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    if (guard.reason === "no_session") {
      return { ok: false, reason: "no_session", message: "请先登录" };
    }
    if (guard.reason === "expired") {
      return {
        ok: false,
        reason: "expired",
        message: guard.message ?? "登录已过期，请重新登录",
      };
    }
    return { ok: false, reason: "no_client", message: "缺少 Supabase 配置" };
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, name, created_at, creator_id")
    .eq("id", householdId)
    .maybeSingle();

  if (householdError) {
    return { ok: false, reason: "error", message: householdError.message };
  }
  if (!household) {
    return { ok: false, reason: "error", message: "未找到家庭信息" };
  }

  const { data: membershipRows, error: membersError } = await supabase
    .from("household_memberships")
    .select(MEMBERSHIP_COLUMNS)
    .eq("household_id", householdId)
    .eq("status", "active")
    .order("joined_at", { ascending: true, nullsFirst: false });

  if (membersError) {
    return { ok: false, reason: "error", message: membersError.message };
  }

  const membershipsBase = (membershipRows ?? []).map((row) =>
    normalizeMembership(row as Record<string, unknown>),
  );

  const { data: profileRows, error: profilesError } = await supabase
    .from("family_profiles")
    .select(PROFILE_COLUMNS)
    .eq("household_id", householdId);

  if (profilesError) {
    return { ok: false, reason: "error", message: profilesError.message };
  }

  const allProfiles = (profileRows ?? []).map((row) =>
    normalizeProfile(row as unknown as Record<string, unknown>),
  );

  const memberships = mergeMembershipsWithProfiles(
    membershipsBase,
    allProfiles,
  );
  const householdRow = household as HouseholdRow;

  const membershipDisplays = memberships.map((m) =>
    membershipToDisplay(m, householdRow),
  );

  const linkedProfileIds = new Set(
    membershipDisplays
      .map((d) => d.profileId)
      .filter((id): id is string => Boolean(id)),
  );

  const orphanProfileDisplays = allProfiles
    .filter((p) => !linkedProfileIds.has(p.id))
    .map((p) => profileToDisplay(p));

  const displays = [...membershipDisplays, ...orphanProfileDisplays];

  const self = displays.find((d) => d.userId === currentUserId);

  if (!self) {
    return {
      ok: false,
      reason: "error",
      message: "当前用户不在该家庭成员列表中",
    };
  }

  const others = sortFamilyMembers(
    displays.filter((d) => d.membershipId !== self.membershipId),
  );

  return {
    ok: true,
    data: {
      household: householdRow,
      self,
      others,
      memberCount: displays.length,
    },
  };
}

export async function fetchMemberTasks(
  householdId: string,
  member: FamilyMemberDisplay,
): Promise<{ tasks: TaskRow[]; error: string | null; unauthorized?: boolean }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { tasks: [], error: "缺少 Supabase 配置" };
  }

  const guard = await requireAuthenticatedSession(supabase);
  if (!guard.ok) {
    return {
      tasks: [],
      error: guard.message ?? "请先登录",
      unauthorized: true,
    };
  }

  const ids = memberTaskFilterIds(member);

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, title, status, due_date, involved_member_ids, target_profile_ids",
    )
    .eq("household_id", householdId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    return { tasks: [], error: error.message };
  }

  const rows = (data ?? []).map((row) => {
    const raw = row as Record<string, unknown>;
    const targetFields = normalizeTaskTargetFields(raw);
    return {
      id: String(raw.id),
      title: String(raw.title ?? ""),
      status: String(raw.status ?? "pending"),
      due_date: (raw.due_date as string | null) ?? null,
      involved_member_ids: (raw.involved_member_ids as string[] | null) ?? null,
      ...targetFields,
    } satisfies TaskRow;
  });

  const filtered = rows.filter(
    (t) => isIncompleteTask(t.status) && taskMatchesMember(t, ids),
  );

  return { tasks: filtered, error: null };
}
