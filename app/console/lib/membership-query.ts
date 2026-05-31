/** household_memberships 可查询列（与 Supabase schema 一致，勿含已删除字段） */
export const HOUSEHOLD_MEMBERSHIP_COLUMNS =
  "id, household_id, user_id, profile_id, role, nickname, status, joined_at, created_at";

export async function fetchProfileAvatarUrl(
  supabase: ReturnType<
    typeof import("@/lib/supabase/browser-client").getSupabaseBrowserClient
  >,
  profileId: string | null | undefined,
): Promise<string | null> {
  if (!supabase || !profileId?.trim()) return null;

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
