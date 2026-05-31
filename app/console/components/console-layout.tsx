"use client";

import { useState } from "react";
import type { ConsoleNavId, ConsoleUser, HouseholdOption } from "../types";
import { CalendarView } from "./calendar-view";
import { FamilyHomeView } from "./family-members";
import { HouseholdSwitcher } from "./household-switcher";
import { MeView } from "./me-view";
import { MobileTabBar } from "./mobile-tab-bar";

type ConsoleLayoutProps = {
  user: ConsoleUser;
  householdId: string;
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
  householdOptions,
  onSelectHousehold,
  currentUserId,
  onSessionLost,
  onSignOut,
  children,
}: ConsoleLayoutProps) {
  const [active, setActive] = useState<ConsoleNavId>("calendar");

  return (
    <div className="min-h-dvh bg-[#F2F2F7] font-sans text-gray-900">
      <div className="mx-auto min-h-dvh w-full max-w-lg min-w-0">
        <HouseholdSwitcher
          options={householdOptions}
          selectedHouseholdId={householdId}
          onSelect={onSelectHousehold}
        />
        <main
          className="min-w-0 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
          data-household-id={householdId ?? undefined}
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
              />
            ) : active === "calendar" ? (
              <CalendarView
                key={householdId}
                householdId={householdId}
                enabled
                onSessionLost={onSessionLost}
                onSignOut={onSignOut}
              />
            ) : (
              <MeView user={user} onSignOut={onSignOut} />
            ))}
        </main>
      </div>

      <MobileTabBar active={active} onSelect={setActive} />
    </div>
  );
}
