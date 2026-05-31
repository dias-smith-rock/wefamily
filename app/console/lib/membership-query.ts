import type { HouseholdMembership } from "../types";

/** household_memberships 可查询列（与 Supabase schema 一致，勿含已删除字段） */
export const HOUSEHOLD_MEMBERSHIP_COLUMNS =
  "id, household_id, user_id, profile_id, role, nickname, status, joined_at, created_at";

type SupabaseClient = NonNullable<
  ReturnType<typeof import("@/lib/supabase/browser-client").getSupabaseBrowserClient>
>;

function normalizeMembershipRow(raw: Record<string, unknown>): HouseholdMembership {
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

/**
 * 用户可能加入多个家庭；取最近加入的一条 active membership，避免 maybeSingle 多行报错。
 */
export async function fetchPrimaryActiveMembership(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ data: HouseholdMembership | null; error: string | null }> {
  const { data, error } = await supabase
    .from("household_memberships")
    .select(HOUSEHOLD_MEMBERSHIP_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(1);

  if (error) {
    return { data: null, error: error.message };
  }

  const row = data?.[0];
  return {
    data: row
      ? normalizeMembershipRow(row as Record<string, unknown>)
      : null,
    error: null,
  };
}

export async function fetchProfileAvatarUrl(
  supabase: SupabaseClient,
  profileId: string | null | undefined,
): Promise<string | null> {
  if (!profileId?.trim()) return null;

  const { data, error } = await supabase
    .from("family_profiles")
    .select("avatar_url")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    console.warn("[wefamily] fetchProfileAvatarUrl:", error.message);
    return null;
  }

  return (data?.avatar_url as string | null) ?? null;
}
