"use client";

import type { CalendarEvent } from "../../calendar/types";
import {
  formatEventDuration,
  formatEventTime,
  isHouseholdWideBeneficiaries,
} from "../../calendar/utils";
import {
  getTaskDetailFieldValues,
} from "../../calendar/task-detail-utils";
import { canEditTask } from "../../lib/task-edit-access";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { resolveClientLocale } from "@/lib/i18n/client-locale";
import { OverlayRoot } from "../family/ios-overlays";
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

function formatPillDate(date: Date): string {
  return new Intl.DateTimeFormat(resolveClientLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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
      <div className="flex max-w-[62%] shrink-0 items-center justify-end gap-1.5">
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
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#2A2A2E] px-3 py-2 text-[13px] text-white/80 ${
        wide ? "flex-1 justify-center" : ""
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#A78BFA]" strokeWidth={2} />
      <span className="truncate">{label}</span>
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

export function TaskDetailSheet({
  event,
  membershipId,
  membershipRole,
  householdName,
  open,
  onClose,
  onReadonlyAction,
}: {
  event: CalendarEvent;
  membershipId: string;
  membershipRole: string;
  householdName?: string | null;
  open: boolean;
  onClose: () => void;
  onReadonlyAction?: () => void;
}) {
  const { t } = useDictionary();
  const fields = getTaskDetailFieldValues(event);
  const labels = fields.labels;
  const editable = canEditTask({
    creatorId: event.creatorId,
    membershipId,
    role: membershipRole,
  });

  const duration =
    formatEventDuration(event) ||
    (event.isAllDay ? t("console.calendar.allDay") : "—");
  const forWhomValue = forWhomTrailing(event, t("common.everyone"));
  const assignee = assigneeTrailing(event);
  const endAt = event.endAt ?? event.startAt;
  const priorityUrgent = fields.prioritySegment === "urgent";
  const groupName = householdName?.trim() || t("console.nav.group");

  const guardEdit = () => {
    if (!editable) onReadonlyAction?.();
  };

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
            <button
              type="button"
              onClick={() => {
                if (!editable) {
                  onReadonlyAction?.();
                  return;
                }
                onClose();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A84FF]/20 text-[#0A84FF] transition active:opacity-70"
              aria-label={t("common.done")}
            >
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </header>

          <div className="pb-3 pt-1">
            <p className="text-[28px] font-semibold leading-tight tracking-tight text-white">
              {event.title}
            </p>
          </div>

          {!editable ? (
            <div className="mb-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-[13px] leading-snug text-amber-100">
              {t("console.calendar.readonlyDetailHint")}
            </div>
          ) : null}

          <section className="overflow-hidden rounded-[18px] bg-[#2C2C2E]">
            <DetailRow icon={CalendarDays} label={groupName}>
              <span className="h-2.5 w-2.5 rounded-full bg-[#BF5AF2]" aria-hidden />
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow
              icon={Paperclip}
              label={t("console.taskDetail.attachments")}
              showChevron
            >
              <button
                type="button"
                onClick={guardEdit}
                className="text-[15px] text-[#0A84FF]"
              >
                {t("console.taskDetail.addAttachment")}
              </button>
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow icon={Clock} label={t("console.calendar.allDay")}>
              <span
                className={`relative h-[28px] w-[48px] rounded-full transition ${
                  event.isAllDay ? "bg-[#30D158]" : "bg-white/15"
                }`}
                aria-hidden
              >
                <span
                  className={`absolute top-[2px] h-6 w-6 rounded-full bg-white shadow transition ${
                    event.isAllDay ? "right-[2px]" : "left-[2px]"
                  }`}
                />
              </span>
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow icon={CalendarDays} label={t("console.taskDetail.starts")}>
              <DateTimePills date={event.startAt} allDay={event.isAllDay} />
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow icon={CalendarDays} label={t("console.taskDetail.ends")}>
              <DateTimePills date={endAt} allDay={event.isAllDay} />
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow icon={Hourglass} label={t("console.taskDetail.duration")}>
              <span className="text-[15px] text-white">{duration}</span>
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow
              icon={Tag}
              label={t("console.taskDetail.color")}
              showChevron
            >
              <span className="h-5 w-5 rounded-full bg-white" aria-hidden />
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow
              icon={Bell}
              label={t("console.taskDetail.remind")}
              showChevron
            >
              <span className="text-[15px] text-[#BF5AF2]">
                {fields.reminderValue}
              </span>
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow
              icon={User}
              label={labels.fieldAssignee}
              showChevron
            >
              {assignee.kind === "count" ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#BF5AF2] px-1.5 text-[12px] font-bold text-white">
                  {assignee.value}
                </span>
              ) : (
                <span className="truncate text-[15px] text-[#BF5AF2]">
                  {assignee.value}
                </span>
              )}
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow
              icon={Users}
              label={t("console.calendar.forWhomLabel")}
              showChevron
            >
              <span className="truncate text-[15px] tabular-nums text-[#BF5AF2]">
                {forWhomValue}
              </span>
            </DetailRow>
            <div className="mx-3 h-px bg-white/[0.08]" />

            <DetailRow
              icon={Flag}
              label={labels.fieldPriority}
              showChevron
            >
              <span className="inline-flex items-center gap-1.5 text-[15px] text-white">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    priorityUrgent ? "bg-[#FF453A]" : "bg-[#0A84FF]"
                  }`}
                  aria-hidden
                />
                {priorityUrgent
                  ? fields.priorityUrgent
                  : fields.priorityNormal}
              </span>
            </DetailRow>
          </section>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={guardEdit}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A2E] text-[#A78BFA]"
              aria-label={t("console.calendar.createNew")}
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <Chip icon={Repeat} label={labels.fieldRepeat} />
            <Chip icon={MapPin} label={labels.fieldLocation} />
            <Chip icon={MoreHorizontal} label={labels.fieldMoreDetails} />
          </div>

          <div className="mt-2 flex gap-2">
            <Chip icon={Banknote} label={t("console.taskDetail.expenses")} />
            <Chip
              icon={Phone}
              label={labels.fieldEmergency}
              wide
            />
          </div>

          <p className="mt-4 text-center text-[11px] text-white/35">
            {t("console.taskDetail.lastEditedHint")}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 pb-2">
            <button
              type="button"
              onClick={guardEdit}
              className="rounded-2xl bg-[#2C2C2E] py-3.5 text-[16px] font-semibold text-[#FF9F0A] transition active:opacity-80"
            >
              {t("console.taskDetail.acceptTask")}
            </button>
            <button
              type="button"
              onClick={guardEdit}
              className="rounded-2xl bg-[#2C2C2E] py-3.5 text-[16px] font-semibold text-white transition active:opacity-80"
            >
              {t("console.taskDetail.deleteTask")}
            </button>
          </div>
        </div>
      </div>
    </OverlayRoot>
  );
}
