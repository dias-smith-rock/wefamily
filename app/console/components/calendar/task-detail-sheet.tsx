"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchHouseholdPeople,
  updateTask,
  uploadTaskAttachments,
} from "../../calendar/api";
import type {
  CalendarEvent,
  CreateTaskPriority,
  HouseholdPersonOption,
} from "../../calendar/types";
import {
  formatEventDuration,
  formatEventTime,
  isHouseholdWideBeneficiaries,
} from "../../calendar/utils";
import { getTaskDetailFieldValues } from "../../calendar/task-detail-utils";
import { canEditTask } from "../../lib/task-edit-access";
import { useDemoMode } from "../../lib/use-demo-mode";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { resolveClientLocale } from "@/lib/i18n/client-locale";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { OverlayRoot } from "../family/ios-overlays";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistedTaskId(id: string): boolean {
  return UUID_RE.test(id.trim());
}
import {
  Banknote,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Flag,
  Hourglass,
  MapPin,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Repeat,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";

type ReminderOption = "none" | "5" | "15" | "30" | "60";
type ColorOption = "white" | "purple" | "blue" | "green" | "orange" | "red";
type RecurrenceOption = "never" | "daily" | "weekly" | "monthly" | "yearly";
type ExtraPanel =
  | null
  | "attachments"
  | "repeat"
  | "location"
  | "more"
  | "expenses"
  | "emergency";

type AttachmentItem = {
  id: string;
  name: string;
  sizeLabel: string;
  file: File;
};

const COLOR_SWATCH: Record<ColorOption, string> = {
  white: "bg-white",
  purple: "bg-[#BF5AF2]",
  blue: "bg-[#0A84FF]",
  green: "bg-[#30D158]",
  orange: "bg-[#FF9F0A]",
  red: "bg-[#FF453A]",
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimeInputValue(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function combineLocalIso(
  dateStr: string,
  timeStr: string | null,
  allDay: boolean,
): string {
  if (allDay) return new Date(`${dateStr}T00:00:00`).toISOString();
  const time = timeStr && timeStr.length >= 4 ? timeStr : "09:00";
  return new Date(`${dateStr}T${time}:00`).toISOString();
}

function formatPillDate(date: Date): string {
  return new Intl.DateTimeFormat(resolveClientLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDurationLabel(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  allDay: boolean,
  fallback: string,
): string {
  if (allDay) return fallback;
  const start = new Date(`${startDate}T${startTime}:00`).getTime();
  const end = new Date(`${endDate}T${endTime}:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return "—";
  }
  const mins = Math.round((end - start) / 60_000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h}h`;
}

function Divider() {
  return <div className="mx-3 h-px bg-white/[0.08]" />;
}

function DatePill({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="relative inline-flex min-w-0 items-center gap-1.5 rounded-[12px] bg-white/10 px-2.5 py-2">
      <input
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[12px] tabular-nums text-white outline-none disabled:opacity-70 [color-scheme:dark]"
      />
    </label>
  );
}

function TimePill({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="relative inline-flex w-[5.75rem] shrink-0 items-center gap-1.5 rounded-[12px] bg-white/10 px-2.5 py-2">
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[12px] tabular-nums text-white outline-none disabled:opacity-70 [color-scheme:dark]"
      />
    </label>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
  showChevron = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
  showChevron?: boolean;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
      <Icon
        className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
        strokeWidth={2}
      />
      <span className="min-w-0 flex-1 text-[15px] text-white/55">{label}</span>
      <div className="flex max-w-[68%] shrink-0 items-center justify-end gap-1.5">
        {children}
        {showChevron ? (
          <ChevronRight
            className="h-4 w-4 shrink-0 text-white/25"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

function DateTimePills({ date, allDay }: { date: Date; allDay: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <span className="rounded-lg bg-white/10 px-2 py-1 text-[12px] font-medium tabular-nums text-white">
        {formatPillDate(date)}
      </span>
      {!allDay ? (
        <span className="rounded-lg bg-white/10 px-2 py-1 text-[12px] font-medium tabular-nums text-white">
          {formatEventTime(date)}
        </span>
      ) : null}
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  wide = false,
  active = false,
  badge,
  onPress,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  wide?: boolean;
  active?: boolean;
  badge?: string;
  onPress?: () => void;
}) {
  const className = `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] transition ${
    wide ? "flex-1 justify-center" : ""
  } ${
    active
      ? "bg-[#0A84FF]/25 text-white ring-1 ring-[#0A84FF]/50"
      : "bg-[#2A2A2E] text-white/80 active:bg-white/10"
  }`;

  const body = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#A78BFA]" strokeWidth={2} />
      <span className="truncate">{label}</span>
      {badge ? (
        <span className="rounded-full bg-white/15 px-1.5 text-[11px] font-semibold text-white/80">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={className}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

function recurrenceRuleValue(option: RecurrenceOption): string | null {
  switch (option) {
    case "daily":
      return "FREQ=DAILY";
    case "weekly":
      return "FREQ=WEEKLY";
    case "monthly":
      return "FREQ=MONTHLY";
    case "yearly":
      return "FREQ=YEARLY";
    default:
      return null;
  }
}

function parseRecurrenceOption(rule: string | null): RecurrenceOption {
  const r = (rule ?? "").toUpperCase();
  if (r.includes("DAILY")) return "daily";
  if (r.includes("WEEKLY")) return "weekly";
  if (r.includes("MONTHLY")) return "monthly";
  if (r.includes("YEARLY")) return "yearly";
  return "never";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PersonChips({
  people,
  selectedIds,
  onToggle,
  idKey,
}: {
  people: HouseholdPersonOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  idKey: "membershipId" | "profileId";
}) {
  return (
    <div className="flex flex-wrap gap-2 px-3.5 pb-3">
      {people.map((person) => {
        const id =
          idKey === "membershipId" ? person.membershipId : person.profileId;
        if (!id) return null;
        const active = selectedIds.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
              active
                ? "border-[#0A84FF] bg-[#0A84FF]/20 text-white"
                : "border-white/15 bg-transparent text-white/80 active:bg-white/5"
            }`}
          >
            {person.name}
          </button>
        );
      })}
    </div>
  );
}

function forWhomTrailing(event: CalendarEvent, everyoneLabel: string): string {
  if (isHouseholdWideBeneficiaries(event)) return everyoneLabel;
  const person = event.forPerson ?? event.beneficiaries[0];
  return person?.name?.trim() || everyoneLabel;
}

function assigneeTrailing(event: CalendarEvent): {
  kind: "count" | "label";
  value: string;
} {
  if (event.assignees.length > 1) {
    return { kind: "count", value: String(event.assignees.length) };
  }
  if (event.assignees.length === 1) {
    return { kind: "label", value: event.assignees[0]!.name };
  }
  return { kind: "label", value: event.assigneeLabel };
}

function toPriority(segment: "urgent" | "normal"): CreateTaskPriority {
  return segment === "urgent" ? "urgent" : "normal";
}

export function TaskDetailSheet({
  event,
  householdId,
  membershipId,
  membershipRole,
  householdName,
  open,
  onClose,
  onSaved,
  onSessionLost,
}: {
  event: CalendarEvent;
  householdId: string;
  membershipId: string;
  membershipRole: string;
  householdName?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  onSessionLost?: () => void;
  onReadonlyAction?: () => void;
}) {
  const { t } = useDictionary();
  const demoMode = useDemoMode();
  const fields = getTaskDetailFieldValues(event);
  const labels = fields.labels;
  const editable = canEditTask({
    creatorId: event.creatorId,
    membershipId,
    role: membershipRole,
  });

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [isAllDay, setIsAllDay] = useState(event.isAllDay);
  const [startDate, setStartDate] = useState(() =>
    toDateInputValue(event.startAt),
  );
  const [startTime, setStartTime] = useState(() =>
    toTimeInputValue(event.startAt),
  );
  const [endDate, setEndDate] = useState(() =>
    toDateInputValue(event.endAt ?? event.startAt),
  );
  const [endTime, setEndTime] = useState(() =>
    toTimeInputValue(event.endAt ?? event.startAt),
  );
  const [priority, setPriority] = useState<CreateTaskPriority>(() =>
    toPriority(fields.prioritySegment),
  );
  const [color, setColor] = useState<ColorOption>("white");
  const [reminder, setReminder] = useState<ReminderOption>("none");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    () => event.involvedMemberIds ?? [],
  );
  const [beneficiaryIds, setBeneficiaryIds] = useState<string[]>(
    () => event.forWhomIds ?? [],
  );
  const [people, setPeople] = useState<HouseholdPersonOption[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [expandedPeople, setExpandedPeople] = useState<
    null | "assignee" | "beneficiary"
  >(null);
  const [extraPanel, setExtraPanel] = useState<ExtraPanel>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceOption>(() =>
    parseRecurrenceOption(event.recurrenceRule),
  );
  const [location, setLocation] = useState("");
  const [moreDetails, setMoreDetails] = useState("");
  const [expenses, setExpenses] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(event.title);
    setDescription(event.description ?? "");
    setIsAllDay(event.isAllDay);
    setStartDate(toDateInputValue(event.startAt));
    setStartTime(toTimeInputValue(event.startAt));
    setEndDate(toDateInputValue(event.endAt ?? event.startAt));
    setEndTime(toTimeInputValue(event.endAt ?? event.startAt));
    setPriority(toPriority(resolveTaskPriority(event.priority)));
    setAssigneeIds(event.involvedMemberIds ?? []);
    setBeneficiaryIds(event.forWhomIds ?? []);
    setRecurrence(parseRecurrenceOption(event.recurrenceRule));
    setLocation("");
    setMoreDetails("");
    setExpenses("");
    setEmergencyContact("");
    setAttachments([]);
    setExpandedPeople(null);
    setExtraPanel(null);
    setError(null);
    setSubmitting(false);
  }, [open, event]);

  const toggleExtraPanel = (panel: Exclude<ExtraPanel, null>) => {
    setExtraPanel((prev) => (prev === panel ? null : panel));
  };

  const handlePickAttachments = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: AttachmentItem[] = Array.from(files).map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      file,
    }));
    setAttachments((prev) => {
      const names = new Set(prev.map((item) => item.name));
      return [...prev, ...next.filter((item) => !names.has(item.name))];
    });
    setExtraPanel("attachments");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!open || !editable) return;
    let cancelled = false;
    setPeopleLoading(true);
    void fetchHouseholdPeople(householdId).then((result) => {
      if (cancelled) return;
      setPeopleLoading(false);
      if (!result.ok) {
        if (result.reason === "expired" || result.reason === "no_session") {
          onSessionLost?.();
        }
        setPeople([]);
        return;
      }
      setPeople(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, editable, householdId, onSessionLost]);

  const duration =
    editable && !event.isFlexibleTodo
      ? formatDurationLabel(
          startDate,
          startTime,
          endDate,
          endTime,
          isAllDay,
          t("console.calendar.allDay"),
        )
      : formatEventDuration(event) ||
        (event.isAllDay ? t("console.calendar.allDay") : "—");

  const forWhomValue = forWhomTrailing(event, t("common.everyone"));
  const assignee = assigneeTrailing(event);
  const endAt = event.endAt ?? event.startAt;
  const groupName = householdName?.trim() || t("console.nav.group");
  const canSubmit = editable && title.trim().length > 0 && !submitting;

  const selectedAssigneeLabel = useMemo(() => {
    if (assigneeIds.length === 0) return t("common.everyone");
    if (assigneeIds.length > 1) return String(assigneeIds.length);
    const person = people.find((p) => p.membershipId === assigneeIds[0]);
    return person?.name ?? assignee.value;
  }, [assigneeIds, people, t, assignee.value]);

  const selectedBeneficiaryLabel = useMemo(() => {
    if (beneficiaryIds.length === 0) return t("common.everyone");
    if (beneficiaryIds.length > 1) return String(beneficiaryIds.length);
    const person = people.find((p) => p.profileId === beneficiaryIds[0]);
    return person?.name ?? forWhomValue;
  }, [beneficiaryIds, people, t, forWhomValue]);

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    // 演示数据 / 非 UUID 任务仅本地编辑，不打数据库
    if (demoMode || !isPersistedTaskId(event.id)) {
      setSubmitting(false);
      onSaved?.();
      onClose();
      return;
    }

    const mode = event.isFlexibleTodo ? "flexible" : "scheduled";
    const dueDate =
      mode === "flexible"
        ? null
        : combineLocalIso(startDate, startTime, isAllDay);
    const endDatetime =
      mode === "flexible"
        ? event.endAt
          ? combineLocalIso(endDate, "23:59", true)
          : null
        : isAllDay
          ? null
          : combineLocalIso(endDate, endTime, false);

    const result = await updateTask({
      taskId: event.id,
      householdId,
      title,
      description,
      mode,
      isAllDay: mode === "flexible" ? false : isAllDay,
      dueDate,
      endDatetime,
      priority,
      involvedMemberIds: assigneeIds.length > 0 ? assigneeIds : null,
      targetProfileIds: beneficiaryIds.length > 0 ? beneficiaryIds : null,
      recurrenceRule: recurrenceRuleValue(recurrence),
    });

    if (!result.ok) {
      setSubmitting(false);
      if (result.reason === "expired" || result.reason === "no_session") {
        onSessionLost?.();
      }
      setError(translateApiMessage(t, result.message));
      return;
    }

    if (attachments.length > 0) {
      const uploadResult = await uploadTaskAttachments({
        taskId: event.id,
        files: attachments.map((item) => item.file),
      });
      if (!uploadResult.ok) {
        setSubmitting(false);
        if (
          uploadResult.reason === "expired" ||
          uploadResult.reason === "no_session"
        ) {
          onSessionLost?.();
        }
        setError(
          translateApiMessage(t, uploadResult.message) ||
            uploadResult.message,
        );
        onSaved?.();
        return;
      }
    }

    setSubmitting(false);
    onSaved?.();
    onClose();
  };

  const reminderLabel =
    reminder === "none"
      ? t("common.none")
      : reminder === "60"
        ? "1 hour before"
        : `${reminder} minutes before`;

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <div className="flex max-h-[min(86dvh,760px)] w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1C1C1E]/96 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <header className="sticky top-0 z-10 flex items-center justify-between bg-[#1C1C1E]/95 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF]/20 text-[#0A84FF] transition active:opacity-70"
              aria-label={t("common.close")}
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
            {editable ? (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!canSubmit}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF]/20 text-[#0A84FF] transition enabled:active:opacity-70 disabled:opacity-30"
                aria-label={t("common.done")}
              >
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </button>
            ) : (
              <span className="h-9 w-9" aria-hidden />
            )}
          </header>

          {error ? (
            <p className="mb-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </p>
          ) : null}

          <div className="pb-3 pt-1">
            {editable ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-[28px] font-semibold leading-tight tracking-tight text-white outline-none placeholder:text-white/25"
                aria-label={t("console.calendar.createTitlePlaceholder")}
              />
            ) : (
              <p className="text-[28px] font-semibold leading-tight tracking-tight text-white">
                {event.title}
              </p>
            )}
          </div>

          {!editable ? (
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-snug text-white/55">
              {t("console.calendar.readonlyDetailHint")}
            </div>
          ) : null}

          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <DetailRow icon={CalendarDays} label={groupName}>
              <span
                className="h-2.5 w-2.5 rounded-full bg-[#BF5AF2]"
                aria-hidden
              />
            </DetailRow>
            <Divider />

            <button
              type="button"
              disabled={!editable}
              onClick={() => {
                if (!editable) return;
                toggleExtraPanel("attachments");
              }}
              className="flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2.5 text-left disabled:cursor-default"
            >
              <Paperclip
                className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 text-[15px] text-white/55">
                {t("console.taskDetail.attachments")}
              </span>
              {editable ? (
                <span className="text-[15px] text-[#0A84FF]">
                  {attachments.length > 0
                    ? String(attachments.length)
                    : t("console.taskDetail.addAttachment")}
                </span>
              ) : (
                <span className="text-[15px] text-white/35">—</span>
              )}
              {editable ? (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-white/25"
                  strokeWidth={2}
                />
              ) : null}
            </button>
            {editable && extraPanel === "attachments" ? (
              <div className="space-y-2 px-3.5 pb-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePickAttachments(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl bg-[#0A84FF]/20 py-2.5 text-[14px] font-semibold text-[#0A84FF] active:bg-[#0A84FF]/30"
                >
                  {t("console.taskDetail.addAttachment")}
                </button>
                {attachments.length === 0 ? (
                  <p className="text-[12px] text-white/40">
                    {t("common.none")}
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {attachments.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2"
                      >
                        <Paperclip
                          className="h-3.5 w-3.5 shrink-0 text-[#A78BFA]"
                          strokeWidth={2}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-white">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-white/40">
                          {file.sizeLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((item) => item.id !== file.id),
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#FF453A] active:bg-white/10"
                          aria-label={t("common.close")}
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            <Divider />

            <DetailRow icon={Clock} label={t("console.calendar.allDay")}>
              {editable ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAllDay}
                  aria-label={t("console.calendar.allDay")}
                  onClick={() => setIsAllDay((v) => !v)}
                  className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition ${
                    isAllDay ? "bg-[#30D158]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] h-6 w-6 rounded-full bg-white shadow transition ${
                      isAllDay ? "right-[2px]" : "left-[2px]"
                    }`}
                  />
                </button>
              ) : (
                <span
                  className={`relative h-[28px] w-[48px] rounded-full ${
                    event.isAllDay ? "bg-[#30D158]/50" : "bg-white/10"
                  }`}
                  aria-hidden
                >
                  <span
                    className={`absolute top-[2px] h-6 w-6 rounded-full bg-white/80 shadow ${
                      event.isAllDay ? "right-[2px]" : "left-[2px]"
                    }`}
                  />
                </span>
              )}
            </DetailRow>
            <Divider />

            <DetailRow icon={CalendarDays} label={t("console.taskDetail.starts")}>
              {editable && !event.isFlexibleTodo ? (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <DatePill value={startDate} onChange={setStartDate} />
                  {!isAllDay ? (
                    <TimePill value={startTime} onChange={setStartTime} />
                  ) : null}
                </div>
              ) : (
                <DateTimePills date={event.startAt} allDay={event.isAllDay} />
              )}
            </DetailRow>
            <Divider />

            <DetailRow icon={CalendarDays} label={t("console.taskDetail.ends")}>
              {editable && !event.isFlexibleTodo ? (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <DatePill value={endDate} onChange={setEndDate} />
                  {!isAllDay ? (
                    <TimePill value={endTime} onChange={setEndTime} />
                  ) : null}
                </div>
              ) : (
                <DateTimePills date={endAt} allDay={event.isAllDay} />
              )}
            </DetailRow>
            <Divider />

            <DetailRow icon={Hourglass} label={t("console.taskDetail.duration")}>
              <span className="text-[15px] text-white">{duration}</span>
            </DetailRow>
            <Divider />

            <DetailRow
              icon={Tag}
              label={t("console.taskDetail.color")}
              showChevron={false}
            >
              {editable ? (
                <div className="flex items-center gap-1.5">
                  {(Object.keys(COLOR_SWATCH) as ColorOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColor(key)}
                      className={`h-5 w-5 rounded-full ring-offset-2 ring-offset-[#2C2C2E] ${COLOR_SWATCH[key]} ${
                        color === key ? "ring-2 ring-[#0A84FF]" : ""
                      }`}
                      aria-label={key}
                    />
                  ))}
                </div>
              ) : (
                <span className="h-5 w-5 rounded-full bg-white" aria-hidden />
              )}
            </DetailRow>
            <Divider />

            <DetailRow icon={Bell} label={t("console.taskDetail.remind")}>
              {editable ? (
                <select
                  value={reminder}
                  onChange={(e) =>
                    setReminder(e.target.value as ReminderOption)
                  }
                  className="max-w-[10rem] truncate rounded-lg bg-transparent py-1 text-right text-[15px] text-[#BF5AF2] outline-none [color-scheme:dark]"
                >
                  <option value="none">{t("common.none")}</option>
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              ) : (
                <span className="text-[15px] text-white/70">
                  {fields.reminderValue}
                </span>
              )}
            </DetailRow>
            <Divider />

            <button
              type="button"
              disabled={!editable}
              onClick={() =>
                setExpandedPeople((v) =>
                  v === "assignee" ? null : "assignee",
                )
              }
              className="flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2.5 text-left disabled:cursor-default"
            >
              <User
                className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 text-[15px] text-white/55">
                {labels.fieldAssignee}
              </span>
              {editable && assigneeIds.length > 1 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#BF5AF2] px-1.5 text-[12px] font-bold text-white">
                  {selectedAssigneeLabel}
                </span>
              ) : (
                <span
                  className={`truncate text-[15px] ${
                    editable ? "text-[#BF5AF2]" : "text-white/70"
                  }`}
                >
                  {editable ? selectedAssigneeLabel : assignee.value}
                </span>
              )}
              {editable ? (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-white/25"
                  strokeWidth={2}
                />
              ) : null}
            </button>
            {editable && expandedPeople === "assignee" ? (
              peopleLoading ? (
                <p className="px-3.5 pb-3 text-[13px] text-white/40">
                  {t("common.loading")}
                </p>
              ) : (
                <PersonChips
                  people={people}
                  selectedIds={assigneeIds}
                  idKey="membershipId"
                  onToggle={(id) =>
                    setAssigneeIds((prev) => toggleId(prev, id))
                  }
                />
              )
            ) : null}
            <Divider />

            <button
              type="button"
              disabled={!editable}
              onClick={() =>
                setExpandedPeople((v) =>
                  v === "beneficiary" ? null : "beneficiary",
                )
              }
              className="flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2.5 text-left disabled:cursor-default"
            >
              <Users
                className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 text-[15px] text-white/55">
                {t("console.calendar.forWhomLabel")}
              </span>
              <span
                className={`truncate text-[15px] ${
                  editable ? "text-[#BF5AF2]" : "text-white/70"
                }`}
              >
                {editable ? selectedBeneficiaryLabel : forWhomValue}
              </span>
              {editable ? (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-white/25"
                  strokeWidth={2}
                />
              ) : null}
            </button>
            {editable && expandedPeople === "beneficiary" ? (
              peopleLoading ? (
                <p className="px-3.5 pb-3 text-[13px] text-white/40">
                  {t("common.loading")}
                </p>
              ) : (
                <PersonChips
                  people={people.filter((p) => p.profileId)}
                  selectedIds={beneficiaryIds}
                  idKey="profileId"
                  onToggle={(id) =>
                    setBeneficiaryIds((prev) => toggleId(prev, id))
                  }
                />
              )
            ) : null}
            <Divider />

            <DetailRow icon={Flag} label={labels.fieldPriority}>
              {editable ? (
                <div className="flex rounded-full bg-black/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPriority("normal")}
                    className={`rounded-full px-3 py-1 text-[13px] font-semibold transition ${
                      priority === "normal"
                        ? "bg-[#0A84FF] text-white"
                        : "text-white/50"
                    }`}
                  >
                    {fields.priorityNormal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("urgent")}
                    className={`rounded-full px-3 py-1 text-[13px] font-semibold transition ${
                      priority === "urgent"
                        ? "bg-[#FF453A] text-white"
                        : "text-white/50"
                    }`}
                  >
                    {fields.priorityUrgent}
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[15px] text-white">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      fields.prioritySegment === "urgent"
                        ? "bg-[#FF453A]"
                        : "bg-[#0A84FF]"
                    }`}
                    aria-hidden
                  />
                  {fields.prioritySegment === "urgent"
                    ? fields.priorityUrgent
                    : fields.priorityNormal}
                </span>
              )}
            </DetailRow>
          </section>

          {editable ? (
            <>
              <div className="mt-3 overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("console.calendar.createNotesPlaceholder")}
                  rows={3}
                  className="w-full resize-none rounded-[14px] bg-black/25 px-3.5 py-3 text-[15px] text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleExtraPanel("attachments");
                    fileInputRef.current?.click();
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    extraPanel === "attachments" || attachments.length > 0
                      ? "bg-[#0A84FF]/25 text-[#0A84FF] ring-1 ring-[#0A84FF]/40"
                      : "bg-[#2A2A2E] text-[#A78BFA] active:bg-white/10"
                  }`}
                  aria-label={t("console.taskDetail.addAttachment")}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <Chip
                  icon={Repeat}
                  label={labels.fieldRepeat}
                  active={extraPanel === "repeat" || recurrence !== "never"}
                  badge={recurrence !== "never" ? "•" : undefined}
                  onPress={() => toggleExtraPanel("repeat")}
                />
                <Chip
                  icon={MapPin}
                  label={labels.fieldLocation}
                  active={extraPanel === "location" || location.trim().length > 0}
                  badge={location.trim() ? "•" : undefined}
                  onPress={() => toggleExtraPanel("location")}
                />
                <Chip
                  icon={MoreHorizontal}
                  label={labels.fieldMoreDetails}
                  active={extraPanel === "more" || moreDetails.trim().length > 0}
                  badge={moreDetails.trim() ? "•" : undefined}
                  onPress={() => toggleExtraPanel("more")}
                />
              </div>

              <div className="mt-2 flex gap-2">
                <Chip
                  icon={Banknote}
                  label={t("console.taskDetail.expenses")}
                  active={extraPanel === "expenses" || expenses.trim().length > 0}
                  badge={expenses.trim() ? "•" : undefined}
                  onPress={() => toggleExtraPanel("expenses")}
                />
                <Chip
                  icon={Phone}
                  label={labels.fieldEmergency}
                  wide
                  active={
                    extraPanel === "emergency" ||
                    emergencyContact.trim().length > 0
                  }
                  badge={emergencyContact.trim() ? "•" : undefined}
                  onPress={() => toggleExtraPanel("emergency")}
                />
              </div>

              {extraPanel === "repeat" ? (
                <div className="mt-3 overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
                  <p className="mb-2 text-[13px] font-medium text-white/55">
                    {labels.fieldRepeat}
                  </p>
                  <select
                    value={recurrence}
                    onChange={(e) =>
                      setRecurrence(e.target.value as RecurrenceOption)
                    }
                    className="w-full rounded-xl bg-black/25 px-3 py-2.5 text-[15px] text-white outline-none [color-scheme:dark]"
                  >
                    <option value="never">{t("console.recurrence.never")}</option>
                    <option value="daily">{t("console.recurrence.daily")}</option>
                    <option value="weekly">
                      {t("console.recurrence.weekly")}
                    </option>
                    <option value="monthly">
                      {t("console.recurrence.monthly")}
                    </option>
                    <option value="yearly">
                      {t("console.recurrence.yearly")}
                    </option>
                  </select>
                </div>
              ) : null}

              {extraPanel === "location" ? (
                <div className="mt-3 overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
                  <p className="mb-2 text-[13px] font-medium text-white/55">
                    {labels.fieldLocation}
                  </p>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("console.taskDetail.locationDefault")}
                    className="w-full rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
                  />
                </div>
              ) : null}

              {extraPanel === "more" ? (
                <div className="mt-3 overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
                  <p className="mb-2 text-[13px] font-medium text-white/55">
                    {labels.fieldMoreDetails}
                  </p>
                  <textarea
                    value={moreDetails}
                    onChange={(e) => setMoreDetails(e.target.value)}
                    rows={4}
                    placeholder={t("console.calendar.createNotesPlaceholder")}
                    className="w-full resize-none rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
                  />
                </div>
              ) : null}

              {extraPanel === "expenses" ? (
                <div className="mt-3 overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
                  <p className="mb-2 text-[13px] font-medium text-white/55">
                    {t("console.taskDetail.expenses")}
                  </p>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
                  />
                </div>
              ) : null}

              {extraPanel === "emergency" ? (
                <div className="mt-3 overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
                  <p className="mb-2 text-[13px] font-medium text-white/55">
                    {labels.fieldEmergency}
                  </p>
                  <input
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder={t("console.taskDetail.emergencyDefault")}
                    className="w-full rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          <p className="mt-4 text-center text-[11px] text-white/35">
            {t("console.taskDetail.lastEditedHint")}
            {editable ? ` · ${reminderLabel}` : null}
          </p>

          {editable ? (
            <div className="mt-3 grid grid-cols-2 gap-3 pb-2">
              <button
                type="button"
                className="rounded-2xl bg-[#2C2C2E] py-3.5 text-[16px] font-semibold text-[#FF9F0A] transition active:opacity-80"
              >
                {t("console.taskDetail.acceptTask")}
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[#2C2C2E] py-3.5 text-[16px] font-semibold text-white transition active:opacity-80"
              >
                {t("console.taskDetail.deleteTask")}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </OverlayRoot>
  );
}

function resolveTaskPriority(
  priority: string | null,
): "urgent" | "normal" {
  const p = (priority ?? "").toLowerCase();
  return p === "urgent" || p === "high" ? "urgent" : "normal";
}
