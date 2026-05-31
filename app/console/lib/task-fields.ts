/** 从 task 行解析受益人 profile ID（兼容 target_profile_id 与旧 target_profile_ids） */
export function taskTargetProfileIds(task: {
  target_profile_id?: string | null;
  target_profile_ids?: string[] | null;
}): string[] {
  const legacy = task.target_profile_ids;
  if (Array.isArray(legacy) && legacy.length > 0) {
    return legacy.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0,
    );
  }
  const single = task.target_profile_id?.trim();
  return single ? [single] : [];
}

export type TaskTargetFields = {
  target_profile_id: string | null;
  target_profile_ids?: string[] | null;
};

export function normalizeTaskTargetFields(
  raw: Record<string, unknown>,
): TaskTargetFields {
  const target_profile_id =
    typeof raw.target_profile_id === "string" && raw.target_profile_id.trim()
      ? raw.target_profile_id.trim()
      : null;

  const legacy = raw.target_profile_ids;
  const target_profile_ids = Array.isArray(legacy)
    ? legacy.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      )
    : null;

  return { target_profile_id, target_profile_ids };
}
