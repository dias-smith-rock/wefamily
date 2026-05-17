"use client";

import type { CalendarEvent, CalendarPerson } from "../../calendar/types";
import {
  getForWhomPeople,
  isHouseholdWideBeneficiaries,
  normalizeIdArray,
} from "../../calendar/utils";
import { Users } from "lucide-react";

const LIST_AVATAR_SIZE = "h-7 w-7";
const LIST_MAX_VISIBLE_AVATARS = 2;

function AvatarChip({
  person,
  className = "h-6 w-6",
}: {
  person: CalendarPerson;
  className?: string;
}) {
  if (person.avatarUrl) {
    return (
      <img
        src={person.avatarUrl}
        alt=""
        className={`inline-block rounded-full object-cover ring-2 ring-white ${className}`}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white ${className} ${person.avatarClass}`}
      aria-hidden
    >
      {person.initials}
    </span>
  );
}

/** 任务卡片：多人头像叠加 */
export function ForWhomAvatarGroup({
  people,
  sizeClass = "h-6 w-6",
}: {
  people: CalendarPerson[];
  sizeClass?: string;
}) {
  if (people.length === 0) return null;

  return (
    <div
      className="flex -space-x-2 overflow-hidden"
      aria-label={`为了 ${people.map((p) => p.name).join("、")}`}
    >
      {people.map((person) => (
        <AvatarChip key={person.id} person={person} className={sizeClass} />
      ))}
    </div>
  );
}

/** 列表视图卡片右侧：为了谁（头像矩阵 / 所有人） */
export function ForWhomListTrailing({
  event,
  className = "ml-3 shrink-0 pl-1",
}: {
  event: CalendarEvent;
  className?: string;
}) {
  const forWhomIds = normalizeIdArray(event.forWhomIds);

  if (isHouseholdWideBeneficiaries(event)) {
    return (
      <div className={className}>
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
          <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          所有人
        </span>
      </div>
    );
  }

  const people = getForWhomPeople(event);
  if (people.length === 0) {
    if (forWhomIds.length === 0) return null;
    return (
      <div className={className} aria-label={`为了 ${forWhomIds.length} 位成员`}>
        <span
          className={`inline-flex ${LIST_AVATAR_SIZE} items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500 ring-2 ring-white`}
        >
          +{forWhomIds.length}
        </span>
      </div>
    );
  }

  const visible = people.slice(0, LIST_MAX_VISIBLE_AVATARS);
  const overflowCount = people.length - visible.length;

  return (
    <div
      className={className}
      aria-label={`为了 ${people.map((p) => p.name).join("、")}`}
    >
      <div className="flex -space-x-1.5 overflow-hidden">
        {visible.map((person) => (
          <AvatarChip
            key={person.id}
            person={person}
            className={LIST_AVATAR_SIZE}
          />
        ))}
        {overflowCount > 0 ? (
          <span
            className={`inline-flex ${LIST_AVATAR_SIZE} items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold tabular-nums text-gray-500 ring-2 ring-white`}
            aria-hidden
          >
            +{overflowCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** 任务卡片行：为了谁 (For) */
export function ForWhomCardRow({ event }: { event: CalendarEvent }) {
  if (isHouseholdWideBeneficiaries(event)) {
    return (
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[13px] text-gray-400">为了谁 (For)</span>
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <Users className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>所有人</span>
        </div>
      </div>
    );
  }

  const people = getForWhomPeople(event);
  if (people.length === 0) return null;

  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <span className="text-[13px] text-gray-400">为了谁 (For)</span>
      {people.length === 1 ? (
        <div className="flex items-center gap-2">
          <AvatarChip person={people[0]!} className="h-8 w-8" />
          <span className="max-w-[140px] truncate text-[13px] text-gray-600">
            {people[0]!.name}
          </span>
        </div>
      ) : (
        <ForWhomAvatarGroup people={people} />
      )}
    </div>
  );
}
