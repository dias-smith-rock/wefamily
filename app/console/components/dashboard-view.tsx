"use client";

import {
  Calendar,
  Check,
  CheckSquare,
  Flame,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ConsoleUser } from "../types";

type DashboardTask = {
  id: string;
  title: string;
  assignee: string;
  done: boolean;
  dueLabel: "Today" | "Tomorrow" | string;
  dueTone: "red" | "orange" | "gray";
};

type DashboardEvent = {
  id: string;
  title: string;
  date: string;
  dot: "blue" | "green" | "purple";
};

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  icon: "check" | "star";
  iconBg: string;
};

type MemberCard = {
  id: string;
  name: string;
  subtitle: string;
  initials: string;
  avatarClass: string;
  streak: string;
  tasksCount: number;
};

const MOCK_SUMMARY = {
  tasksToday: { fraction: "2/6", sub: "2 overdue · 4 on track" },
  members: { count: "4", sub: "All active this week" },
  events: { count: "3", sub: "Next: Sat, May 17" },
};

const MOCK_DASHBOARD_TASKS: DashboardTask[] = [
  {
    id: "1",
    title: "Clean kitchen after dinner",
    assignee: "Mia Chen",
    done: true,
    dueLabel: "Today",
    dueTone: "red",
  },
  {
    id: "2",
    title: "Take out recycling bins",
    assignee: "Leo Chen",
    done: false,
    dueLabel: "Today",
    dueTone: "red",
  },
  {
    id: "3",
    title: "Grocery run — Whole Foods",
    assignee: "David Chen",
    done: false,
    dueLabel: "Tomorrow",
    dueTone: "orange",
  },
];

const MOCK_EVENTS: DashboardEvent[] = [
  { id: "1", title: "Family Movie Night", date: "Sat, May 17 · 8:00 PM", dot: "blue" },
  { id: "2", title: "Grandma’s birthday lunch", date: "Sun, May 18 · 12:30 PM", dot: "green" },
  { id: "3", title: "Soccer practice (Leo)", date: "Tue, May 20 · 4:00 PM", dot: "purple" },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    text: "Mia completed “Clean bedroom”",
    time: "2m ago",
    icon: "check",
    iconBg: "bg-emerald-500",
  },
  {
    id: "2",
    text: "Leo earned the “Streak King” badge",
    time: "1h ago",
    icon: "star",
    iconBg: "bg-amber-500",
  },
];

const MOCK_MEMBER_CARDS: MemberCard[] = [
  {
    id: "1",
    name: "Sarah Chen",
    subtitle: "Parent · Household Admin",
    initials: "SC",
    avatarClass: "bg-blue-600",
    streak: "7d",
    tasksCount: 3,
  },
  {
    id: "2",
    name: "David Chen",
    subtitle: "Parent",
    initials: "DC",
    avatarClass: "bg-emerald-500",
    streak: "5d",
    tasksCount: 2,
  },
  {
    id: "3",
    name: "Mia Chen",
    subtitle: "Child · 14",
    initials: "MC",
    avatarClass: "bg-violet-500",
    streak: "12d",
    tasksCount: 4,
  },
  {
    id: "4",
    name: "Leo Chen",
    subtitle: "Child · 11",
    initials: "LC",
    avatarClass: "bg-orange-500",
    streak: "3d",
    tasksCount: 5,
  },
];

const dotClass = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-violet-500",
};

const duePillClass = {
  red: "bg-red-50 text-red-600 ring-1 ring-red-100",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  gray: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

function firstName(full: string) {
  return full.split(/\s+/)[0] ?? full;
}

function useOverviewSubtitle(displayName: string) {
  const [line, setLine] = useState(
    `Good morning, ${firstName(displayName)}. Here's your family's overview for today.`,
  );

  useEffect(() => {
    const fn = firstName(displayName);
    const h = new Date().getHours();
    const prefix =
      h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    setLine(
      `${prefix}, ${fn}. Here's your family's overview for today.`,
    );
  }, [displayName]);

  return line;
}

type DashboardViewProps = {
  user: ConsoleUser;
};

export function DashboardView({ user }: DashboardViewProps) {
  const subtitle = useOverviewSubtitle(user.name);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-gray-500">{subtitle}</p>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Tasks today
              </p>
              <p className="mt-3 text-4xl font-bold tabular-nums text-gray-900">
                {MOCK_SUMMARY.tasksToday.fraction}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {MOCK_SUMMARY.tasksToday.sub}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <CheckSquare className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Family members
              </p>
              <p className="mt-3 text-4xl font-bold tabular-nums text-gray-900">
                {MOCK_SUMMARY.members.count}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {MOCK_SUMMARY.members.sub}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Users className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Upcoming events
              </p>
              <p className="mt-3 text-4xl font-bold tabular-nums text-gray-900">
                {MOCK_SUMMARY.events.count}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {MOCK_SUMMARY.events.sub}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Calendar className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">Tasks & Chores</h2>
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View all
            </button>
          </div>
          <ul className="mt-5 divide-y divide-gray-100">
            {MOCK_DASHBOARD_TASKS.map((task) => (
              <li key={task.id} className="flex items-start gap-3 py-4 first:pt-0">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    task.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {task.done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium text-gray-900 ${
                      task.done ? "text-gray-400 line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{task.assignee}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${duePillClass[task.dueTone]}`}
                >
                  {task.dueLabel}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-gray-900">Upcoming events</h2>
            <ul className="mt-4 space-y-4">
              {MOCK_EVENTS.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass[ev.dot]}`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{ev.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{ev.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-bold text-gray-900">Recent activity</h2>
            <ul className="relative mt-4 space-y-0 pl-2">
              <div
                className="absolute bottom-2 left-[15px] top-2 w-px bg-gray-200"
                aria-hidden
              />
              {MOCK_ACTIVITY.map((item) => (
                <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconBg} text-white shadow-sm`}
                  >
                    {item.icon === "check" ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Sparkles className="h-4 w-4" strokeWidth={2} />
                    )}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{item.text}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Family members */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] md:p-8">
        <h2 className="text-lg font-bold text-gray-900">Family members</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MOCK_MEMBER_CARDS.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition hover:border-gray-200 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${m.avatarClass}`}
                >
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{m.name}</p>
                  <p className="truncate text-sm text-gray-500">{m.subtitle}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4 border-t border-gray-100/80 pt-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" strokeWidth={2} />
                  <span className="font-semibold tabular-nums">{m.streak}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-gray-400" strokeWidth={2} />
                  <span className="font-semibold tabular-nums">{m.tasksCount}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
