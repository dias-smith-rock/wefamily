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
import { useMemo, useState, type ReactNode } from "react";
import { CalendarModals } from "./calendar/calendar-modals";
import { CalendarPageSkeleton } from "./calendar/calendar-skeleton";
import { TodoListView } from "./calendar/todo-list-view";
import { ConsoleTabHeader } from "./console-tab-header";
import { CreateFab } from "./calendar/glass-chrome";

type TodoViewProps = {
  householdId: string;
  membershipId: string;
  membershipRole: string;
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
  householdSwitcher?: ReactNode;
};

export function TodoView({
  householdId,
  membershipId,
  membershipRole,
  enabled,
  onSessionLost,
  onSignOut,
  householdSwitcher,
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
        <div className="glass-panel rounded-3xl p-6 text-center">
          <p className="text-[15px] font-medium text-white">
            {t("console.calendar.loadFailed")}
          </p>
          <p className="mt-2 text-sm text-red-300">
            {translateApiMessage(t, error)}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-full bg-[#0A84FF] px-5 py-2 text-sm font-semibold text-white"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConsoleTabHeader
        title={t("console.calendar.viewTodo")}
        onSignOut={onSignOut}
        leading={householdSwitcher}
      />
      <TodoListView
        todos={todoEvents}
        onEventPress={(event) => setModal({ kind: "task", event })}
      />
      <CreateFab onClick={() => setModal({ kind: "action-sheet" })} />
      <CalendarModals
        modal={modal}
        membershipId={membershipId}
        membershipRole={membershipRole}
        onClose={closeModal}
        onOpenReadonlyAlert={() => setModal({ kind: "readonly-alert" })}
      />
    </>
  );
}
