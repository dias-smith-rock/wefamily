"use client";

import type { CalendarEvent } from "../../calendar/types";
import {
  formatTodoDueByLabel,
  groupTodosBySection,
  overdueTodos,
  completedFlexibleTodos,
  type TodoSection,
} from "../../calendar/todo-list-utils";
import { eventTrailingPersonLabel } from "../../calendar/utils";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { useMemo, useState } from "react";
import { Check, ChevronRight, History } from "lucide-react";
import { OverlayRoot } from "../family/ios-overlays";

function TodoCard({
  event,
  onPress,
}: {
  event: CalendarEvent;
  onPress: () => void;
}) {
  const trailing = eventTrailingPersonLabel(event);

  return (
    <button
      type="button"
      onClick={onPress}
      className="glass-card-day relative flex w-full items-center gap-3 overflow-hidden rounded-[16px] px-3.5 py-3 text-left transition active:scale-[0.99]"
    >
      <span
        className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-full bg-[#BF5AF2]"
        aria-hidden
      />
      <span
        className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white/35"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">
          {event.title}
        </p>
        <p className="mt-0.5 text-[12px] text-white/45">
          {formatTodoDueByLabel(event)}
        </p>
      </div>
      {trailing ? (
        <span className="max-w-[7rem] shrink-0 truncate text-right text-[12px] font-semibold tabular-nums text-white/50">
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
          <TodoCard
            key={event.id}
            event={event}
            onPress={() => onEventPress(event)}
          />
        ))}
      </div>
    </section>
  );
}

function SummarySheet({
  open,
  title,
  events,
  onClose,
  onEventPress,
}: {
  open: boolean;
  title: string;
  events: CalendarEvent[];
  onClose: () => void;
  onEventPress: (event: CalendarEvent) => void;
}) {
  const { t } = useDictionary();
  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <div className="flex max-h-[min(88dvh,720px)] w-full flex-col overflow-hidden rounded-t-[22px] bg-[#1C1C1E] shadow-2xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[17px] font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-medium text-[#0A84FF]"
          >
            {t("common.close")}
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-8">
          {events.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">
              {t("console.calendar.noEvents")}
            </p>
          ) : (
            events.map((event) => (
              <TodoCard
                key={event.id}
                event={event}
                onPress={() => {
                  onClose();
                  onEventPress(event);
                }}
              />
            ))
          )}
        </div>
      </div>
    </OverlayRoot>
  );
}

type TodoListViewProps = {
  openTodos: CalendarEvent[];
  allFlexibleTodos: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
};

export function TodoListView({
  openTodos,
  allFlexibleTodos,
  onEventPress,
}: TodoListViewProps) {
  const { t } = useDictionary();
  const [sheet, setSheet] = useState<"overdue" | "completed" | null>(null);

  const overdue = useMemo(() => overdueTodos(openTodos), [openTodos]);
  const completed = useMemo(
    () => completedFlexibleTodos(allFlexibleTodos),
    [allFlexibleTodos],
  );
  const sections = useMemo(
    () => groupTodosBySection(openTodos, false),
    [openTodos],
  );

  return (
    <div className="relative w-full px-4 pb-36 pt-2">
      {sections.length === 0 ? (
        <div className="px-2 py-16 text-center">
          <p className="text-[17px] font-semibold text-white">
            {t("console.calendar.todoEmptyTitle")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/45">
            {t("console.calendar.todoEmptyBody")}
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

      <div className="pointer-events-none fixed bottom-[calc(5.9rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 flex justify-center px-4">
        <div className="pointer-events-auto grid w-full max-w-lg grid-cols-2 gap-2 pe-16">
          <button
            type="button"
            onClick={() => setSheet("overdue")}
            className="glass-panel flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left"
          >
            <History className="h-4 w-4 shrink-0 text-[#FF9F0A]" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
              {t("console.calendar.todoOverdueCount", { count: overdue.length })}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/35" />
          </button>
          <button
            type="button"
            onClick={() => setSheet("completed")}
            className="glass-panel flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#30D158]">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
              {t("console.calendar.todoCompletedCount", {
                count: completed.length,
              })}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/35" />
          </button>
        </div>
      </div>

      <SummarySheet
        open={sheet === "overdue"}
        title={t("console.calendar.todoOverdueTitle")}
        events={overdue}
        onClose={() => setSheet(null)}
        onEventPress={onEventPress}
      />
      <SummarySheet
        open={sheet === "completed"}
        title={t("console.calendar.todoCompletedTitle")}
        events={completed}
        onClose={() => setSheet(null)}
        onEventPress={onEventPress}
      />
    </div>
  );
}
