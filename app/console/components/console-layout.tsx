"use client";

import { useState } from "react";
import type { ConsoleNavId, ConsoleUser, HouseholdOption } from "../types";
import { CalendarView } from "./calendar-view";
import { FamilyHomeView } from "./family-members";
import { HouseholdSwitcher } from "./household-switcher";
import { MeView } from "./me-view";
import { MobileTabBar } from "./mobile-tab-bar";
import { TodoView } from "./todo-view";

type ConsoleLayoutProps = {
  user: ConsoleUser;
  householdId: string;
  /** 当前用户的 household_memberships.id（任务权限与「与我相关」过滤用） */
  membershipId: string;
  membershipRole: string;
  profileId: string | null;
  householdOptions: HouseholdOption[];
  onSelectHousehold: (householdId: string) => void;
  currentUserId: string;
  onSessionLost: () => void;
  onSignOut: () => void | Promise<void>;
  children?: React.ReactNode;
};

export function ConsoleLayout({
  user,
  householdId,
  membershipId,
  membershipRole,
  profileId,
  householdOptions,
  onSelectHousehold,
  currentUserId,
  onSessionLost,
  onSignOut,
  children,
}: ConsoleLayoutProps) {
  const [active, setActive] = useState<ConsoleNavId>("calendar");

  return (
    <div className="console-shell font-sans">
      <div className="console-wallpaper" aria-hidden />
      <div className="relative z-10 mx-auto min-h-dvh w-full max-w-lg min-w-0">
        <main
          className="min-w-0 w-full pb-[calc(6.25rem+env(safe-area-inset-bottom))]"
          data-household-id={householdId ?? undefined}
          data-membership-id={membershipId}
        >
          {children ??
            (active === "family" ? (
              <FamilyHomeView
                key={householdId}
                householdId={householdId}
                currentUserId={currentUserId}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
                householdSwitcher={
                  <HouseholdSwitcher
                    options={householdOptions}
                    selectedHouseholdId={householdId}
                    onSelect={onSelectHousehold}
                    variant="inline"
                  />
                }
              />
            ) : active === "calendar" ? (
              <CalendarView
                key={householdId}
                householdId={householdId}
                membershipId={membershipId}
                membershipRole={membershipRole}
                profileId={profileId}
                currentUserId={currentUserId}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
                householdSwitcher={
                  <HouseholdSwitcher
                    options={householdOptions}
                    selectedHouseholdId={householdId}
                    onSelect={onSelectHousehold}
                    variant="inline"
                  />
                }
              />
            ) : active === "todo" ? (
              <TodoView
                key={householdId}
                householdId={householdId}
                membershipId={membershipId}
                membershipRole={membershipRole}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
                householdSwitcher={
                  <HouseholdSwitcher
                    options={householdOptions}
                    selectedHouseholdId={householdId}
                    onSelect={onSelectHousehold}
                    variant="inline"
                  />
                }
              />
            ) : (
              <MeView
                user={user}
                onSignOut={onSignOut}
                householdSwitcher={
                  <HouseholdSwitcher
                    options={householdOptions}
                    selectedHouseholdId={householdId}
                    onSelect={onSelectHousehold}
                    variant="inline"
                  />
                }
              />
            ))}
        </main>
      </div>

      <MobileTabBar active={active} onSelect={setActive} />
    </div>
  );
}
