"use client";

import { fetchCalendarPageData } from "../calendar/api";
import {
  reviveCalendarEvents,
  serializeCalendarEvents,
} from "../calendar/event-cache";
import type { CalendarModalState } from "../calendar/types";
import { openFlexibleTodoEvents } from "../calendar/utils";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { useMemo, useState } from "react";
import { CalendarModals } from "./calendar/calendar-modals";
import { CalendarPageSkeleton } from "./calendar/calendar-skeleton";
import { TodoListView } from "./calendar/todo-list-view";
import { ConsoleTabHeader } from "./console-tab-header";

type TodoViewProps = {
  householdId: string;
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
};

export function TodoView({
  householdId,
  enabled,
  onSessionLost,
  onSignOut,
}: TodoViewProps) {
  const { t } = useDictionary();
  const [modal, setModal] = useState<CalendarModalState>({ kind: "none" });

  const {
    data: cachedEvents,
    loading,
    error,
    revalidate: load,
  } = useCachedSupabase({
    cacheKey: LOCAL_CACHE_KEYS.tasks,
    householdId,
    enabled,
    fetchData: async () => {
      const result = await fetchCalendarPageData(householdId);
      if (!result.ok) return result;
      return { ok: true as const, data: result.data.events };
    },
    revive: reviveCalendarEvents,
    serialize: serializeCalendarEvents,
    onSessionLost,
  });

  const events = useMemo(() => cachedEvents ?? [], [cachedEvents]);
  const todoEvents = useMemo(() => openFlexibleTodoEvents(events), [events]);

  const closeModal = () => setModal({ kind: "none" });

  if (loading) {
    return <CalendarPageSkeleton />;
  }

  if (error) {
    return (
      <div className="px-4 pt-8">
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-[15px] font-medium text-gray-900">
            {t("console.calendar.loadFailed")}
          </p>
          <p className="mt-2 text-sm text-red-600">
            {translateApiMessage(t, error)}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConsoleTabHeader title={t("console.calendar.viewTodo")} onSignOut={onSignOut} />
      <TodoListView
        todos={todoEvents}
        onEventPress={(event) => setModal({ kind: "task", event })}
      />
      <CalendarModals
        modal={modal}
        onClose={closeModal}
        onOpenReadonlyAlert={() => setModal({ kind: "readonly-alert" })}
      />
    </>
  );
}
