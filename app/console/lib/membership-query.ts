import type { HouseholdMembership, HouseholdOption } from "../types";
import { getActiveDictionary } from "@/lib/i18n/client-dictionary";
import { resolveAvatarUrl } from "@/lib/supabase/storage-url";

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

async function fetchMembershipAvatarsFromFamilyProfiles(
  supabase: SupabaseClient,
  memberships: HouseholdMembership[],
): Promise<Map<string, string | null>> {
  const avatarsByMembershipId = new Map<string, string | null>();
  if (memberships.length === 0) return avatarsByMembershipId;

  const householdIds = [...new Set(memberships.map((m) => m.household_id))];
  const { data, error } = await supabase
    .from("family_profiles")
    .select("id, household_id, user_id, avatar_url")
    .in("household_id", householdIds);

  if (error) {
    console.warn("[wefamily] fetchMembershipAvatarsFromFamilyProfiles:", error.message);
    return avatarsByMembershipId;
  }

  const profiles = (data ?? []).map((row) => ({
    id: String((row as { id: string }).id),
    household_id: String((row as { household_id: string }).household_id),
    user_id: ((row as { user_id: string | null }).user_id as string | null) ?? null,
    avatar_url: ((row as { avatar_url: string | null }).avatar_url as string | null) ?? null,
  }));

  for (const membership of memberships) {
    let avatarUrl: string | null = null;

    if (membership.profile_id) {
      const profile = profiles.find((p) => p.id === membership.profile_id);
      avatarUrl = resolveAvatarUrl(profile?.avatar_url ?? null);
    } else if (membership.user_id) {
      const profile = profiles.find(
        (p) =>
          p.user_id === membership.user_id &&
          p.household_id === membership.household_id,
      );
      avatarUrl = resolveAvatarUrl(profile?.avatar_url ?? null);
    }

    avatarsByMembershipId.set(membership.id, avatarUrl);
  }

  return avatarsByMembershipId;
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

  const [nameMap, avatarMap] = await Promise.all([
    fetchHouseholdNameMap(supabase, householdIds),
    fetchMembershipAvatarsFromFamilyProfiles(supabase, memberships),
  ]);

  const options: HouseholdOption[] = memberships.map((membership) => ({
    householdId: membership.household_id,
    householdName: nameMap.get(membership.household_id) ?? getActiveDictionary().common.defaults.unnamedGroup,
    membership,
    avatarUrl: avatarMap.get(membership.id) ?? null,
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

  return resolveAvatarUrl((data?.avatar_url as string | null) ?? null);
}

/** 按 household + user_id 从 family_profiles 读取 avatar_url */
export async function fetchProfileAvatarUrlByUserId(
  supabase: SupabaseClient,
  householdId: string,
  userId: string | null | undefined,
): Promise<string | null> {
  if (!userId?.trim()) return null;

  const { data, error } = await supabase
    .from("family_profiles")
    .select("avatar_url")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[wefamily] fetchProfileAvatarUrlByUserId:", error.message);
    return null;
  }

  return resolveAvatarUrl((data?.avatar_url as string | null) ?? null);
}
