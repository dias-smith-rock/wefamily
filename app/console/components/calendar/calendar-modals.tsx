"use client";

import { CalendarPlus, ListPlus, Sparkles } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { CalendarModalState } from "../../calendar/types";
import { TaskDetailSheet } from "./task-detail-sheet";
import {
  ActionSheetPanel,
  AlertPanel,
  OverlayRoot,
  SheetPanel,
} from "../family/ios-overlays";

export function CalendarActionSheet({
  open,
  onClose,
  onSelectCreate,
}: {
  open: boolean;
  onClose: () => void;
  onSelectCreate: () => void;
}) {
  const { t } = useDictionary();

  return (
    <OverlayRoot open={open} onClose={onClose} variant="action-sheet">
      <ActionSheetPanel>
        <button
          type="button"
          onClick={onSelectCreate}
          className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-left text-[17px] text-gray-900 active:bg-gray-50"
        >
          <ListPlus className="h-5 w-5 text-blue-600" strokeWidth={2} />
          {t("console.calendar.newTask")}
        </button>
        <button
          type="button"
          onClick={onSelectCreate}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[17px] text-gray-900 active:bg-gray-50"
        >
          <CalendarPlus className="h-5 w-5 text-violet-600" strokeWidth={2} />
          {t("console.calendar.newEvent")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-white/95 py-3.5 text-[17px] font-semibold text-blue-600 backdrop-blur-xl active:bg-gray-50"
        >
          {t("common.cancel")}
        </button>
      </ActionSheetPanel>
    </OverlayRoot>
  );
}

export function ReadonlyModeAlert({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useDictionary();

  return (
    <OverlayRoot open={open} onClose={onClose} variant="alert">
      <AlertPanel>
        <div className="px-4 pb-3 pt-5 text-center">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {t("console.calendar.readonlyTitle")}
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-gray-500">
            {t("console.calendar.readonlyBody")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full border-t border-gray-200/80 py-3.5 text-[17px] font-semibold text-blue-600 active:bg-gray-50"
        >
          {t("common.gotIt")}
        </button>
      </AlertPanel>
    </OverlayRoot>
  );
}

export function AiAssistantSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useDictionary();

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <SheetPanel>
        <div className="px-6 pb-12 pt-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg">
            <Sparkles className="h-8 w-8" strokeWidth={2} fill="currentColor" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-900">
            {t("console.calendar.aiTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-gray-500">
            {t("console.calendar.aiBody")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 w-full rounded-full bg-gray-200/80 py-3.5 text-[15px] font-semibold text-gray-600 active:bg-gray-300/80"
          >
            {t("common.close")}
          </button>
        </div>
      </SheetPanel>
    </OverlayRoot>
  );
}

export function CalendarModals({
  modal,
  onClose,
  onOpenReadonlyAlert,
}: {
  modal: CalendarModalState;
  onClose: () => void;
  onOpenReadonlyAlert: () => void;
}) {
  return (
    <>
      {modal.kind === "task" ? (
        <TaskDetailSheet event={modal.event} open onClose={onClose} />
      ) : null}
      <CalendarActionSheet
        open={modal.kind === "action-sheet"}
        onClose={onClose}
        onSelectCreate={onOpenReadonlyAlert}
      />
      <ReadonlyModeAlert open={modal.kind === "readonly-alert"} onClose={onClose} />
      <AiAssistantSheet open={modal.kind === "ai-sheet"} onClose={onClose} />
    </>
  );
}
