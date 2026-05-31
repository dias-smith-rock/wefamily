/** tasks 表受益人 profile 列名（当前 Supabase 生产库为 uuid[]） */
export const TASK_TARGET_PROFILE_COLUMN = "target_profile_ids";

/** 从 task 行解析受益人 profile ID（兼容 target_profile_ids 与未来的 target_profile_id） */
export function taskTargetProfileIds(task: {
  target_profile_id?: string | null;
  target_profile_ids?: string[] | null;
}): string[] {
  const ids = task.target_profile_ids;
  if (Array.isArray(ids) && ids.length > 0) {
    return ids.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0,
    );
  }
  const single = task.target_profile_id?.trim();
  return single ? [single] : [];
}

export type TaskTargetFields = {
  target_profile_ids: string[] | null;
  /** 未来 schema 若改为单列，normalize 时填充 */
  target_profile_id?: string | null;
};

export function normalizeTaskTargetFields(
  raw: Record<string, unknown>,
): TaskTargetFields {
  const legacy = raw.target_profile_ids;
  const target_profile_ids = Array.isArray(legacy)
    ? legacy.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      )
    : null;

  const target_profile_id =
    typeof raw.target_profile_id === "string" && raw.target_profile_id.trim()
      ? raw.target_profile_id.trim()
      : null;

  return { target_profile_ids, target_profile_id };
}
