"use client";

import { useState } from "react";
import type { ConsoleNavId, ConsoleUser, HouseholdOption } from "../types";
import {
  DEMO_HOUSEHOLD_NAME,
  useDemoMode,
} from "../lib/use-demo-mode";
import { CalendarView } from "./calendar-view";
import { HouseholdSwitcher } from "./household-switcher";
import { MobileTabBar } from "./mobile-tab-bar";
import { SettingsView } from "./settings-view";
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
  const demoMode = useDemoMode();
  const householdName = demoMode
    ? DEMO_HOUSEHOLD_NAME
    : householdOptions.find((o) => o.householdId === householdId)
        ?.householdName;
  const householdSwitcher = (
    <HouseholdSwitcher
      options={householdOptions}
      selectedHouseholdId={householdId}
      onSelect={onSelectHousehold}
      variant="inline"
      displayNameOverride={demoMode ? DEMO_HOUSEHOLD_NAME : undefined}
    />
  );

  return (
    <div className="console-shell font-sans">
      <div className="relative z-10 mx-auto min-h-dvh w-full max-w-lg min-w-0">
        <main
          className="min-w-0 w-full pb-[calc(6.25rem+env(safe-area-inset-bottom))]"
          data-household-id={householdId ?? undefined}
          data-membership-id={membershipId}
        >
          {children ??
            (active === "settings" ? (
              <SettingsView
                key={householdId}
                householdId={householdId}
                currentUserId={currentUserId}
                householdOptions={householdOptions}
                onSelectHousehold={onSelectHousehold}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
              />
            ) : active === "calendar" ? (
              <CalendarView
                key={householdId}
                householdId={householdId}
                householdName={householdName}
                membershipId={membershipId}
                membershipRole={membershipRole}
                profileId={profileId}
                currentUserId={currentUserId}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
                householdSwitcher={householdSwitcher}
              />
            ) : (
              <TodoView
                key={householdId}
                householdId={householdId}
                householdName={householdName}
                membershipId={membershipId}
                membershipRole={membershipRole}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
                householdSwitcher={householdSwitcher}
              />
            ))}
        </main>
      </div>

      <MobileTabBar active={active} onSelect={setActive} />
    </div>
  );
}
