"use client";

import type { CalendarEvent, CalendarPerson } from "../../calendar/types";
import { isHouseholdWideBeneficiaries } from "../../calendar/utils";
import {
  getTaskDetailFieldValues,
  type TaskPrioritySegment,
} from "../../calendar/task-detail-utils";
import { OverlayRoot } from "../family/ios-overlays";
import {
  Banknote,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  MapPin,
  Repeat,
  Tag,
  User,
  UserRound,
  Users,
} from "lucide-react";

const MOCK_LOCATION = "东田丽园";

function InsetCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function CardSectionTitle({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="flex items-center gap-1.5 px-4 pb-2 pt-4 text-[13px] text-gray-400">
      {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={2} /> : null}
      <span>{children}</span>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName = "text-[15px] text-gray-900",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-[18px] w-[18px] shrink-0 text-gray-400" strokeWidth={2} />
        <span className="text-[15px] text-gray-400">{label}</span>
      </div>
      <span className={`shrink-0 text-right ${valueClassName}`}>{value}</span>
    </div>
  );
}

function BeneficiaryAvatar({
  person,
  selected,
}: {
  person: CalendarPerson | null;
  selected: boolean;
}) {
  if (!person) {
    return (
      <div className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-6 w-6 text-gray-400" strokeWidth={2} />
        </div>
        <span className="max-w-[72px] truncate text-center text-[11px] text-gray-400">
          所有人
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
      <div className="relative">
        {person.avatarUrl ? (
          <img
            src={person.avatarUrl}
            alt=""
            className={`h-14 w-14 rounded-full object-cover ring-1 ring-black/5 ${
              selected ? "ring-2 ring-blue-500" : ""
            }`}
          />
        ) : (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold text-white ${person.avatarClass} ${
              selected ? "ring-2 ring-blue-500 ring-offset-1" : ""
            }`}
          >
            {person.initials}
          </div>
        )}
        {selected ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <span className="max-w-[72px] truncate text-center text-[11px] text-gray-400">
        {person.name}
      </span>
    </div>
  );
}

function PrioritySegment({
  active,
}: {
  active: TaskPrioritySegment;
}) {
  return (
    <div className="flex rounded-xl bg-gray-100/80 p-1">
      <div
        className={`flex-1 rounded-lg py-2.5 text-center text-[15px] font-medium ${
          active === "urgent"
            ? "bg-blue-100 text-blue-500"
            : "text-gray-400"
        }`}
      >
        紧急
      </div>
      <div
        className={`flex-1 rounded-lg py-2.5 text-center text-[15px] font-medium ${
          active === "normal"
            ? "bg-blue-100 text-blue-500"
            : "text-gray-400"
        }`}
      >
        一般
      </div>
    </div>
  );
}

function resolveForWhomDisplay(event: CalendarEvent): {
  isEveryone: boolean;
  people: CalendarPerson[];
  selectedId: string | null;
} {
  const people = event.beneficiaries ?? [];
  if (isHouseholdWideBeneficiaries(event)) {
    return { isEveryone: true, people: [], selectedId: null };
  }
  const selectedId =
    event.forPerson?.id ?? people[0]?.id ?? null;
  return { isEveryone: false, people, selectedId };
}

export function TaskDetailSheet({
  event,
  open,
  onClose,
}: {
  event: CalendarEvent;
  open: boolean;
  onClose: () => void;
}) {
  const fields = getTaskDetailFieldValues(event);
  const forWhom = resolveForWhomDisplay(event);

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
        <div className="flex max-h-[min(92dvh,780px)] w-full flex-col overflow-hidden rounded-t-[20px] bg-[#F2F2F7] shadow-2xl">
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="h-1 w-9 rounded-full bg-gray-300" aria-hidden />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <header className="relative sticky top-0 z-10 flex items-center justify-between bg-[#F2F2F7]/90 px-4 py-3 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[52px] text-left text-[17px] font-medium text-blue-600 active:opacity-70"
              >
                关闭
              </button>
                            <h2 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-gray-900">
                任务详情
              </h2>
              <div className="min-w-[52px]" aria-hidden /></header>

            <h1 className="px-4 pb-2 pt-4 text-4xl font-extrabold tracking-tight text-black">
              {event.title}
            </h1>

            <InsetCard className="divide-y divide-gray-100">
              <InfoRow
                icon={Calendar}
                label="时间"
                value={fields.timeValue}
              />
              <InfoRow icon={Repeat} label="重复" value={fields.repeatValue} />
              <InfoRow icon={Bell} label="提醒" value={fields.reminderValue} />
              <InfoRow
                icon={User}
                label="谁去办"
                value={fields.assigneeValue}
              />
              <InfoRow
                icon={Banknote}
                label="预计开销"
                value={fields.budgetValue}
              />
              <InfoRow
                icon={Tag}
                label="当前状态"
                value={fields.statusValue}
                valueClassName={
                  fields.statusHighlight
                    ? "text-[15px] font-medium text-blue-500"
                    : "text-[15px] text-gray-900"
                }
              />
            </InsetCard>

            <InsetCard>
              <CardSectionTitle icon={Users}>为了谁</CardSectionTitle>
              <div className="flex gap-3 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {forWhom.isEveryone ? (
                  <BeneficiaryAvatar person={null} selected={false} />
                ) : (
                  forWhom.people.map((person) => (
                    <BeneficiaryAvatar
                      key={person.id}
                      person={person}
                      selected={person.id === forWhom.selectedId}
                    />
                  ))
                )}
              </div>
            </InsetCard>

            <InsetCard>
              <CardSectionTitle>任务优先级</CardSectionTitle>
              <div className="px-4 pb-4">
                <PrioritySegment active={fields.prioritySegment} />
              </div>
            </InsetCard>

            <InsetCard>
              <CardSectionTitle>紧急联系号码 / 会议链接</CardSectionTitle>
              <div className="flex items-center justify-between px-4 pb-4">
                <span className="text-[15px] text-gray-300">
                  {fields.emergencyContactValue}
                </span>
                <UserRound
                  className="h-5 w-5 text-gray-300"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </InsetCard>

            <InsetCard>
              <CardSectionTitle>地理位置</CardSectionTitle>
              <div className="flex items-center gap-2 px-4 pb-4">
                <MapPin
                  className="h-[18px] w-[18px] shrink-0 text-gray-400"
                  strokeWidth={2}
                />
                <span className="min-w-0 flex-1 text-[15px] text-gray-900">
                  {MOCK_LOCATION}
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-gray-300"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </InsetCard>

            <InsetCard>
              <CardSectionTitle>财务与备注</CardSectionTitle>
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-base font-bold text-gray-900">
                    预计开销
                  </span>
                  <span className="text-base text-gray-400">
                    {fields.budgetValue}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-[13px] text-gray-400">详细说明</p>
                {fields.descriptionValue ? (
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-700">
                    {fields.descriptionValue}
                  </p>
                ) : (
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-300">
                    {fields.descriptionPlaceholder ?? fields.notesEmptyLabel}
                  </p>
                )}
              </div>
            </InsetCard>

            <InsetCard>
              <CardSectionTitle>更多细节</CardSectionTitle>
              <p className="px-4 pb-4 text-[15px] text-gray-300">
                {fields.descriptionValue || fields.notesEmptyLabel}
              </p>
            </InsetCard>

            <div
              className="pb-[max(2rem,env(safe-area-inset-bottom))]"
              aria-hidden
            />
          </div>
        </div>
    </OverlayRoot>
  );
}
