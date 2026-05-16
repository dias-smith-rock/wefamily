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
  role: string;
  nickname: string | null;
  avatar_url: string | null;
  status: string;
};
