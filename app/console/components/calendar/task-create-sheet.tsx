"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Hourglass,
  MapPin,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Repeat,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";
import {
  createTask,
  fetchHouseholdPeople,
  uploadTaskAttachments,
} from "../../calendar/api";
import type {
  CreateTaskMode,
  CreateTaskPriority,
  HouseholdPersonOption,
} from "../../calendar/types";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { OverlayRoot } from "../family/ios-overlays";

type RecurrenceOption = "never" | "daily" | "weekly" | "monthly" | "yearly";
type ReminderOption = "none" | "5" | "15" | "30" | "60";
type ColorOption = "blue" | "purple" | "green" | "orange" | "red" | "white";
type ExtraPanel =
  | null
  | "attachments"
  | "repeat"
  | "location"
  | "more"
  | "assignee"
  | "beneficiary"
  | "priority"
  | "expenses"
  | "emergency"
  | "color"
  | "remind";

type AttachmentItem = {
  id: string;
  name: string;
  sizeLabel: string;
  file: File;
};

const COLOR_SWATCH: Record<ColorOption, string> = {
  blue: "bg-[#0A84FF]",
  purple: "bg-[#BF5AF2]",
  green: "bg-[#30D158]",
  orange: "bg-[#FF9F0A]",
  red: "bg-[#FF453A]",
  white: "bg-white",
};

const ICON = "text-[#30D158]";

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

function endOfDayLocalIso(dateStr: string): string {
  return new Date(`${dateStr}T23:59:00`).toISOString();
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDurationLabel(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  allDay: boolean,
  allDayLabel: string,
): string {
  if (allDay) return allDayLabel;
  const start = new Date(`${startDate}T${startTime}:00`).getTime();
  const end = new Date(`${endDate}T${endTime}:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return "—";
  }
  const mins = Math.round((end - start) / 60_000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function Divider() {
  return <div className="mx-3.5 h-px bg-white/[0.08]" />;
}

function Toggle({
  on,
  onToggle,
  ariaLabel,
}: {
  on: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition ${
        on ? "bg-[#30D158]" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-[2px] h-6 w-6 rounded-full bg-white shadow transition ${
          on ? "right-[2px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}

function DatePill({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex min-w-0 items-center gap-1.5 rounded-[12px] bg-white/10 px-2.5 py-2">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[12px] tabular-nums text-white outline-none [color-scheme:dark]"
      />
      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-white/35" strokeWidth={2} />
    </label>
  );
}

function TimePill({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex w-[5.75rem] shrink-0 items-center gap-1.5 rounded-[12px] bg-white/10 px-2.5 py-2">
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[12px] tabular-nums text-white outline-none [color-scheme:dark]"
      />
      <Clock className="h-3.5 w-3.5 shrink-0 text-white/35" strokeWidth={2} />
    </label>
  );
}

function Row({
  icon: Icon,
  label,
  children,
  showChevron = false,
  onPress,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Icon className={`h-[18px] w-[18px] shrink-0 ${ICON}`} strokeWidth={2} />
      <span className="min-w-0 flex-1 text-[15px] text-white/80">{label}</span>
      <div className="flex max-w-[62%] shrink-0 items-center justify-end gap-1.5">
        {children}
        {showChevron ? (
          <ChevronRight
            className="h-4 w-4 shrink-0 text-white/25"
            strokeWidth={2}
          />
        ) : null}
      </div>
    </>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className="flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2.5 text-left active:bg-white/5"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
      {content}
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  active = false,
  wide = false,
  onPress,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active?: boolean;
  wide?: boolean;
  onPress?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] transition ${
        wide ? "flex-[1_1_100%] justify-start sm:flex-none" : ""
      } ${
        active
          ? "bg-[#30D158]/20 text-white ring-1 ring-[#30D158]/45"
          : "bg-[#2A2A2E] text-white/80 active:bg-white/10"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${ICON}`} strokeWidth={2} />
      <span className="truncate">{label}</span>
    </button>
  );
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

export function TaskCreateSheet({
  open,
  mode,
  householdId,
  householdName,
  membershipId,
  defaultDate,
  onClose,
  onCreated,
  onSessionLost,
}: {
  open: boolean;
  mode: CreateTaskMode;
  householdId: string;
  householdName?: string | null;
  membershipId: string;
  defaultDate: Date;
  onClose: () => void;
  onCreated: () => void;
  onSessionLost?: () => void;
}) {
  const { t } = useDictionary();
  const isFlexible = mode === "flexible";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saveAsMemo, setSaveAsMemo] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(() =>
    toDateInputValue(defaultDate),
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(() => toDateInputValue(defaultDate));
  const [endTime, setEndTime] = useState("09:30");
  const [deadlineDate, setDeadlineDate] = useState(() =>
    toDateInputValue(defaultDate),
  );
  const [hasDeadline, setHasDeadline] = useState(true);
  const [priority, setPriority] = useState<CreateTaskPriority>("normal");
  const [recurrence, setRecurrence] = useState<RecurrenceOption>("never");
  const [reminder, setReminder] = useState<ReminderOption>("15");
  const [color, setColor] = useState<ColorOption>("blue");
  const [location, setLocation] = useState("");
  const [moreDetails, setMoreDetails] = useState("");
  const [expenses, setExpenses] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [beneficiaryIds, setBeneficiaryIds] = useState<string[]>([]);
  const [people, setPeople] = useState<HouseholdPersonOption[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [extraPanel, setExtraPanel] = useState<ExtraPanel>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const base = new Date(defaultDate);
    const now = new Date();
    const sameDay =
      base.getFullYear() === now.getFullYear() &&
      base.getMonth() === now.getMonth() &&
      base.getDate() === now.getDate();
    if (sameDay) {
      base.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      base.setHours(9, 0, 0, 0);
    }
    const end = new Date(base.getTime() + 60 * 60_000);

    setTitle("");
    setDescription("");
    setSaveAsMemo(false);
    setIsAllDay(false);
    setStartDate(toDateInputValue(base));
    setStartTime(toTimeInputValue(base));
    setEndDate(toDateInputValue(end));
    setEndTime(toTimeInputValue(end));
    setDeadlineDate(toDateInputValue(defaultDate));
    setHasDeadline(true);
    setPriority("normal");
    setRecurrence("never");
    setReminder("15");
    setColor("blue");
    setLocation("");
    setMoreDetails("");
    setExpenses("");
    setEmergencyContact("");
    setAttachments([]);
    setAssigneeIds([]);
    setBeneficiaryIds([]);
    setExtraPanel(null);
    setError(null);
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot defaultDate on open
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, householdId, onSessionLost]);

  const groupName = householdName?.trim() || t("console.nav.group");
  const titlePlaceholder = isFlexible
    ? t("console.calendar.createTaskPlaceholder")
    : t("console.calendar.createEventPlaceholder");
  const canSubmit = title.trim().length > 0 && !submitting;
  const duration = formatDurationLabel(
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay,
    t("console.calendar.allDay"),
  );
  const reminderLabel =
    reminder === "none"
      ? t("common.none")
      : reminder === "60"
        ? "1 hour before"
        : `${reminder} minutes before`;

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const toggleExtra = (panel: Exclude<ExtraPanel, null>) => {
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

  const notesPayload = useMemo(() => {
    const chunks = [description.trim(), moreDetails.trim()].filter(Boolean);
    if (location.trim()) chunks.push(`Location: ${location.trim()}`);
    if (expenses.trim()) chunks.push(`Expenses: ${expenses.trim()}`);
    if (emergencyContact.trim()) {
      chunks.push(`Emergency: ${emergencyContact.trim()}`);
    }
    if (saveAsMemo) chunks.push("Saved as memo");
    return chunks.join("\n") || null;
  }, [
    description,
    moreDetails,
    location,
    expenses,
    emergencyContact,
    saveAsMemo,
  ]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const dueDate = isFlexible
      ? null
      : combineLocalIso(startDate, startTime, isAllDay);
    const endDatetime = isFlexible
      ? hasDeadline
        ? endOfDayLocalIso(deadlineDate)
      : null
      : isAllDay
        ? null
        : combineLocalIso(endDate, endTime, false);

    const result = await createTask({
      householdId,
      creatorId: membershipId,
      title,
      description: notesPayload,
      mode,
      isAllDay: isFlexible ? false : isAllDay,
      dueDate,
      endDatetime,
      priority,
      involvedMemberIds: assigneeIds.length > 0 ? assigneeIds : null,
      targetProfileIds: beneficiaryIds.length > 0 ? beneficiaryIds : null,
      recurrenceRule: isFlexible ? null : recurrenceRuleValue(recurrence),
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
        taskId: result.id,
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
        // 任务已创建成功，仍刷新列表
        onCreated();
        return;
      }
    }

    setSubmitting(false);
    onCreated();
    onClose();
  };

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <div className="flex max-h-[min(92dvh,820px)] w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1C1C1E]/96 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
        </div>

        <header className="flex items-center justify-between gap-2 px-4 py-1.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF]/20 text-[#0A84FF] transition active:opacity-70"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            className="inline-flex min-w-0 max-w-[55%] items-center gap-1 rounded-full px-2 py-1 text-[17px] font-semibold text-white"
          >
            <span className="truncate">{groupName}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/55" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF]/20 text-[#0A84FF] transition enabled:active:opacity-70 disabled:opacity-30"
            aria-label={t("common.done")}
          >
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </p>
          ) : null}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titlePlaceholder}
            className="w-full bg-transparent px-1 pb-1 pt-2 text-[28px] font-semibold leading-tight tracking-tight text-white outline-none placeholder:text-white/25"
            autoFocus
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handlePickAttachments(e.target.files)}
          />

          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <Row
              icon={Paperclip}
              label={t("console.taskDetail.attachments")}
              showChevron
              onPress={() => toggleExtra("attachments")}
            >
              <span className="text-[15px] text-[#0A84FF]">
                {attachments.length > 0
                  ? String(attachments.length)
                  : t("console.taskDetail.addAttachment")}
              </span>
            </Row>
            {extraPanel === "attachments" ? (
              <div className="space-y-2 px-3.5 pb-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl bg-[#0A84FF]/20 py-2.5 text-[14px] font-semibold text-[#0A84FF] active:bg-[#0A84FF]/30"
                >
                  {t("console.taskDetail.addAttachment")}
                </button>
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2"
                  >
                    <Paperclip className={`h-3.5 w-3.5 ${ICON}`} strokeWidth={2} />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-white">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {file.sizeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((item) => item.id !== file.id),
                        )
                      }
                      className="text-[#FF453A]"
                      aria-label={t("common.close")}
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <Divider />

            <Row icon={Pin} label={t("console.calendar.saveAsMemo")}>
              <Toggle
                on={saveAsMemo}
                onToggle={() => setSaveAsMemo((v) => !v)}
                ariaLabel={t("console.calendar.saveAsMemo")}
              />
            </Row>
            <Divider />

            {isFlexible ? (
              <>
                <Row icon={Clock} label={t("console.calendar.fieldDeadline")}>
                  <Toggle
                    on={hasDeadline}
                    onToggle={() => setHasDeadline((v) => !v)}
                    ariaLabel={t("console.calendar.fieldDeadline")}
                  />
                </Row>
                {hasDeadline ? (
                  <>
                    <Divider />
                    <div className="px-3.5 py-3">
                      <DatePill value={deadlineDate} onChange={setDeadlineDate} />
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Row icon={Clock} label={t("console.calendar.allDay")}>
                  <Toggle
                    on={isAllDay}
                    onToggle={() => setIsAllDay((v) => !v)}
                    ariaLabel={t("console.calendar.allDay")}
                  />
                </Row>
                <Divider />
                <Row icon={CalendarDays} label={t("console.taskDetail.starts")}>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <DatePill value={startDate} onChange={setStartDate} />
                    {!isAllDay ? (
                      <TimePill value={startTime} onChange={setStartTime} />
                    ) : null}
                  </div>
                </Row>
                <Divider />
                <Row icon={CalendarDays} label={t("console.taskDetail.ends")}>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <DatePill value={endDate} onChange={setEndDate} />
                    {!isAllDay ? (
                      <TimePill value={endTime} onChange={setEndTime} />
                    ) : null}
                  </div>
                </Row>
                <Divider />
                <Row icon={Hourglass} label={t("console.taskDetail.duration")}>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[13px] text-white">
                    {duration}
                  </span>
                </Row>
              </>
            )}
            <Divider />

            <Row
              icon={Tag}
              label={t("console.taskDetail.color")}
              showChevron
              onPress={() => toggleExtra("color")}
            >
              <span
                className={`h-5 w-5 rounded-full ${COLOR_SWATCH[color]}`}
                aria-hidden
              />
            </Row>
            {extraPanel === "color" ? (
              <div className="flex flex-wrap gap-2 px-3.5 pb-3">
                {(Object.keys(COLOR_SWATCH) as ColorOption[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-[#2C2C2E] ${COLOR_SWATCH[key]} ${
                      color === key ? "ring-2 ring-[#0A84FF]" : ""
                    }`}
                    aria-label={key}
                  />
                ))}
              </div>
            ) : null}
            <Divider />

            <Row
              icon={Bell}
              label={t("console.taskDetail.remind")}
              showChevron
              onPress={() => toggleExtra("remind")}
            >
              <span className="text-[15px] text-[#30D158]">{reminderLabel}</span>
            </Row>
            {extraPanel === "remind" ? (
              <div className="px-3.5 pb-3">
                <select
                  value={reminder}
                  onChange={(e) =>
                    setReminder(e.target.value as ReminderOption)
                  }
                  className="w-full rounded-xl bg-black/25 px-3 py-2.5 text-[15px] text-white outline-none [color-scheme:dark]"
                >
                  <option value="none">{t("common.none")}</option>
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>
            ) : null}
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                toggleExtra("attachments");
                fileInputRef.current?.click();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A2E] text-[#30D158] active:bg-white/10"
              aria-label={t("console.taskDetail.addAttachment")}
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <Chip
              icon={Repeat}
              label={t("console.calendar.fieldRepeat")}
              active={extraPanel === "repeat" || recurrence !== "never"}
              onPress={() => toggleExtra("repeat")}
            />
            <Chip
              icon={MapPin}
              label={t("console.calendar.fieldLocation")}
              active={extraPanel === "location" || location.trim().length > 0}
              onPress={() => toggleExtra("location")}
            />
            <Chip
              icon={FileText}
              label={t("console.calendar.fieldMoreDetails")}
              active={extraPanel === "more" || moreDetails.trim().length > 0}
              onPress={() => toggleExtra("more")}
            />
            <Chip
              icon={User}
              label={t("console.calendar.fieldAssignee")}
              active={extraPanel === "assignee" || assigneeIds.length > 0}
              onPress={() => toggleExtra("assignee")}
            />
            <Chip
              icon={Users}
              label={t("console.calendar.forWhomLabel")}
              active={
                extraPanel === "beneficiary" || beneficiaryIds.length > 0
              }
              onPress={() => toggleExtra("beneficiary")}
            />
            <Chip
              icon={Flag}
              label={t("console.calendar.fieldPriority")}
              active={extraPanel === "priority" || priority === "urgent"}
              onPress={() => toggleExtra("priority")}
            />
            <Chip
              icon={Banknote}
              label={t("console.taskDetail.expenses")}
              active={extraPanel === "expenses" || expenses.trim().length > 0}
              onPress={() => toggleExtra("expenses")}
            />
            <Chip
              icon={Phone}
              label={t("console.calendar.fieldEmergency")}
              wide
              active={
                extraPanel === "emergency" ||
                emergencyContact.trim().length > 0
              }
              onPress={() => toggleExtra("emergency")}
            />
          </div>

          {extraPanel === "repeat" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
              <select
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(e.target.value as RecurrenceOption)
                }
                className="w-full rounded-xl bg-black/25 px-3 py-2.5 text-[15px] text-white outline-none [color-scheme:dark]"
              >
                <option value="never">{t("console.recurrence.never")}</option>
                <option value="daily">{t("console.recurrence.daily")}</option>
                <option value="weekly">{t("console.recurrence.weekly")}</option>
                <option value="monthly">
                  {t("console.recurrence.monthly")}
                </option>
                <option value="yearly">{t("console.recurrence.yearly")}</option>
              </select>
            </section>
          ) : null}

          {extraPanel === "location" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("console.taskDetail.locationDefault")}
                className="w-full rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
              />
            </section>
          ) : null}

          {extraPanel === "more" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
              <textarea
                value={moreDetails || description}
                onChange={(e) => {
                  setMoreDetails(e.target.value);
                  setDescription(e.target.value);
                }}
                rows={4}
                placeholder={t("console.calendar.createNotesPlaceholder")}
                className="w-full resize-none rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
              />
            </section>
          ) : null}

          {extraPanel === "assignee" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] pt-3">
              <p className="px-3.5 pb-2 text-[13px] text-white/55">
                {t("console.calendar.fieldAssignee")} (
                {assigneeIds.length === 0
                  ? t("common.everyone")
                  : String(assigneeIds.length)}
                )
              </p>
              {peopleLoading ? (
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
              )}
            </section>
          ) : null}

          {extraPanel === "beneficiary" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] pt-3">
              <p className="px-3.5 pb-2 text-[13px] text-white/55">
                {t("console.calendar.forWhomLabel")} (
                {beneficiaryIds.length === 0
                  ? t("common.everyone")
                  : String(beneficiaryIds.length)}
                )
              </p>
              {peopleLoading ? (
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
              )}
            </section>
          ) : null}

          {extraPanel === "priority" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
              <div className="flex rounded-full bg-black/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setPriority("normal")}
                  className={`flex-1 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    priority === "normal"
                      ? "bg-[#0A84FF] text-white"
                      : "text-white/50"
                  }`}
                >
                  {t("console.calendar.priorityNormal")}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("urgent")}
                  className={`flex-1 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    priority === "urgent"
                      ? "bg-[#FF453A] text-white"
                      : "text-white/50"
                  }`}
                >
                  {t("console.calendar.priorityUrgent")}
                </button>
              </div>
            </section>
          ) : null}

          {extraPanel === "expenses" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
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
            </section>
          ) : null}

          {extraPanel === "emergency" ? (
            <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E] px-3.5 py-3">
              <input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder={t("console.taskDetail.emergencyDefault")}
                className="w-full rounded-xl bg-black/25 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
              />
            </section>
          ) : null}

          <div className="flex justify-end pt-2 pb-1">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
              className="rounded-full bg-[#0A84FF] px-6 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-[#0A84FF]/25 transition enabled:active:opacity-90 disabled:opacity-40"
            >
              {t("console.calendar.finish")}
            </button>
          </div>
        </div>
      </div>
    </OverlayRoot>
  );
}
