"use client";

import type { CalendarEvent } from "../../calendar/types";
import {
  formatTodoDeadlineLabel,
  groupTodosBySection,
  overdueTodos,
  type TodoSection,
} from "../../calendar/todo-list-utils";
import { eventTrailingPersonLabel } from "../../calendar/utils";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
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
  const trailing = eventTrailingPersonLabel(event);

  return (
    <button
      type="button"
      onClick={onPress}
      className="glass-card-day flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left transition active:scale-[0.99]"
    >
      <Flag
        className={`h-4 w-4 shrink-0 ${overdue ? "text-[#FF453A]" : "text-[#0A84FF]"}`}
        strokeWidth={2}
        fill="currentColor"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-snug text-white">
          {event.title}
        </p>
        <p
          className={`mt-0.5 text-xs ${overdue ? "text-[#FF6B6B]" : "text-white/45"}`}
        >
          {deadlineLabel}
        </p>
      </div>
      {trailing ? (
        <span className="max-w-[6.5rem] shrink-0 truncate text-[11px] font-semibold tabular-nums text-white/50">
          {trailing}
        </span>
      ) : null}
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
      <h2 className="px-1 text-[13px] font-semibold text-white/45">
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
        <p className="text-[17px] font-semibold text-white">
          {t("console.calendar.todoEmptyTitle")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/45">
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
          className="glass-panel mb-5 flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-white">
              {t("console.calendar.todoOverdueBanner", { count: overdue.length })}
            </p>
            <p className="mt-0.5 text-xs text-white/45">
              {t("console.calendar.todoOverdueHint")}
            </p>
          </div>
        </button>
      ) : null}

      {showOverdueSheet ? (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[17px] font-semibold text-white">
              {t("console.calendar.todoOverdueTitle")}
            </h2>
            <button
              type="button"
              onClick={() => setShowOverdueSheet(false)}
              className="text-sm font-medium text-[#7CC4FF]"
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
          <p className="text-[15px] font-medium text-white">
            {t("console.calendar.todoOverdueOnlyTitle")}
          </p>
          <p className="mt-2 text-sm text-white/45">
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
