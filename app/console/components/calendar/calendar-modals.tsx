"use client";

import { CalendarPlus, ListPlus, Sparkles } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type {
  CalendarModalState,
  CreateTaskMode,
} from "../../calendar/types";
import { TaskCreateSheet } from "./task-create-sheet";
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
  onSelectCreate: (mode: CreateTaskMode) => void;
}) {
  const { t } = useDictionary();

  return (
    <OverlayRoot open={open} onClose={onClose} variant="action-sheet">
      <ActionSheetPanel>
        <button
          type="button"
          onClick={() => onSelectCreate("flexible")}
          className="flex w-full items-center gap-3 border-b border-white/[0.08] px-4 py-3.5 text-left text-[17px] text-white active:bg-white/5"
        >
          <ListPlus className="h-5 w-5 text-[#0A84FF]" strokeWidth={2} />
          {t("console.calendar.newTask")}
        </button>
        <button
          type="button"
          onClick={() => onSelectCreate("scheduled")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[17px] text-white active:bg-white/5"
        >
          <CalendarPlus className="h-5 w-5 text-[#BF5AF2]" strokeWidth={2} />
          {t("console.calendar.newEvent")}
        </button>
      </ActionSheetPanel>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-[18px] border border-white/10 bg-[#2C2C2E]/95 py-3.5 text-[17px] font-semibold text-[#0A84FF] backdrop-blur-xl active:bg-white/5"
      >
        {t("common.cancel")}
      </button>
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
        <div className="px-5 pb-4 pt-5 text-center">
          <h2 className="text-[17px] font-semibold text-white">
            {t("console.calendar.readonlyTitle")}
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-white/55">
            {t("console.calendar.readonlyBody")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full border-t border-white/[0.08] py-3.5 text-[17px] font-semibold text-[#0A84FF] active:bg-white/5"
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0A84FF] text-white shadow-ios-fab">
            <Sparkles className="h-8 w-8" strokeWidth={2} fill="currentColor" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">
            {t("console.calendar.aiTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/55">
            {t("console.calendar.aiBody")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 w-full rounded-full bg-white/10 py-3.5 text-[15px] font-semibold text-white active:bg-white/15"
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
  householdId,
  membershipId,
  membershipRole,
  householdName,
  defaultDate,
  onClose,
  onSelectCreate,
  onOpenReadonlyAlert,
  onCreated,
  onSessionLost,
}: {
  modal: CalendarModalState;
  householdId: string;
  membershipId: string;
  membershipRole: string;
  householdName?: string | null;
  defaultDate: Date;
  onClose: () => void;
  onSelectCreate: (mode: CreateTaskMode) => void;
  onOpenReadonlyAlert: () => void;
  onCreated: () => void;
  onSessionLost?: () => void;
}) {
  return (
    <>
      {modal.kind === "task" ? (
        <TaskDetailSheet
          event={modal.event}
          householdId={householdId}
          membershipId={membershipId}
          membershipRole={membershipRole}
          householdName={householdName}
          open
          onClose={onClose}
          onSaved={onCreated}
          onSessionLost={onSessionLost}
          onReadonlyAction={onOpenReadonlyAlert}
        />
      ) : null}
      <CalendarActionSheet
        open={modal.kind === "action-sheet"}
        onClose={onClose}
        onSelectCreate={onSelectCreate}
      />
      <ReadonlyModeAlert open={modal.kind === "readonly-alert"} onClose={onClose} />
      <AiAssistantSheet open={modal.kind === "ai-sheet"} onClose={onClose} />
      {modal.kind === "create" ? (
        <TaskCreateSheet
          open
          mode={modal.mode}
          householdId={householdId}
          householdName={householdName}
          membershipId={membershipId}
          defaultDate={defaultDate}
          onClose={onClose}
          onCreated={onCreated}
          onSessionLost={onSessionLost}
        />
      ) : null}
    </>
  );
}
