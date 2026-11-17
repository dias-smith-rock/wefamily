/**
 * 与 iOS `TaskEditAccess` / `FamilyTask.involvesMembership` / 小组件 `isMine` 对齐：
 * - 可编辑：群组 creator/admin，或当前 membership 为 `tasks.creator_id`
 * - `creator_id` / membership 均为 `household_memberships.id`，禁止用 `auth.users.id`
 * - 「与我相关」：受益人为空=全员；执行人为空=全员；或我是创建者/执行人/受益人
 */

export type MembershipRoleKind =
  | "creator"
  | "admin"
  | "member"
  | "owner"
  | "unknown";

export function normalizeMembershipRole(
  role: string | null | undefined,
): MembershipRoleKind {
  const r = (role ?? "").trim().toLowerCase();
  if (r === "creator" || r === "owner") return "creator";
  if (r === "admin") return "admin";
  if (r === "member") return "member";
  return "unknown";
}

export function canEditTask(params: {
  creatorId: string | null | undefined;
  membershipId: string | null | undefined;
  role: string | null | undefined;
  /** 系统只读来源（如同步只读） */
  sourceIsReadOnly?: boolean;
}): boolean {
  if (params.sourceIsReadOnly) return false;

  const membershipId = params.membershipId?.trim();
  const creatorId = params.creatorId?.trim();
  if (membershipId && creatorId && membershipId === creatorId) {
    return true;
  }

  const kind = normalizeMembershipRole(params.role);
  return kind === "creator" || kind === "admin";
}

/**
 * 任务是否「与我相关」（日历「与我相关」筛选）。
 * 优先对齐 iOS 小组件 `ScheduleWidgetPublisher.isMine`（受益人）；
 * 并补充：我是创建者，或在明确的执行人列表中。
 */
export function taskInvolvesMembership(params: {
  membershipId: string;
  profileId?: string | null;
  userId?: string | null;
  creatorId?: string | null;
  involvedMemberIds?: string[] | null;
  forWhomIds?: string[] | null;
}): boolean {
  const ids = new Set<string>();
  ids.add(params.membershipId);
  if (params.profileId) ids.add(params.profileId);
  if (params.userId) ids.add(params.userId);

  // 受益人：空 = 全员（与 isMine 一致）
  const forWhom = params.forWhomIds;
  if (forWhom == null || forWhom.length === 0) return true;
  for (const id of forWhom) {
    if (id && ids.has(id)) return true;
  }

  if (params.creatorId && ids.has(params.creatorId)) return true;

  // 执行人：仅当明确写出列表时按 membership 匹配
  // （空/null 表示全员执行，但不覆盖「受益人已指定为他人」的过滤）
  const involved = params.involvedMemberIds;
  if (involved != null && involved.length > 0) {
    for (const id of involved) {
      if (id && ids.has(id)) return true;
    }
  }

  return false;
}
