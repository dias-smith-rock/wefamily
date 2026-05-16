import type {
  FamilyMemberDisplay,
  FamilyProfileRow,
  HouseholdRow,
  MembershipRow,
} from "./types";

const AVATAR_CLASSES = [
  "bg-rose-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-fuchsia-500",
] as const;

export function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]![0];
    const b = parts[1]![0];
    if (a && b) return (a + b).toUpperCase();
  }
  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return trimmed.slice(0, 1);
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function formatRoleLabel(role: string): string {
  const r = role.trim().toLowerCase();
  if (r === "owner" || r === "creator") return "创建者";
  if (r === "admin") return "管理员";
  if (r === "member") return "成员";
  return role.replace(/_/g, " ") || "成员";
}

export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "····";
  return `....${digits.slice(-4)}`;
}

export function formatPhoneDisplay(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
  }
  return phone;
}

export function formatDateZh(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function isManagedMembership(row: MembershipRow): boolean {
  if (!row.user_id) return true;
  const profile = row.family_profiles;
  if (profile && !profile.user_id) return true;
  return false;
}

export function isManagedProfileRow(profile: FamilyProfileRow): boolean {
  return !profile.user_id;
}

export function sortFamilyMembers(
  members: FamilyMemberDisplay[],
): FamilyMemberDisplay[] {
  return [...members].sort((a, b) => {
    if (a.isManagedProfile !== b.isManagedProfile) {
      return a.isManagedProfile ? 1 : -1;
    }
    return a.displayName.localeCompare(b.displayName, "zh-CN");
  });
}

function pickAvatarClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % AVATAR_CLASSES.length;
  }
  return AVATAR_CLASSES[hash]!;
}

export function membershipToDisplay(
  row: MembershipRow,
  household: HouseholdRow,
): FamilyMemberDisplay {
  const profile = row.family_profiles;
  const managed = isManagedMembership(row);
  const displayName =
    row.nickname?.trim() ||
    profile?.name?.trim() ||
    row.email?.trim() ||
    "未命名成员";

  const phone =
    row.phone_number ||
    profile?.mainphone ||
    profile?.secondphone ||
    null;
  const email = row.email || profile?.email || null;

  const isCreator =
    household.creator_id != null &&
    row.user_id != null &&
    row.user_id === household.creator_id;

  const roleLabel = isCreator ? "创建者" : formatRoleLabel(row.role);

  let detailLine: string | null =
    maskPhone(phone) ?? formatPhoneDisplay(phone);
  if (!detailLine && email) {
    detailLine = email;
  }
  if (!detailLine && profile?.id_card_num?.trim()) {
    const id = profile.id_card_num.trim();
    detailLine =
      id.length >= 7
        ? `${id.slice(0, 3)}****${id.slice(-4)}`
        : maskPhone(id) ?? id;
  }

  let subtitle = roleLabel;
  if (managed) subtitle = "成员";

  return {
    membershipId: row.id,
    userId: row.user_id,
    profileId: row.profile_id ?? profile?.id ?? null,
    displayName,
    subtitle,
    detailLine,
    avatarUrl: row.avatar_url || profile?.avatar_url || null,
    initials: initialsFromName(displayName),
    avatarClass: pickAvatarClass(row.id),
    roleLabel,
    isManagedProfile: managed,
    isCreator,
    phone,
    email,
    joinedAt: row.joined_at ?? row.created_at,
  };
}

/** 无 household_membership、仅存在于 family_profiles 的免下载档案 */
export function profileToDisplay(
  profile: FamilyProfileRow,
): FamilyMemberDisplay {
  const displayName = profile.name?.trim() || "未命名档案";
  const phone = profile.mainphone || profile.secondphone || null;
  const email = profile.email || null;

  let detailLine: string | null =
    maskPhone(phone) ?? formatPhoneDisplay(phone);
  if (!detailLine && email) {
    detailLine = email;
  }
  if (!detailLine && profile.id_card_num?.trim()) {
    const id = profile.id_card_num.trim();
    detailLine =
      id.length >= 7
        ? `${id.slice(0, 3)}****${id.slice(-4)}`
        : maskPhone(id) ?? id;
  }

  return {
    membershipId: `profile:${profile.id}`,
    userId: profile.user_id,
    profileId: profile.id,
    displayName,
    subtitle: "成员",
    detailLine,
    avatarUrl: profile.avatar_url,
    initials: initialsFromName(displayName),
    avatarClass: pickAvatarClass(profile.id),
    roleLabel: "成员",
    isManagedProfile: isManagedProfileRow(profile),
    isCreator: false,
    phone,
    email,
    joinedAt: profile.created_at,
  };
}

export function memberTaskFilterIds(member: FamilyMemberDisplay): string[] {
  return [member.membershipId, member.profileId, member.userId].filter(
    (id): id is string => Boolean(id),
  );
}

export function taskMatchesMember(
  task: {
    involved_member_ids: string[] | null;
    target_profile_ids: string[] | null;
  },
  ids: string[],
): boolean {
  if (ids.length === 0) return false;
  const involved = task.involved_member_ids ?? [];
  const targets = task.target_profile_ids ?? [];
  return ids.some(
    (id) => involved.includes(id) || targets.includes(id),
  );
}

export function isIncompleteTask(status: string): boolean {
  const s = status.trim().toLowerCase();
  if (s === "done" || s === "completed" || s === "cancelled" || s === "canceled") {
    return false;
  }
  return true;
}
