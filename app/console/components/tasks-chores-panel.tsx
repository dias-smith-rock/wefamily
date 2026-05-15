"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

type TabId = "all" | "pending" | "done";

type Member = {
  id: string;
  name: string;
  initials: string;
  ring: string;
  bg: string;
  text: string;
};

const MEMBERS: Member[] = [
  {
    id: "sarah",
    name: "Sarah",
    initials: "SC",
    ring: "ring-blue-200",
    bg: "bg-blue-600",
    text: "text-white",
  },
  {
    id: "emma",
    name: "Emma",
    initials: "E",
    ring: "ring-violet-200",
    bg: "bg-violet-500",
    text: "text-white",
  },
  {
    id: "leo",
    name: "Leo",
    initials: "L",
    ring: "ring-amber-200",
    bg: "bg-amber-500",
    text: "text-white",
  },
  {
    id: "james",
    name: "James",
    initials: "JM",
    ring: "ring-emerald-200",
    bg: "bg-emerald-600",
    text: "text-white",
  },
];

type HouseholdTask = {
  id: string;
  title: string;
  dueLabel: string;
  isOverdue: boolean;
  done: boolean;
  assignee: Pick<Member, "initials" | "bg" | "text">;
};

type AssignedTask = {
  id: string;
  title: string;
  dueLabel: string;
  isOverdue: boolean;
  done: boolean;
  memberId: string;
  assignee: Pick<Member, "initials" | "bg" | "text">;
};

const HOUSEHOLD_TASKS: HouseholdTask[] = [
  {
    id: "h1",
    title: "Weekly grocery run & pantry restock",
    dueLabel: "Sat, May 17",
    isOverdue: false,
    done: false,
    assignee: { initials: "E", bg: "bg-violet-500", text: "text-white" },
  },
  {
    id: "h2",
    title: "Sort recycling for Tuesday pickup",
    dueLabel: "Mon, May 12",
    isOverdue: true,
    done: false,
    assignee: { initials: "L", bg: "bg-amber-500", text: "text-white" },
  },
  {
    id: "h3",
    title: "Guest bedroom linens & towels",
    dueLabel: "Thu, May 15",
    isOverdue: false,
    done: true,
    assignee: { initials: "SC", bg: "bg-blue-600", text: "text-white" },
  },
];

const ASSIGNED_TASKS: AssignedTask[] = [
  {
    id: "a1",
    title: "Finish history reading — Chapter 7 notes",
    dueLabel: "Tue, May 20",
    isOverdue: false,
    done: false,
    memberId: "emma",
    assignee: { initials: "E", bg: "bg-violet-500", text: "text-white" },
  },
  {
    id: "a2",
    title: "Log 30 minutes of piano practice",
    dueLabel: "Wed, May 14",
    isOverdue: true,
    done: false,
    memberId: "leo",
    assignee: { initials: "L", bg: "bg-amber-500", text: "text-white" },
  },
  {
    id: "a3",
    title: "Call clinic to reschedule annual checkup",
    dueLabel: "Fri, May 9",
    isOverdue: true,
    done: true,
    memberId: "sarah",
    assignee: { initials: "SC", bg: "bg-blue-600", text: "text-white" },
  },
];

function matchesTab(done: boolean, tab: TabId) {
  if (tab === "all") return true;
  if (tab === "pending") return !done;
  return done;
}

function Avatar({
  initials,
  bg,
  text,
  size = "md",
}: Pick<Member, "initials" | "bg" | "text"> & { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full font-semibold ${bg} ${text}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function HollowCheckbox({ done }: { done: boolean }) {
  const inner = done ? (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20"
      aria-hidden
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    </span>
  ) : (
    <span
      className="h-6 w-6 rounded-full border-[1.5px] border-gray-300 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
      aria-hidden
    />
  );
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
      {inner}
    </span>
  );
}

export function TasksChoresPanel() {
  const [tab, setTab] = useState<TabId>("all");
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const [refreshSpin, setRefreshSpin] = useState(false);

  const filteredHousehold = useMemo(
    () => HOUSEHOLD_TASKS.filter((t) => matchesTab(t.done, tab)),
    [tab],
  );

  const filteredAssigned = useMemo(() => {
    return ASSIGNED_TASKS.filter((t) => {
      if (!matchesTab(t.done, tab)) return false;
      if (memberFilter && t.memberId !== memberFilter) return false;
      return true;
    });
  }, [tab, memberFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold tracking-tight text-gray-900">
            Tasks &amp; Chores
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex min-h-[44px] items-center rounded-full bg-black/[0.04] p-1 ring-1 ring-black/[0.06]"
            role="tablist"
            aria-label="Task status"
          >
            {(
              [
                ["all", "All"],
                ["pending", "Pending"],
                ["done", "Done"],
              ] as const
            ).map(([id, label]) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(id)}
                  className={`min-h-[44px] rounded-full px-4 py-2 text-[13px] font-medium transition-all sm:min-h-0 sm:py-1.5 ${
                    selected
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/[0.06]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setRefreshSpin(true);
              window.setTimeout(() => setRefreshSpin(false), 650);
            }}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-black/[0.05] hover:text-gray-800 active:scale-[0.98] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0"
            aria-label="Refresh tasks"
          >
            <RefreshCw
              className={`h-[18px] w-[18px] transition-transform ${refreshSpin ? "animate-spin" : ""}`}
              strokeWidth={1.75}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Household Tasks */}
        <section
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:rounded-3xl md:p-6"
          aria-labelledby="household-heading"
        >
          <header className="mb-1 space-y-1">
            <h2
              id="household-heading"
              className="text-lg font-semibold tracking-tight text-gray-900"
            >
              Household Tasks
            </h2>
            <p className="text-[13px] leading-relaxed text-gray-400">
              Visible to everyone in the home
            </p>
          </header>

          <ul className="mt-6">
            {filteredHousehold.length === 0 ? (
              <li className="py-10 text-center text-sm text-gray-400">
                No tasks in this view.
              </li>
            ) : (
              filteredHousehold.map((task) => (
                <li
                  key={task.id}
                  className="flex min-h-[44px] items-center gap-4 border-b border-gray-50 py-3 last:border-b-0 md:py-4"
                >
                  <HollowCheckbox done={task.done} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[15px] font-medium leading-snug ${
                        task.done ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p
                      className={`mt-1 text-[13px] ${
                        task.done
                          ? "text-gray-300"
                          : task.isOverdue
                            ? "font-medium text-red-500"
                            : "text-gray-400"
                      }`}
                    >
                      Due {task.dueLabel}
                    </p>
                  </div>
                  <Avatar {...task.assignee} />
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Assigned Tasks */}
        <section
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:rounded-3xl md:p-6"
          aria-labelledby="assigned-heading"
        >
          <header className="mb-1 space-y-1">
            <h2
              id="assigned-heading"
              className="text-lg font-semibold tracking-tight text-gray-900"
            >
              Assigned Tasks
            </h2>
            <p className="text-[13px] leading-relaxed text-gray-400">
              Personal tasks for each family member
            </p>
          </header>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMemberFilter(null)}
              className={`min-h-[44px] rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all sm:min-h-0 sm:py-1.5 ${
                memberFilter === null
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
              }`}
            >
              Everyone
            </button>
            {MEMBERS.map((m) => {
              const on = memberFilter === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMemberFilter(m.id)}
                  aria-pressed={on}
                  className={`relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-0.5 transition-transform active:scale-[0.97] sm:min-h-0 sm:min-w-0 ${
                    on ? `ring-2 ${m.ring} ring-offset-2 ring-offset-white` : ""
                  }`}
                  title={m.name}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${m.bg} ${m.text}`}
                  >
                    {m.initials}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="mt-6 space-y-3">
            {filteredAssigned.length === 0 ? (
              <li className="rounded-2xl bg-gray-50/80 py-10 text-center text-sm text-gray-400 ring-1 ring-black/[0.03]">
                No assigned tasks in this view.
              </li>
            ) : (
              filteredAssigned.map((task) => (
                <li
                  key={task.id}
                  className="group relative min-h-[44px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/40 p-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-indigo-100/80"
                >
                  <div className="relative flex min-h-[44px] items-center rounded-[15px] bg-white/85 px-3 py-3 backdrop-blur-[2px] md:px-4 md:py-3.5">
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-indigo-400 to-violet-400 opacity-90" />
                    <div className="relative flex w-full items-center gap-4 pl-1">
                      <HollowCheckbox done={task.done} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-[15px] font-semibold leading-snug ${
                              task.done
                                ? "text-gray-400 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 ring-1 ring-indigo-100/80">
                            Private
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-[13px] ${
                            task.done
                              ? "text-gray-300"
                              : task.isOverdue
                                ? "font-medium text-red-500"
                                : "text-gray-400"
                          }`}
                        >
                          Due {task.dueLabel}
                        </p>
                      </div>
                      <Avatar {...task.assignee} />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
