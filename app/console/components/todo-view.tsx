"use client";

import { Menu, Printer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCalendarPageData } from "../calendar/api";
import {
  reviveCalendarEvents,
  serializeCalendarEvents,
} from "../calendar/event-cache";
import type { CalendarModalState } from "../calendar/types";
import { openFlexibleTodoEvents } from "../calendar/utils";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import { fetchHouseholdLists } from "../lists/api";
import type { HouseholdListRow } from "../lists/types";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { CalendarModals } from "./calendar/calendar-modals";
import { CalendarPageSkeleton } from "./calendar/calendar-skeleton";
import { CreateFab } from "./calendar/glass-chrome";
import { TodoListView } from "./calendar/todo-list-view";
import { CreateListSheet } from "./todo/create-list-sheet";
import { ListDetailSheet } from "./todo/list-detail-sheet";
import { PlannerListsView } from "./todo/planner-lists-view";

type TodoSegment = "todos" | "planner";

type TodoViewProps = {
  householdId: string;
  householdName?: string | null;
  membershipId: string;
  membershipRole: string;
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
  householdSwitcher?: ReactNode;
};

export function TodoView({
  householdId,
  householdName,
  membershipId,
  membershipRole,
  enabled,
  onSessionLost,
  householdSwitcher,
}: TodoViewProps) {
  const { t } = useDictionary();
  const [segment, setSegment] = useState<TodoSegment>("todos");
  const [modal, setModal] = useState<CalendarModalState>({ kind: "none" });
  const [lists, setLists] = useState<HouseholdListRow[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<HouseholdListRow | null>(
    null,
  );
  const [createListOpen, setCreateListOpen] = useState(false);

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
  const openTodos = useMemo(() => openFlexibleTodoEvents(events), [events]);
  const allFlexibleTodos = useMemo(
    () => events.filter((e) => e.isFlexibleTodo),
    [events],
  );

  const reloadLists = useCallback(async () => {
    setListsLoading(true);
    setListsError(null);
    const result = await fetchHouseholdLists(householdId);
    setListsLoading(false);
    if (!result.ok) {
      if (result.reason === "expired" || result.reason === "no_session") {
        onSessionLost();
      }
      setListsError(result.message);
      setLists([]);
      return;
    }
    setLists(result.data);
  }, [householdId, onSessionLost]);

  useEffect(() => {
    if (!enabled || segment !== "planner") return;
    let cancelled = false;
    void (async () => {
      setListsLoading(true);
      setListsError(null);
      const result = await fetchHouseholdLists(householdId);
      if (cancelled) return;
      setListsLoading(false);
      if (!result.ok) {
        if (result.reason === "expired" || result.reason === "no_session") {
          onSessionLost();
        }
        setListsError(result.message);
        setLists([]);
        return;
      }
      setLists(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, segment, householdId, onSessionLost]);

  const closeModal = () => setModal({ kind: "none" });

  const handleFab = () => {
    if (segment === "planner") {
      setCreateListOpen(true);
      return;
    }
    setModal({ kind: "action-sheet" });
  };

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
      <header className="sticky top-0 z-40 px-4 pb-2 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">{householdSwitcher}</div>
          <div className="glass-pill flex items-center gap-0.5 rounded-full p-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7CC4FF] transition active:bg-white/10"
              aria-label="Print"
            >
              <Printer className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleFab}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7CC4FF] transition active:bg-white/10"
              aria-label={t("console.calendar.switchView")}
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <div className="glass-pill inline-flex rounded-full p-1">
            <button
              type="button"
              onClick={() => setSegment("todos")}
              className={`min-w-[96px] rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                segment === "todos"
                  ? "bg-white/85 text-black"
                  : "text-white/70"
              }`}
            >
              {t("console.todo.segmentTodos")}
            </button>
            <button
              type="button"
              onClick={() => setSegment("planner")}
              className={`min-w-[96px] rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                segment === "planner"
                  ? "bg-white/85 text-black"
                  : "text-white/70"
              }`}
            >
              {t("console.todo.segmentPlanner")}
            </button>
          </div>
        </div>
      </header>

      {segment === "todos" ? (
        <TodoListView
          openTodos={openTodos}
          allFlexibleTodos={allFlexibleTodos}
          onEventPress={(event) => setModal({ kind: "task", event })}
        />
      ) : listsLoading ? (
        <CalendarPageSkeleton />
      ) : listsError ? (
        <div className="px-4 pt-8">
          <div className="glass-panel rounded-3xl p-6 text-center">
            <p className="text-sm text-red-300">
              {translateApiMessage(t, listsError)}
            </p>
          </div>
        </div>
      ) : (
        <PlannerListsView
          lists={lists}
          householdName={householdName}
          onOpenList={setSelectedList}
          onCreateList={() => setCreateListOpen(true)}
        />
      )}

      {selectedList == null ? <CreateFab onClick={handleFab} /> : null}

      <CreateListSheet
        open={createListOpen}
        householdId={householdId}
        householdName={householdName}
        membershipId={membershipId}
        onClose={() => setCreateListOpen(false)}
        onCreated={(list) => {
          setLists((prev) => [list, ...prev.filter((row) => row.id !== list.id)]);
          setSelectedList(list);
          void reloadLists();
        }}
        onSessionLost={onSessionLost}
      />

      <ListDetailSheet
        list={selectedList}
        open={selectedList != null}
        membershipId={membershipId}
        onClose={() => setSelectedList(null)}
        onSessionLost={onSessionLost}
      />

      <CalendarModals
        modal={modal}
        householdId={householdId}
        membershipId={membershipId}
        membershipRole={membershipRole}
        householdName={householdName}
        defaultDate={new Date()}
        onClose={closeModal}
        onSelectCreate={(mode) => setModal({ kind: "create", mode })}
        onOpenReadonlyAlert={() => setModal({ kind: "readonly-alert" })}
        onCreated={() => void load()}
        onSessionLost={onSessionLost}
      />
    </>
  );
}
