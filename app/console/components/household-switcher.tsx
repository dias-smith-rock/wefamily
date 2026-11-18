"use client";

import { ChevronDown } from "lucide-react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { HouseholdOption } from "../types";

type HouseholdSwitcherProps = {
  options: HouseholdOption[];
  selectedHouseholdId: string;
  onSelect: (householdId: string) => void;
  /** inline：嵌入顶栏；bar：独立顶条（兼容旧用法） */
  variant?: "inline" | "bar";
  /** 宣传截图时覆盖显示名（不改真实 household） */
  displayNameOverride?: string;
};

const DOT_COLORS = [
  "bg-[#BF5AF2]",
  "bg-[#0A84FF]",
  "bg-[#30D158]",
  "bg-[#FF9F0A]",
  "bg-[#FF375F]",
] as const;

function dotClassForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % DOT_COLORS.length;
  return DOT_COLORS[hash]!;
}

export function HouseholdSwitcher({
  options,
  selectedHouseholdId,
  onSelect,
  variant = "bar",
  displayNameOverride,
}: HouseholdSwitcherProps) {
  const { t } = useDictionary();
  const selected =
    options.find((o) => o.householdId === selectedHouseholdId) ?? options[0];

  if (!selected) return null;

  const displayName = displayNameOverride ?? selected.householdName;
  const canSwitch = options.length > 1;
  const pill = (
    <div className="relative min-w-0 max-w-[11.5rem]">
      <label htmlFor="household-switcher" className="sr-only">
        {t("console.nav.switchGroup")}
      </label>
      <span
        className={`pointer-events-none absolute start-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${dotClassForId(selected.householdId)}`}
        aria-hidden
      />
      {canSwitch ? (
        <>
          <select
            id="household-switcher"
            value={selectedHouseholdId}
            onChange={(e) => onSelect(e.target.value)}
            className="glass-pill w-full appearance-none truncate rounded-full py-2 pe-8 ps-7 text-[13px] font-semibold text-white outline-none"
          >
            {options.map((option) => (
              <option
                key={option.householdId}
                value={option.householdId}
                className="bg-[#1c2438] text-white"
              >
                {option.householdId === selectedHouseholdId && displayNameOverride
                  ? displayNameOverride
                  : option.householdName}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/70"
            strokeWidth={2.5}
            aria-hidden
          />
        </>
      ) : (
        <div className="glass-pill flex items-center truncate rounded-full py-2 pe-3 ps-7 text-[13px] font-semibold text-white">
          <span className="truncate">{displayName}</span>
        </div>
      )}
    </div>
  );

  if (variant === "inline") return pill;

  return (
    <div className="sticky top-0 z-50 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-lg justify-start">{pill}</div>
    </div>
  );
}
