/** household_memberships 行（不含联表） */
export type MembershipRowBase = {
  id: string;
  household_id: string;
  user_id: string | null;
  profile_id: string | null;
  role: string;
  nickname: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  email: string | null;
  status: string;
  joined_at: string | null;
  created_at: string | null;
};

/**
 * family_profiles 表字段（与 Supabase 列名一致，无下划线手机号）
 * @see 数据库: mainphone, secondphone
 */
export type FamilyProfileRow = {
  id: string;
  household_id: string;
  name: string | null;
  gender: string | null;
  birth_date: string | null;
  id_card_num: string | null;
  other_id_1: string | null;
  other_id_2: string | null;
  height: number | null;
  weight: number | null;
  school: string | null;
  grade: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  avatar_url: string | null;
  user_id: string | null;
  passport_num: string | null;
  permit_num: string | null;
  email: string | null;
  mainphone: string | null;
  secondphone: string | null;
};

/** 前端拼接后的 membership + profile */
export type MembershipRow = MembershipRowBase & {
  family_profiles: FamilyProfileRow | null;
};

export type HouseholdRow = {
  id: string;
  name: string;
  created_at: string;
  creator_id: string | null;
};

export type TaskRow = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  involved_member_ids: string[] | null;
  target_profile_ids: string[] | null;
};

/** 前端展示用成员模型 */
export type FamilyMemberDisplay = {
  membershipId: string;
  userId: string | null;
  profileId: string | null;
  displayName: string;
  subtitle: string;
  detailLine: string | null;
  avatarUrl: string | null;
  initials: string;
  avatarClass: string;
  roleLabel: string;
  isManagedProfile: boolean;
  isCreator: boolean;
  phone: string | null;
  email: string | null;
  joinedAt: string | null;
};

export type FamilyPageData = {
  household: HouseholdRow;
  self: FamilyMemberDisplay;
  others: FamilyMemberDisplay[];
  memberCount: number;
};

export type FamilyModalState =
  | { kind: "none" }
  | { kind: "household" }
  | { kind: "self" }
  | { kind: "member"; member: FamilyMemberDisplay }
  | { kind: "action-sheet" }
  | { kind: "readonly-hint" };

export type FetchFamilyResult =
  | { ok: true; data: FamilyPageData }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error";
      message: string;
    };
