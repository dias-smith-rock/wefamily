"use client";

import { ChevronRight, Cloud, Eye, EyeOff, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { fetchFamilyPageData } from "../family/api";
import {
  reviveFamilyPageData,
  serializeFamilyPageData,
} from "../family/page-cache";
import type { FamilyMemberDisplay, FamilyModalState } from "../family/types";
import { maskPhone } from "../family/utils";
import { resolveAvatarUrl } from "@/lib/supabase/storage-url";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import { ConsoleTabHeader } from "./console-tab-header";
import { FamilyModals } from "./family/family-modals";
import { FamilyPageSkeleton } from "./family/family-skeleton";

function InsetCard({ children }: { children: React.ReactNode }) {
  return <div className="glass-panel overflow-hidden rounded-3xl">{children}</div>;
}

function Chevron() {
  return (
    <ChevronRight
      className="h-5 w-5 shrink-0 text-white/30"
      strokeWidth={2}
      aria-hidden
    />
  );
}

function ProfileTag() {
  const { t } = useDictionary();

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
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
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/20"
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
    "flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-white/5";

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
  householdSwitcher?: ReactNode;
};

export function FamilyHomeView({
  householdId,
  currentUserId,
  enabled,
  onSessionLost,
  onSignOut,
  householdSwitcher,
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
        <div className="glass-panel rounded-3xl p-6 text-center">
          <p className="text-[15px] font-medium text-white">
            {t("console.group.loadFailed")}
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

  const { household, self, others } = data;
  const selfPhoneMasked = maskPhone(self.phone);
  const householdDescription = household.description?.trim() ?? "";
  const householdAvatarUrl = resolveAvatarUrl(household.avatar_url);

  return (
    <>
      <div
        className={
          modal.kind !== "none" ? "overflow-hidden" : undefined
        }
      >
        <ConsoleTabHeader
          title={t("console.group.title")}
          onSignOut={onSignOut}
          leading={householdSwitcher}
        />

        <div className="space-y-4 px-4 pb-6 pt-4">
          <InsetCard>
            <ListRow
              onPress={() => setModal({ kind: "household" })}
              left={
                householdAvatarUrl ? (
                  <img
                    src={householdAvatarUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500">
                    <Users className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                  </div>
                )
              }
              middle={
                <>
                  <p className="text-[17px] font-semibold text-white">
                    {household.name}
                  </p>
                  {householdDescription ? (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-white/50">
                      {householdDescription}
                    </p>
                  ) : null}
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
                    <p className="text-[17px] font-semibold text-white">
                      {self.displayName}
                    </p>
                    {self.isCreator ? (
                      <span className="inline-flex shrink-0 rounded-full bg-[#0A84FF]/25 px-2.5 py-1 text-xs font-medium text-[#7CC4FF]">
                        {t("common.roles.creator")}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <p className="text-[13px] tabular-nums text-white/50">
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
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white/45 transition active:bg-white/10"
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

          <p className="px-1 pt-2 text-[13px] font-medium text-white/45">
            {t("console.group.membersSection")}
          </p>

          {others.length === 0 ? (
            <div className="glass-panel rounded-3xl px-4 py-8 text-center">
              <p className="text-sm text-white/45">{t("console.group.noOtherMembers")}</p>
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
                        <p className="truncate text-[17px] font-semibold text-white">
                          {member.displayName}
                        </p>
                        {member.isManagedProfile ? <ProfileTag /> : null}
                      </div>
                      {member.detailLine ? (
                        <p className="mt-0.5 text-[13px] tabular-nums text-white/50">
                          {member.detailLine}
                        </p>
                      ) : member.isManagedProfile ? null : (
                        <p className="mt-0.5 text-[13px] text-white/50">
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
