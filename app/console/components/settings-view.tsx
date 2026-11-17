"use client";

import {
  ArrowUpDown,
  ChevronRight,
  Crown,
  LogOut,
  Plus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ConsoleLanguageSwitcher } from "@/components/console-language-switcher";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { translateApiMessage } from "@/lib/i18n/translate-api-error";
import { resolveAvatarUrl } from "@/lib/supabase/storage-url";
import { fetchFamilyPageData } from "../family/api";
import {
  reviveFamilyPageData,
  serializeFamilyPageData,
} from "../family/page-cache";
import type { FamilyMemberDisplay, FamilyModalState } from "../family/types";
import { useCachedSupabase } from "../hooks/use-cached-supabase";
import { LOCAL_CACHE_KEYS } from "../lib/local-cache";
import type { HouseholdOption } from "../types";
import { FamilyModals } from "./family/family-modals";
import { FamilyPageSkeleton } from "./family/family-skeleton";

function SectionLabel({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 px-1">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/40">
        {children}
      </p>
      {trailing}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.07]">
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-4 h-px bg-white/[0.08]" />;
}

function MemberAvatar({ member }: { member: FamilyMemberDisplay }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-white/15"
      />
    );
  }
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white ${member.avatarClass}`}
      aria-hidden
    >
      {member.initials}
    </div>
  );
}

type SettingsViewProps = {
  householdId: string;
  currentUserId: string;
  householdOptions: HouseholdOption[];
  onSelectHousehold: (householdId: string) => void;
  enabled: boolean;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
};

export function SettingsView({
  householdId,
  currentUserId,
  householdOptions,
  onSelectHousehold,
  enabled,
  onSessionLost,
  onSignOut,
}: SettingsViewProps) {
  const { t } = useDictionary();
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

  const canSwitchHousehold = householdOptions.length > 1;
  const selectedHousehold = useMemo(
    () =>
      householdOptions.find((o) => o.householdId === householdId) ??
      householdOptions[0],
    [householdOptions, householdId],
  );

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

  const { household, self, others, memberCount } = data;
  const householdAvatarUrl = resolveAvatarUrl(household.avatar_url);
  const allMembers = [self, ...others];

  return (
    <>
      <div className="px-4 pb-8 pt-[max(0.55rem,env(safe-area-inset-top))]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-[34px] font-bold tracking-tight text-white">
            {t("console.settings.title")}
          </h1>
          <div className="flex items-center gap-2">
            <ConsoleLanguageSwitcher />
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/85 transition active:bg-white/15"
              aria-label={t("common.signOut")}
            >
              <LogOut className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Upgrade */}
        <button
          type="button"
          onClick={() => setModal({ kind: "readonly-hint" })}
          className="mb-5 flex w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.07] px-4 py-3.5 text-left active:bg-white/10"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFD60A]/15 text-[#FFD60A]">
            <Crown className="h-5 w-5" strokeWidth={2} fill="currentColor" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-white">
              {t("console.settings.upgradeTitle")}
            </p>
            <p className="mt-0.5 text-[13px] text-white/45">
              {t("console.settings.upgradeSubtitle")}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/30" strokeWidth={2} />
        </button>

        {/* Current group */}
        <SectionLabel>{t("console.settings.currentGroup")}</SectionLabel>
        <Card>
          <div className="relative flex w-full items-center gap-3 px-4 py-3.5">
            {householdAvatarUrl ? (
              <img
                src={householdAvatarUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-[12px] object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#30D158]/20 text-[#30D158]">
                <Users className="h-5 w-5" strokeWidth={2.25} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold text-white">
                {household.name}
              </p>
              <p className="mt-0.5 text-[13px] text-white/45">
                {t("console.settings.memberCount", { count: memberCount })}
              </p>
            </div>
            <span className="text-[18px] leading-none text-white/45" aria-hidden>
              ⇅
            </span>
            {canSwitchHousehold ? (
              <select
                value={householdId}
                onChange={(e) => onSelectHousehold(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={t("console.nav.switchGroup")}
              >
                {householdOptions.map((option) => (
                  <option key={option.householdId} value={option.householdId}>
                    {option.householdName}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={() => setModal({ kind: "household" })}
                className="absolute inset-0"
                aria-label={t("console.group.groupProfile")}
              />
            )}
          </div>

          <Divider />

          <button
            type="button"
            onClick={() => setModal({ kind: "self" })}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/5"
          >
            <MemberAvatar member={self} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-[16px] font-semibold text-white">
                  {self.email?.trim() || self.displayName}
                </p>
                {self.isCreator ? (
                  <span className="rounded-full bg-[#0A84FF]/25 px-2 py-0.5 text-[11px] font-semibold text-[#7CC4FF]">
                    {t("common.roles.creator")}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[13px] text-white/45">
                {self.detailLine ||
                  self.phone ||
                  selectedHousehold?.membership.id.slice(-4).padStart(8, "•") ||
                  "—"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/30" strokeWidth={2} />
          </button>
        </Card>

        {/* Group members */}
        <div className="mt-5">
          <SectionLabel
            trailing={
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModal({ kind: "readonly-hint" })}
                  className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0A84FF]/20 text-[#0A84FF]"
                  aria-label={t("console.settings.sortMembers")}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ kind: "action-sheet" })}
                  className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0A84FF]/20 text-[#0A84FF]"
                  aria-label={t("console.group.inviteMember")}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            }
          >
            {t("console.settings.groupMembers")}
          </SectionLabel>

          <Card>
            {allMembers.map((member, index) => {
              const isSelf = member.membershipId === self.membershipId;
              return (
                <div key={member.membershipId}>
                  {index > 0 ? <Divider /> : null}
                  <button
                    type="button"
                    onClick={() =>
                      setModal(
                        isSelf
                          ? { kind: "self" }
                          : { kind: "member", member },
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/5"
                  >
                    <MemberAvatar member={member} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-semibold text-white">
                        {isSelf
                          ? t("console.settings.myself")
                          : member.displayName}
                      </p>
                      {!isSelf ? (
                        <p className="mt-0.5 text-[13px] text-white/45">
                          {member.detailLine ||
                            member.subtitle ||
                            t("console.group.noContact")}
                        </p>
                      ) : null}
                    </div>
                    <ChevronRight
                      className="h-5 w-5 shrink-0 text-white/30"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Link account / hint */}
        <div className="mt-5">
          <Card>
            <div className="px-4 py-4">
              <p className="text-[16px] font-semibold text-white">
                {t("console.settings.linkAccountTitle")}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                {t("console.settings.linkAccountBody")}
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-white/35">
                {t("console.me.settingsHint")}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <FamilyModals
        modal={modal}
        data={data}
        householdId={householdId}
        onClose={() => setModal({ kind: "none" })}
        onOpenReadonlyHint={() => setModal({ kind: "readonly-hint" })}
      />
    </>
  );
}
