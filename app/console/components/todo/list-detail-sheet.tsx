"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Plus, Printer } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import {
  createListItem,
  fetchListItems,
  setListItemChecked,
} from "../../lists/api";
import type { HouseholdListRow, ListItemRow } from "../../lists/types";
import { resolveGuestDisplayName } from "../../lib/guest-display-name";

export function ListDetailSheet({
  list,
  open,
  membershipId,
  onClose,
  onSessionLost,
}: {
  list: HouseholdListRow | null;
  open: boolean;
  membershipId: string;
  onClose: () => void;
  onSessionLost?: () => void;
}) {
  const { t } = useDictionary();
  const [items, setItems] = useState<ListItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !list) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDraft("");
    void fetchListItems(list.id).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        if (result.reason === "expired" || result.reason === "no_session") {
          onSessionLost?.();
        }
        setError(result.message);
        setItems([]);
        return;
      }
      setItems(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, list?.id, onSessionLost]);

  const unchecked = useMemo(
    () => items.filter((i) => !i.is_checked),
    [items],
  );
  const checked = useMemo(
    () => items.filter((i) => i.is_checked),
    [items],
  );

  const handleAdd = async () => {
    if (!list || adding || !draft.trim()) return;
    setAdding(true);
    setError(null);

    const nextOrder =
      items.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1;

    const result = await createListItem({
      listId: list.id,
      householdId: list.household_id,
      creatorId: membershipId,
      title: draft,
      sortOrder: nextOrder,
    });

    setAdding(false);

    if (!result.ok) {
      if (result.reason === "expired" || result.reason === "no_session") {
        onSessionLost?.();
      }
      setError(result.message);
      return;
    }

    setItems((prev) => [...prev, result.data]);
    setDraft("");
  };

  const handleToggle = async (item: ListItemRow) => {
    if (togglingId) return;
    setTogglingId(item.id);

    const nextChecked = !item.is_checked;
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? {
              ...row,
              is_checked: nextChecked,
              completed_by: nextChecked ? membershipId : null,
              completed_at: nextChecked ? new Date().toISOString() : null,
            }
          : row,
      ),
    );

    const result = await setListItemChecked({
      itemId: item.id,
      checked: nextChecked,
      membershipId,
    });

    setTogglingId(null);

    if (!result.ok) {
      if (result.reason === "expired" || result.reason === "no_session") {
        onSessionLost?.();
      }
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? item : row)),
      );
      setError(result.message);
      return;
    }

    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? result.data : row)),
    );
  };

  if (!open || !list) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-center">
      <div className="flex h-dvh w-full max-w-lg flex-col bg-black/40 backdrop-blur-2xl">
        <header className="flex shrink-0 items-center justify-between px-3 pb-2 pt-[max(0.55rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90"
            aria-label={t("common.close")}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <h2 className="max-w-[60%] truncate text-[17px] font-bold text-white">
            {list.title}
          </h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#7CC4FF]"
            aria-label="Print"
          >
            <Printer className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
          {loading ? (
            <p className="py-16 text-center text-sm text-white/45">
              {t("common.loading")}
            </p>
          ) : (
            <>
              {error ? (
                <p className="mb-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-[13px] text-red-200">
                  {translateApiMessage(t, error)}
                </p>
              ) : null}

              <section className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.06]">
                {unchecked.length === 0 ? (
                  <p className="px-4 py-14 text-center text-[16px] text-white/40">
                    {t("console.todo.listItemsEmpty")}
                  </p>
                ) : (
                  unchecked.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 ? (
                        <div className="mx-4 h-px bg-white/[0.08]" />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleToggle(item)}
                        disabled={togglingId === item.id}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/5"
                      >
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border-2 border-white/35"
                          aria-hidden
                        />
                        <p className="min-w-0 flex-1 text-[16px] text-white">
                          {item.title}
                        </p>
                      </button>
                    </div>
                  ))
                )}
              </section>

              {checked.length > 0 ? (
                <div className="mt-5">
                  <h3 className="mb-2 px-1 text-[14px] font-semibold text-white">
                    {t("console.todo.checked")}
                  </h3>
                  <section className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.06]">
                    {checked.map((item, index) => (
                      <div key={item.id}>
                        {index > 0 ? (
                          <div className="mx-4 h-px bg-white/[0.08]" />
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleToggle(item)}
                          disabled={togglingId === item.id}
                          className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-white/5"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#30D158]">
                            <Check
                              className="h-3 w-3 text-white"
                              strokeWidth={3}
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[16px] text-white/45 line-through">
                              {item.title}
                            </p>
                            {item.completed_by ? (
                              <p className="mt-0.5 text-[12px] text-white/35">
                                {t("console.todo.checkedBy", {
                                  name: resolveGuestDisplayName(
                                    null,
                                    item.completed_by,
                                  ),
                                })}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      </div>
                    ))}
                  </section>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="pointer-events-none absolute bottom-[calc(5.9rem+env(safe-area-inset-bottom))] left-0 right-0 z-10 px-4">
          <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("console.todo.addItemPlaceholder")}
              className="min-h-[44px] flex-1 rounded-full border border-white/10 bg-[#1C1C1E]/85 px-4 text-[15px] text-white outline-none backdrop-blur-md placeholder:text-white/35"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={adding || !draft.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A84FF] text-white shadow-ios-fab transition enabled:active:scale-95 disabled:opacity-40"
              aria-label={t("console.calendar.createNew")}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
