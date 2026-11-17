"use client";

import { ChevronRight, Luggage, ShoppingCart, List } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { HouseholdListRow, ListKind } from "../../lists/types";

function kindIcon(kind: ListKind) {
  switch (kind) {
    case "shopping":
      return ShoppingCart;
    case "trip":
      return Luggage;
    default:
      return List;
  }
}

function kindLabel(
  kind: ListKind,
  t: (key: string) => string,
): string {
  if (kind === "shopping") return t("console.todo.kindShopping");
  if (kind === "trip") return t("console.todo.kindTrip");
  return t("console.todo.kindCustom");
}

export function PlannerListsView({
  lists,
  householdName,
  onOpenList,
  onCreateList,
}: {
  lists: HouseholdListRow[];
  householdName?: string | null;
  onOpenList: (list: HouseholdListRow) => void;
  onCreateList?: () => void;
}) {
  const { t } = useDictionary();

  if (lists.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[17px] font-semibold text-white">
          {t("console.todo.listsEmpty")}
        </p>
        <p className="mt-2 text-sm text-white/45">
          {t("console.todo.listsEmptyHint")}
        </p>
        {onCreateList ? (
          <button
            type="button"
            onClick={onCreateList}
            className="mt-5 rounded-full bg-[#0A84FF] px-5 py-2.5 text-[14px] font-semibold text-white active:opacity-90"
          >
            {t("console.todo.createList")}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="px-4 pb-32 pt-2">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="h-2 w-2 rounded-full bg-[#30D158]" aria-hidden />
        <p className="text-[13px] font-semibold text-white/70">
          {householdName?.trim() || t("console.nav.group")}
        </p>
      </div>

      <div className="glass-panel overflow-hidden rounded-[20px]">
        {lists.map((list, index) => {
          const Icon = kindIcon(list.kind);
          return (
            <div key={list.id}>
              {index > 0 ? (
                <div className="mx-4 h-px bg-white/[0.08]" />
              ) : null}
              <button
                type="button"
                onClick={() => onOpenList(list)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#30D158]/20 text-[#30D158]">
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold text-white">
                    {list.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/45">
                    {kindLabel(list.kind, t)}
                  </p>
                </div>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-white/30"
                  strokeWidth={2}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
