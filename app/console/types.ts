export type ConsoleNavId = "calendar" | "family" | "me";

/** 供界面展示的用户摘要（由 household_memberships + Auth 映射而来） */
export type ConsoleUser = {
  name: string;
  initials: string;
  role: string;
  avatarUrl?: string | null;
};

/** household_memberships 行（与 Supabase 表字段对齐） */
export type HouseholdMembership = {
  id: string;
  household_id: string;
  user_id?: string | null;
  profile_id: string | null;
  role: string;
  nickname: string | null;
  status: string;
  joined_at?: string | null;
  created_at?: string | null;
};

/** 家庭切换器选项 */
export type HouseholdOption = {
  householdId: string;
  householdName: string;
  membership: HouseholdMembership;
  avatarUrl: string | null;
};
