/** 任务卡片上的人物摘要 */
export type CalendarPerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarClass: string;
  isManagedProfile: boolean;
  /** membership / profile / user_id 等可匹配 for_whom 的 ID */
  matchIds: string[];
};

/** 日程事件（由 tasks 表映射） */
export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  isAllDay: boolean;
  status: string;
  priority: string | null;
  statusLabel: string;
  /** 为了谁 — 优先档案成员（首张，兼容旧 UI） */
  forPerson: CalendarPerson | null;
  /** 对应 tasks.target_profile_ids / for_whom */
  forWhomIds: string[];
  assigneeLabel: string;
  /** 详情抽屉：执行人列表 */
  assignees: CalendarPerson[];
  /** 详情抽屉：受益人列表 */
  beneficiaries: CalendarPerson[];
  recurrenceRule: string | null;
  recurrenceInterval: string | null;
};

export type CalendarDay = {
  date: Date;
  weekdayShort: string;
  dayNumber: number;
  hasEvents: boolean;
  isSelected: boolean;
  isToday: boolean;
};

export type CalendarWeekView = {
  year: number;
  month: number;
  label: string;
  days: CalendarDay[];
};

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  end_datetime: string | null;
  is_all_day: boolean | null;
  involved_member_ids: string[] | null;
  target_profile_ids: string[] | null;
  recurrence_rule: string | null;
  recurrence_interval: string | null;
};

export type MembershipLookupRow = {
  id: string;
  user_id: string | null;
  profile_id: string | null;
  nickname: string | null;
  avatar_url: string | null;
};

export type ProfileLookupRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  user_id: string | null;
};

export type CalendarPageData = {
  events: CalendarEvent[];
};

/** 日程表主内容区视图模式（仅 list / day 已实现） */
export type CalendarViewMode = "list" | "day";

export type CalendarModalState =
  | { kind: "none" }
  | { kind: "task"; event: CalendarEvent }
  | { kind: "action-sheet" }
  | { kind: "readonly-alert" }
  | { kind: "ai-sheet" };

export type FetchCalendarResult =
  | { ok: true; data: CalendarPageData }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error";
      message: string;
    };
