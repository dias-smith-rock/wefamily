"use client";

import { ChevronRight, Cloud, Eye, EyeOff, Users } from "lucide-react";
import { useState } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { fetchFamilyPageData } from "../family/api";
import {
  reviveFamilyPageData,
  serializeFamilyPageData,
} from "../family/page-cache";
import type { FamilyMemberDisplay, FamilyModalState } from "../family/types";
import { maskPhone } from "../family/utils";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import { ConsoleTabHeader } from "./console-tab-header";
import { FamilyModals } from "./family/family-modals";
import { FamilyPageSkeleton } from "./family/family-skeleton";

const CARD_SHADOW = "shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

function InsetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={`rounded-3xl bg-white ${CARD_SHADOW}`}>{children}</div>
  );
}

function Chevron() {
  return (
    <ChevronRight
      className="h-5 w-5 shrink-0 text-gray-300"
      strokeWidth={2}
      aria-hidden
    />
  );
}

function ProfileTag() {
  const { t } = useDictionary();

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
      <Cloud className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
      {t("common.profile")}
    </span>
  );
}

function MemberAvatarBubble({ member }: { member: FamilyMemberDisplay }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-black/5"
      />
    );
  }
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${member.avatarClass}`}
      aria-hidden
    >
      {member.initials}
    </div>
  );
}

function ListRow({
  left,
  middle,
  onPress,
}: {
  left: React.ReactNode;
  middle: React.ReactNode;
  onPress?: () => void;
}) {
  const className =
    "flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-gray-50/80";

  if (onPress) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onPress}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPress();
          }
        }}
        className={`${className} cursor-pointer`}
      >
        {left}
        <div className="min-w-0 flex-1">{middle}</div>
        <Chevron />
      </div>
    );
  }

  return (
    <div className={className}>
      {left}
      <div className="min-w-0 flex-1">{middle}</div>
      <Chevron />
    </div>
  );
}

type FamilyHomeViewProps = {
  householdId: string;
  currentUserId: string;
  /** 仅在为 true 时拉取数据（父级已确认登录） */
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
};

export function FamilyHomeView({
  householdId,
  currentUserId,
  enabled,
  onSessionLost,
  onSignOut,
}: FamilyHomeViewProps) {
  const { t } = useDictionary();
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [modal, setModal] = useState<FamilyModalState>({ kind: "none" });

  const { data, loading, error, revalidate: load } = useCachedSupabase({
    cacheKey: LOCAL_CACHE_KEYS.members,
    householdId,
    enabled,
    fetchData: () => fetchFamilyPageData(householdId, currentUserId),
    revive: reviveFamilyPageData,
    serialize: serializeFamilyPageData,
    onSessionLost,
  });

  const closeModal = () => setModal({ kind: "none" });

  if (loading) {
    return <FamilyPageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="px-4 pt-8">
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-[15px] font-medium text-gray-900">
            {t("console.group.loadFailed")}
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

  const { household, self, others } = data;
  const selfPhoneMasked = maskPhone(self.phone);

  return (
    <>
      <div
        className={
          modal.kind !== "none" ? "overflow-hidden" : undefined
        }
      >
        <ConsoleTabHeader title={t("console.group.title")} onSignOut={onSignOut} />

        <div className="space-y-4 px-4 pb-6 pt-4">
          <InsetCard>
            <ListRow
              onPress={() => setModal({ kind: "household" })}
              left={
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <Users className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
              }
              middle={
                <>
                  <p className="text-[17px] font-semibold text-gray-900">
                    {household.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-gray-400">
                    {t("console.group.groupProfile")}
                  </p>
                </>
              }
            />
          </InsetCard>

          <InsetCard>
            <ListRow
              onPress={() => setModal({ kind: "self" })}
              left={<MemberAvatarBubble member={self} />}
              middle={
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[17px] font-semibold text-gray-900">
                      {self.displayName}
                    </p>
                    {self.isCreator ? (
                      <span className="inline-flex shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                        {t("common.roles.creator")}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <p className="text-[13px] tabular-nums text-gray-400">
                      {phoneVisible && self.phone
                        ? self.phone
                        : selfPhoneMasked ?? self.email ?? "—"}
                    </p>
                    {selfPhoneMasked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhoneVisible((v) => !v);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition active:bg-gray-100"
                        aria-label={
                          phoneVisible
                            ? t("console.group.hidePhone")
                            : t("console.group.showPhone")
                        }
                      >
                        {phoneVisible ? (
                          <EyeOff className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                          <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                      </button>
                    ) : null}
                  </div>
                </>
              }
            />
          </InsetCard>

          <p className="px-1 pt-2 text-[13px] font-medium text-gray-400">
            {t("console.group.membersSection")}
          </p>

          {others.length === 0 ? (
            <div className="rounded-3xl bg-white px-4 py-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="text-sm text-gray-400">{t("console.group.noOtherMembers")}</p>
            </div>
          ) : (
            others.map((member) => (
              <InsetCard key={member.membershipId}>
                <ListRow
                  onPress={() => setModal({ kind: "member", member })}
                  left={<MemberAvatarBubble member={member} />}
                  middle={
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[17px] font-semibold text-gray-900">
                          {member.displayName}
                        </p>
                        {member.isManagedProfile ? <ProfileTag /> : null}
                      </div>
                      {member.detailLine ? (
                        <p className="mt-0.5 text-[13px] tabular-nums text-gray-400">
                          {member.detailLine}
                        </p>
                      ) : member.isManagedProfile ? null : (
                        <p className="mt-0.5 text-[13px] text-gray-400">
                          {member.subtitle}
                        </p>
                      )}
                    </>
                  }
                />
              </InsetCard>
            ))
          )}
        </div>
      </div>

      <FamilyModals
        modal={modal}
        data={data}
        householdId={householdId}
        onClose={closeModal}
        onOpenReadonlyHint={() => setModal({ kind: "readonly-hint" })}
      />
    </>
  );
}

/** @deprecated */
export const FamilyMembers = FamilyHomeView;
