"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  Plus,
  Printer,
} from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { fetchListItems } from "../../lists/api";
import type { HouseholdListRow, ListItemRow } from "../../lists/types";
import { OverlayRoot } from "../family/ios-overlays";
import { resolveGuestDisplayName } from "../../lib/guest-display-name";

export function ListDetailSheet({
  list,
  open,
  onClose,
  onReadonlyAction,
}: {
  list: HouseholdListRow | null;
  open: boolean;
  onClose: () => void;
  onReadonlyAction?: () => void;
}) {
  const { t } = useDictionary();
  const [items, setItems] = useState<ListItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !list) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchListItems(list.id).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.message);
        setItems([]);
        return;
      }
      setItems(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, list?.id]);

  const unchecked = useMemo(
    () => items.filter((i) => !i.is_checked),
    [items],
  );
  const checked = useMemo(
    () => items.filter((i) => i.is_checked),
    [items],
  );

  if (!list) return null;

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <div className="flex max-h-[min(94dvh,820px)] w-full flex-col overflow-hidden rounded-t-[22px] bg-[#12141C]/95 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
        </div>

        <header className="flex items-center justify-between px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#7CC4FF]"
            aria-label={t("common.close")}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <h2 className="text-[17px] font-bold text-white">{list.title}</h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#7CC4FF]"
            aria-label="Print"
          >
            <Printer className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {loading ? (
            <p className="py-16 text-center text-sm text-white/45">
              {t("common.loading")}
            </p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-300">
              {translateApiMessage(t, error)}
            </p>
          ) : (
            <>
              <section className="glass-panel overflow-hidden rounded-[18px]">
                {unchecked.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-white/40">
                    {t("console.todo.listItemsEmpty")}
                  </p>
                ) : (
                  unchecked.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 ? (
                        <div className="mx-4 h-px bg-white/[0.08]" />
                      ) : null}
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border-2 border-white/35"
                          aria-hidden
                        />
                        <p className="min-w-0 flex-1 text-[16px] text-white">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </section>

              {checked.length > 0 ? (
                <div className="mt-5">
                  <h3 className="mb-2 px-1 text-[14px] font-semibold text-white">
                    {t("console.todo.checked")}
                  </h3>
                  <section className="glass-panel overflow-hidden rounded-[18px]">
                    {checked.map((item, index) => (
                      <div key={item.id}>
                        {index > 0 ? (
                          <div className="mx-4 h-px bg-white/[0.08]" />
                        ) : null}
                        <div className="flex items-start gap-3 px-4 py-3.5">
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
                        </div>
                      </div>
                    ))}
                  </section>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-5 flex items-center gap-2 pb-4">
            <div className="glass-panel flex min-h-[44px] flex-1 items-center rounded-full px-4 text-[15px] text-white/35">
              {t("console.todo.addItemPlaceholder")}
            </div>
            <button
              type="button"
              onClick={() => onReadonlyAction?.()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A84FF] text-white shadow-ios-fab"
              aria-label={t("console.calendar.createNew")}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </OverlayRoot>
  );
}
