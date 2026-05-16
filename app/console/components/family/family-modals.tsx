"use client";

import { Cloud, UserPlus, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMemberTasks } from "../../family/api";
import type { FamilyMemberDisplay, FamilyPageData, TaskRow } from "../../family/types";
import { formatDateZh, formatPhoneDisplay } from "../../family/utils";
import {
  ActionSheetPanel,
  AlertPanel,
  OverlayRoot,
  SheetPanel,
} from "./ios-overlays";

type FamilyModalsProps = {
  modal: import("../../family/types").FamilyModalState;
  data: FamilyPageData;
  householdId: string;
  onClose: () => void;
  onOpenReadonlyHint: () => void;
};

function MemberAvatar({
  member,
  size = "lg",
}: {
  member: FamilyMemberDisplay;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-base";
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-black/5`}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizeClass} ${member.avatarClass}`}
      aria-hidden
    >
      {member.initials}
    </div>
  );
}

function ProfileTag() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
      <Cloud className="h-3 w-3" strokeWidth={2} aria-hidden />
      档案
    </span>
  );
}

export function HouseholdAlertModal({
  data,
  open,
  onClose,
}: {
  data: FamilyPageData;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <OverlayRoot open={open} onClose={onClose} variant="alert">
      <AlertPanel>
        <div className="px-4 pb-3 pt-5 text-center">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {data.household.name}
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-gray-500">
            创建于 {formatDateZh(data.household.created_at)}
          </p>
          <p className="mt-1 text-[13px] text-gray-500">
            当前共 {data.memberCount} 位成员
          </p>
        </div>
        <div className="border-t border-gray-200/80 bg-gray-50/80 px-4 py-3">
          <p className="text-center text-[12px] leading-relaxed text-gray-400">
            如需修改家庭名称或解散家庭，请前往 WeFamily iOS 客户端。
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full border-t border-gray-200/80 py-3.5 text-[17px] font-semibold text-blue-600 active:bg-gray-50"
        >
          好
        </button>
      </AlertPanel>
    </OverlayRoot>
  );
}

export function SelfProfileSheet({
  member,
  open,
  onClose,
}: {
  member: FamilyMemberDisplay;
  open: boolean;
  onClose: () => void;
}) {
  const phone = formatPhoneDisplay(member.phone);
  const email = member.email;

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <SheetPanel>
        <div className="px-6 pb-10 pt-2 text-center">
          <div className="flex justify-center">
            <MemberAvatar member={member} size="lg" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {member.displayName}
          </h2>
          {member.isCreator ? (
            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
              创建者
            </span>
          ) : (
            <p className="mt-2 text-sm text-gray-500">{member.roleLabel}</p>
          )}
          <div className="mt-8 space-y-3 rounded-2xl bg-white p-4 text-left shadow-sm">
            {phone ? (
              <div>
                <p className="text-xs text-gray-400">手机号</p>
                <p className="mt-0.5 text-[15px] font-medium tabular-nums text-gray-900">
                  {phone}
                </p>
              </div>
            ) : null}
            {email ? (
              <div>
                <p className="text-xs text-gray-400">邮箱</p>
                <p className="mt-0.5 break-all text-[15px] font-medium text-gray-900">
                  {email}
                </p>
              </div>
            ) : null}
            {!phone && !email ? (
              <p className="text-sm text-gray-400">暂无联系方式</p>
            ) : null}
          </div>
        </div>
      </SheetPanel>
    </OverlayRoot>
  );
}

export function MemberDetailSheet({
  member,
  householdId,
  open,
  onClose,
}: {
  member: FamilyMemberDisplay;
  householdId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setTasksLoading(true);
    setTasksError(null);

    void fetchMemberTasks(householdId, member).then(({ tasks: t, error }) => {
      if (cancelled) return;
      setTasks(t);
      setTasksError(error);
      setTasksLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, householdId, member]);

  return (
    <OverlayRoot open={open} onClose={onClose} variant="sheet">
      <SheetPanel>
        <div className="px-5 pb-10 pt-1">
          <div className="flex items-start gap-4">
            <MemberAvatar member={member} />
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {member.displayName}
                </h2>
                {member.isManagedProfile ? <ProfileTag /> : null}
              </div>
              <p className="mt-1 text-[13px] text-gray-400">{member.roleLabel}</p>
              {member.detailLine ? (
                <p className="mt-0.5 text-[13px] text-gray-400">{member.detailLine}</p>
              ) : null}
            </div>
          </div>

          {member.isManagedProfile ? (
            <p className="mt-4 rounded-xl bg-gray-100/80 px-3 py-2.5 text-[12px] leading-relaxed text-gray-500">
              此档案由家庭管理员共同维护。
            </p>
          ) : null}

          <div className="mt-6">
            <h3 className="text-[13px] font-semibold text-gray-500">
              当前待办事项
            </h3>
            {tasksLoading ? (
              <div className="mt-3 space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-2xl bg-gray-200/70"
                  />
                ))}
              </div>
            ) : tasksError ? (
              <p className="mt-3 text-sm text-red-500">{tasksError}</p>
            ) : tasks.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">暂无未完成任务</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                  >
                    <p className="font-medium text-gray-900">{task.title}</p>
                    {task.due_date ? (
                      <p className="mt-0.5 text-xs text-gray-400">
                        截止 {formatDateZh(task.due_date)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetPanel>
    </OverlayRoot>
  );
}

export function FamilyActionSheet({
  open,
  onClose,
  onSelectOption,
}: {
  open: boolean;
  onClose: () => void;
  onSelectOption: () => void;
}) {
  return (
    <OverlayRoot open={open} onClose={onClose} variant="action-sheet">
      <ActionSheetPanel>
        <button
          type="button"
          onClick={onSelectOption}
          className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3.5 text-left text-[17px] text-gray-900 active:bg-gray-50"
        >
          <UserPlus className="h-5 w-5 text-blue-600" strokeWidth={2} />
          邀请新成员
        </button>
        <button
          type="button"
          onClick={onSelectOption}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[17px] text-gray-900 active:bg-gray-50"
        >
          <UserRound className="h-5 w-5 text-violet-600" strokeWidth={2} />
          创建免下载档案
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-white/95 py-3.5 text-[17px] font-semibold text-blue-600 backdrop-blur-xl active:bg-gray-50"
        >
          取消
        </button>
      </ActionSheetPanel>
    </OverlayRoot>
  );
}

export function ReadonlyHintAlert({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <OverlayRoot open={open} onClose={onClose} variant="alert">
      <AlertPanel>
        <div className="px-4 pb-3 pt-5 text-center">
          <h2 className="text-[17px] font-semibold text-gray-900">
            多端安全限制
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-gray-500">
            请使用 WeFamily iOS App 扫描二维码或发送快捷邀请链接。
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full border-t border-gray-200/80 py-3.5 text-[17px] font-semibold text-blue-600 active:bg-gray-50"
        >
          知道了
        </button>
      </AlertPanel>
    </OverlayRoot>
  );
}

export function FamilyModals({
  modal,
  data,
  householdId,
  onClose,
  onOpenReadonlyHint,
}: FamilyModalsProps) {
  return (
    <>
      <HouseholdAlertModal
        data={data}
        open={modal.kind === "household"}
        onClose={onClose}
      />
      <SelfProfileSheet
        member={data.self}
        open={modal.kind === "self"}
        onClose={onClose}
      />
      {modal.kind === "member" ? (
        <MemberDetailSheet
          member={modal.member}
          householdId={householdId}
          open
          onClose={onClose}
        />
      ) : null}
      <FamilyActionSheet
        open={modal.kind === "action-sheet"}
        onClose={onClose}
        onSelectOption={onOpenReadonlyHint}
      />
      <ReadonlyHintAlert
        open={modal.kind === "readonly-hint"}
        onClose={onClose}
      />
    </>
  );
}
