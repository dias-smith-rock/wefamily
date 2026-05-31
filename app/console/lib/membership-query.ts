import type { HouseholdMembership, HouseholdOption } from "../types";
import { getActiveDictionary } from "@/lib/i18n/client-dictionary";

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

export async function fetchAllActiveMemberships(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ data: HouseholdMembership[]; error: string | null }> {
  const { data, error } = await supabase
    .from("household_memberships")
    .select(HOUSEHOLD_MEMBERSHIP_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((row) =>
      normalizeMembershipRow(row as Record<string, unknown>),
    ),
    error: null,
  };
}

async function fetchHouseholdNameMap(
  supabase: SupabaseClient,
  householdIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (householdIds.length === 0) return map;

  const { data, error } = await supabase
    .from("households")
    .select("id, name")
    .in("id", householdIds);

  if (error) {
    console.warn("[wefamily] fetchHouseholdNameMap:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const id = String((row as { id: string }).id);
    const name = (row as { name: string | null }).name?.trim();
    map.set(id, name || getActiveDictionary().common.defaults.unnamedGroup);
  }

  return map;
}

async function fetchProfileAvatarMap(
  supabase: SupabaseClient,
  profileIds: string[],
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  const unique = [...new Set(profileIds.filter(Boolean))];
  if (unique.length === 0) return map;

  const { data, error } = await supabase
    .from("family_profiles")
    .select("id, avatar_url")
    .in("id", unique);

  if (error) {
    console.warn("[wefamily] fetchProfileAvatarMap:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const id = String((row as { id: string }).id);
    map.set(id, (row as { avatar_url: string | null }).avatar_url ?? null);
  }

  return map;
}

/** 加载用户全部 active 家庭及展示信息，供家庭切换器使用 */
export async function fetchHouseholdOptionsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ data: HouseholdOption[]; error: string | null }> {
  const { data: memberships, error } = await fetchAllActiveMemberships(
    supabase,
    userId,
  );

  if (error) {
    return { data: [], error };
  }

  if (memberships.length === 0) {
    return { data: [], error: null };
  }

  const householdIds = memberships.map((m) => m.household_id);
  const profileIds = memberships
    .map((m) => m.profile_id)
    .filter((id): id is string => Boolean(id));

  const [nameMap, avatarMap] = await Promise.all([
    fetchHouseholdNameMap(supabase, householdIds),
    fetchProfileAvatarMap(supabase, profileIds),
  ]);

  const options: HouseholdOption[] = memberships.map((membership) => ({
    householdId: membership.household_id,
    householdName: nameMap.get(membership.household_id) ?? getActiveDictionary().common.defaults.unnamedGroup,
    membership,
    avatarUrl: membership.profile_id
      ? (avatarMap.get(membership.profile_id) ?? null)
      : null,
  }));

  return { data: options, error: null };
}

/** @deprecated 使用 fetchHouseholdOptionsForUser + pickInitialHouseholdId */
export async function fetchPrimaryActiveMembership(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ data: HouseholdMembership | null; error: string | null }> {
  const { data, error } = await fetchAllActiveMemberships(supabase, userId);
  if (error) return { data: null, error };
  return { data: data[0] ?? null, error: null };
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
