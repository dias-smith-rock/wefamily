"use client";

import type { CalendarEvent } from "../../calendar/types";
import {
  formatTodoDeadlineLabel,
  groupTodosBySection,
  overdueTodos,
  type TodoSection,
} from "../../calendar/todo-list-utils";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { ForWhomListTrailing } from "./for-whom-display";
import { useMemo, useState } from "react";
import { Flag } from "lucide-react";

function TodoRow({
  event,
  overdue,
  onPress,
}: {
  event: CalendarEvent;
  overdue: boolean;
  onPress: () => void;
}) {
  const deadlineLabel = formatTodoDeadlineLabel(event);

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50/80 px-3 py-2.5 text-left transition active:opacity-95"
    >
      <Flag
        className={`h-4 w-4 shrink-0 ${overdue ? "text-red-500" : "text-blue-500"}`}
        strokeWidth={2}
        fill="currentColor"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-snug text-gray-900">
          {event.title}
        </p>
        <p
          className={`mt-0.5 text-xs ${overdue ? "text-red-500" : "text-gray-400"}`}
        >
          {deadlineLabel}
        </p>
      </div>
      <ForWhomListTrailing event={event} className="ml-2 shrink-0" />
    </button>
  );
}

function TodoSectionBlock({
  section,
  onEventPress,
}: {
  section: TodoSection;
  onEventPress: (event: CalendarEvent) => void;
}) {
  const { t } = useDictionary();

  return (
    <section className="space-y-2.5">
      <h2 className="px-1 text-[13px] font-semibold text-gray-400">
        {t(section.labelKey)}
      </h2>
      <div className="space-y-2">
        {section.events.map((event) => (
          <TodoRow
            key={event.id}
            event={event}
            overdue={section.id === "overdue"}
            onPress={() => onEventPress(event)}
          />
        ))}
      </div>
    </section>
  );
}

type TodoListViewProps = {
  todos: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
};

export function TodoListView({ todos, onEventPress }: TodoListViewProps) {
  const { t } = useDictionary();
  const [showOverdueSheet, setShowOverdueSheet] = useState(false);

  const overdue = useMemo(() => overdueTodos(todos), [todos]);
  const sections = useMemo(
    () => groupTodosBySection(todos, false),
    [todos],
  );
  const overdueSections = useMemo(
    () => groupTodosBySection(todos, true).filter((s) => s.id === "overdue"),
    [todos],
  );

  if (todos.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-[17px] font-semibold text-gray-900">
          {t("console.calendar.todoEmptyTitle")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          {t("console.calendar.todoEmptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-32 pt-2">
      {overdue.length > 0 && !showOverdueSheet ? (
        <button
          type="button"
          onClick={() => setShowOverdueSheet(true)}
          className="mb-5 flex w-full items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50/80 px-3 py-2.5 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-gray-900">
              {t("console.calendar.todoOverdueBanner", { count: overdue.length })}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {t("console.calendar.todoOverdueHint")}
            </p>
          </div>
        </button>
      ) : null}

      {showOverdueSheet ? (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[17px] font-semibold text-gray-900">
              {t("console.calendar.todoOverdueTitle")}
            </h2>
            <button
              type="button"
              onClick={() => setShowOverdueSheet(false)}
              className="text-sm font-medium text-blue-600"
            >
              {t("common.close")}
            </button>
          </div>
          {overdueSections.map((section) => (
            <TodoSectionBlock
              key={section.id}
              section={section}
              onEventPress={onEventPress}
            />
          ))}
        </div>
      ) : null}

      {sections.length === 0 && overdue.length > 0 && !showOverdueSheet ? (
        <div className="py-12 text-center">
          <p className="text-[15px] font-medium text-gray-900">
            {t("console.calendar.todoOverdueOnlyTitle")}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {t("console.calendar.todoOverdueOnlyBody")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <TodoSectionBlock
              key={section.id}
              section={section}
              onEventPress={onEventPress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
