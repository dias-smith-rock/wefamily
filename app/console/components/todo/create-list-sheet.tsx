"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, List, Luggage, ShoppingCart } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { createHouseholdList } from "../../lists/api";
import type { HouseholdListRow, ListKind } from "../../lists/types";
import { OverlayRoot } from "../family/ios-overlays";

const KIND_OPTIONS: {
  kind: ListKind;
  icon: typeof ShoppingCart;
  labelKey: string;
}[] = [
  {
    kind: "shopping",
    icon: ShoppingCart,
    labelKey: "console.todo.kindShopping",
  },
  { kind: "trip", icon: Luggage, labelKey: "console.todo.kindTrip" },
  { kind: "custom", icon: List, labelKey: "console.todo.kindCustom" },
];

export function CreateListSheet({
  open,
  householdId,
  householdName,
  membershipId,
  onClose,
  onCreated,
  onSessionLost,
}: {
  open: boolean;
  householdId: string;
  householdName?: string | null;
  membershipId: string;
  onClose: () => void;
  onCreated: (list: HouseholdListRow) => void;
  onSessionLost?: () => void;
}) {
  const { t } = useDictionary();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ListKind>("shopping");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setKind("shopping");
    setSubmitting(false);
    setError(null);
  }, [open]);

  const canSubmit = title.trim().length > 0 && !submitting;
  const spaceName = householdName?.trim() || t("console.nav.group");

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const result = await createHouseholdList({
      householdId,
      creatorId: membershipId,
      title,
      kind,
    });

    setSubmitting(false);

    if (!result.ok) {
      if (result.reason === "expired" || result.reason === "no_session") {
        onSessionLost?.();
      }
      setError(translateApiMessage(t, result.message));
      return;
    }

    onCreated(result.data);
    onClose();
  };

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <div className="flex max-h-[min(78dvh,640px)] w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#1C1C1E]/96 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-9 rounded-full bg-white/20" aria-hidden />
        </div>

        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2">
          <button
            type="button"
            onClick={onClose}
            className="justify-self-start text-[17px] text-[#0A84FF] active:opacity-70"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="inline-flex max-w-[11rem] items-center justify-center gap-0.5 truncate text-[17px] font-semibold text-white"
            aria-label={spaceName}
          >
            <span className="truncate">{spaceName}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-[#0A84FF]"
              strokeWidth={2.5}
            />
          </button>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={!canSubmit}
            className="justify-self-end text-[17px] font-semibold text-[#0A84FF] transition enabled:active:opacity-70 disabled:text-white/30"
          >
            {t("console.todo.createList")}
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
          <label className="mb-2 block text-[13px] font-medium text-white/45">
            {t("console.todo.listName")}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("console.todo.listNamePlaceholder")}
            className="w-full rounded-[16px] bg-[#2C2C2E] px-4 py-3.5 text-[17px] text-white outline-none placeholder:text-white/30"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
              }
            }}
          />

          {error ? (
            <p className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </p>
          ) : null}

          <p className="mb-2 mt-6 text-[13px] font-medium text-white/45">
            {t("console.todo.listType")}
          </p>
          <section className="overflow-hidden rounded-[16px] bg-[#2C2C2E]">
            {KIND_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const selected = kind === option.kind;
              return (
                <div key={option.kind}>
                  {index > 0 ? (
                    <div className="mx-4 h-px bg-white/[0.08]" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setKind(option.kind)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/5"
                  >
                    <Icon
                      className="h-5 w-5 shrink-0 text-[#0A84FF]"
                      strokeWidth={2}
                    />
                    <span className="min-w-0 flex-1 text-[17px] text-white">
                      {t(option.labelKey)}
                    </span>
                    {selected ? (
                      <Check
                        className="h-5 w-5 shrink-0 text-[#0A84FF]"
                        strokeWidth={2.75}
                      />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </OverlayRoot>
  );
}
