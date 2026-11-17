"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  Flag,
  Repeat,
  User,
  Users,
  X,
} from "lucide-react";
import {
  createTask,
  fetchHouseholdPeople,
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
  if (allDay) {
    return new Date(`${dateStr}T00:00:00`).toISOString();
  }
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
    <label className="relative inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-[12px] bg-white/10 px-2.5 py-2">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[14px] tabular-nums text-white outline-none [color-scheme:dark]"
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
    <label className="relative inline-flex w-[6.75rem] shrink-0 items-center gap-1.5 rounded-[12px] bg-white/10 px-2.5 py-2">
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[14px] tabular-nums text-white outline-none [color-scheme:dark]"
      />
      <Clock className="h-3.5 w-3.5 shrink-0 text-white/35" strokeWidth={2} />
    </label>
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
    <div className="flex flex-wrap gap-2">
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
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(() =>
    toDateInputValue(defaultDate),
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(() =>
    toDateInputValue(defaultDate),
  );
  const [endTime, setEndTime] = useState("09:30");
  const [deadlineDate, setDeadlineDate] = useState(() =>
    toDateInputValue(defaultDate),
  );
  const [hasDeadline, setHasDeadline] = useState(true);
  const [priority, setPriority] = useState<CreateTaskPriority>("normal");
  const [recurrence, setRecurrence] = useState<RecurrenceOption>("never");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [beneficiaryIds, setBeneficiaryIds] = useState<string[]>([]);
  const [people, setPeople] = useState<HouseholdPersonOption[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const end = new Date(base.getTime() + 30 * 60_000);

    setTitle("");
    setDescription("");
    setIsAllDay(false);
    setStartDate(toDateInputValue(base));
    setStartTime(toTimeInputValue(base));
    setEndDate(toDateInputValue(end));
    setEndTime(toTimeInputValue(end));
    setDeadlineDate(toDateInputValue(defaultDate));
    setHasDeadline(true);
    setPriority("normal");
    setRecurrence("never");
    setAssigneeIds([]);
    setBeneficiaryIds([]);
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

  const sheetTitle = isFlexible
    ? t("console.calendar.newTask")
    : t("console.calendar.newEvent");
  const groupName = householdName?.trim() || t("console.nav.group");
  const canSubmit = title.trim().length > 0 && !submitting;

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

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
      description,
      mode,
      isAllDay: isFlexible ? false : isAllDay,
      dueDate,
      endDatetime,
      priority,
      involvedMemberIds: assigneeIds.length > 0 ? assigneeIds : null,
      targetProfileIds: beneficiaryIds.length > 0 ? beneficiaryIds : null,
      recurrenceRule: isFlexible ? null : recurrenceRuleValue(recurrence),
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.reason === "expired" || result.reason === "no_session") {
        onSessionLost?.();
      }
      setError(translateApiMessage(t, result.message));
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <div className="flex max-h-[min(86dvh,760px)] w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1C1C1E]/96 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
        </div>

        <header className="flex items-center justify-between px-4 py-1.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF]/20 text-[#0A84FF] transition active:opacity-70"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <p className="text-[17px] font-semibold text-white">{sheetTitle}</p>
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

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-4 pt-2">
          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </p>
          ) : null}

          {/* Title + Notes */}
          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("console.calendar.createTitlePlaceholder")}
              className="w-full bg-transparent px-4 pb-1 pt-3.5 text-[28px] font-semibold leading-tight tracking-tight text-white outline-none placeholder:text-white/25"
              autoFocus
            />
            <div className="px-3 pb-3 pt-1">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("console.calendar.createNotesPlaceholder")}
                rows={3}
                className="w-full resize-none rounded-[14px] bg-black/25 px-3.5 py-3 text-[15px] text-white outline-none placeholder:text-white/30"
              />
            </div>
          </section>

          {/* Space + time */}
          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
              <CalendarDays
                className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 text-[15px] text-white/70">
                {groupName}
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#BF5AF2]" aria-hidden />
            </div>

            <Divider />

            {isFlexible ? (
              <>
                <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
                  <Clock
                    className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 text-[15px] text-white/70">
                    {t("console.calendar.fieldDeadline")}
                  </span>
                  <Toggle
                    on={hasDeadline}
                    onToggle={() => setHasDeadline((v) => !v)}
                    ariaLabel={t("console.calendar.fieldDeadline")}
                  />
                </div>
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
                <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
                  <Clock
                    className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 text-[15px] text-white/70">
                    {t("console.calendar.allDay")}
                  </span>
                  <Toggle
                    on={isAllDay}
                    onToggle={() => setIsAllDay((v) => !v)}
                    ariaLabel={t("console.calendar.allDay")}
                  />
                </div>
                <Divider />
                <div className="flex items-center gap-2 px-3.5 py-2.5">
                  <span className="w-14 shrink-0 text-[15px] text-white/55">
                    {t("console.taskDetail.starts")}
                  </span>
                  <DatePill value={startDate} onChange={setStartDate} />
                  {!isAllDay ? (
                    <TimePill value={startTime} onChange={setStartTime} />
                  ) : null}
                </div>
                {!isAllDay ? (
                  <>
                    <Divider />
                    <div className="flex items-center gap-2 px-3.5 py-2.5">
                      <span className="w-14 shrink-0 text-[15px] text-white/55">
                        {t("console.taskDetail.ends")}
                      </span>
                      <DatePill value={endDate} onChange={setEndDate} />
                      <TimePill value={endTime} onChange={setEndTime} />
                    </div>
                  </>
                ) : null}
              </>
            )}
          </section>

          {/* Priority (+ Repeat for event) */}
          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
              <Flag
                className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 text-[15px] text-white/70">
                {t("console.calendar.fieldPriority")}
              </span>
              <div className="flex rounded-full bg-black/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setPriority("normal")}
                  className={`rounded-full px-3.5 py-1 text-[13px] font-semibold transition ${
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
                  className={`rounded-full px-3.5 py-1 text-[13px] font-semibold transition ${
                    priority === "urgent"
                      ? "bg-[#FF453A] text-white"
                      : "text-white/50"
                  }`}
                >
                  {t("console.calendar.priorityUrgent")}
                </button>
              </div>
            </div>

            {!isFlexible ? (
              <>
                <Divider />
                <div className="flex min-h-[48px] items-center gap-3 px-3.5 py-2.5">
                  <Repeat
                    className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 text-[15px] text-white/70">
                    {t("console.calendar.fieldRepeat")}
                  </span>
                  <select
                    value={recurrence}
                    onChange={(e) =>
                      setRecurrence(e.target.value as RecurrenceOption)
                    }
                    className="rounded-lg bg-transparent py-1 text-right text-[15px] text-white/80 outline-none [color-scheme:dark]"
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
              </>
            ) : null}
          </section>

          {/* Assignee + For whom */}
          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <div className="px-3.5 py-3">
              <div className="mb-2.5 flex items-center gap-2">
                <User
                  className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                  strokeWidth={2}
                />
                <span className="text-[15px] text-white/70">
                  {t("console.calendar.fieldAssignee")}
                  <span className="text-white/35">
                    {" "}
                    (
                    {assigneeIds.length === 0
                      ? t("common.everyone")
                      : String(assigneeIds.length)}
                    )
                  </span>
                </span>
              </div>
              {peopleLoading ? (
                <p className="text-[13px] text-white/40">{t("common.loading")}</p>
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
            </div>

            <Divider />

            <div className="px-3.5 py-3">
              <div className="mb-2.5 flex items-center gap-2">
                <Users
                  className="h-[18px] w-[18px] shrink-0 text-[#A78BFA]"
                  strokeWidth={2}
                />
                <span className="text-[15px] text-white/70">
                  {t("console.calendar.forWhomLabel")}
                  <span className="text-white/35">
                    {" "}
                    (
                    {beneficiaryIds.length === 0
                      ? t("common.everyone")
                      : String(beneficiaryIds.length)}
                    )
                  </span>
                </span>
              </div>
              {peopleLoading ? (
                <p className="text-[13px] text-white/40">{t("common.loading")}</p>
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
            </div>
          </section>
        </div>
      </div>
    </OverlayRoot>
  );
}
