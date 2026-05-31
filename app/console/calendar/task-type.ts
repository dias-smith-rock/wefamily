/** 与 iOS `TaskTypeKind` / `FamilyTask+TaskType` 对齐 */
export type ResolvedTaskType = "scheduled" | "flexible" | "birthday_reminder" | "other";

export function resolveTaskType(
  taskType: string | null | undefined,
): ResolvedTaskType {
  const raw = taskType?.trim().toLowerCase() ?? "";
  if (!raw || raw === "scheduled") return "scheduled";
  if (raw === "flexible") return "flexible";
  if (raw === "birthday_reminder") return "birthday_reminder";
  return "other";
}

export function isFlexibleTodoTask(task: {
  task_type?: string | null;
}): boolean {
  return resolveTaskType(task.task_type) === "flexible";
}

/** 日程 Tab：scheduled（含历史 nil），排除生日等系统任务 */
export function isScheduledCalendarTask(task: {
  task_type?: string | null;
}): boolean {
  const type = resolveTaskType(task.task_type);
  return type === "scheduled";
}

export function isOpenTodoStatus(status: string): boolean {
  const s = status.trim().toLowerCase();
  return !(
    s === "completed" ||
    s === "done" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "failed" ||
    s === "expired"
  );
}
