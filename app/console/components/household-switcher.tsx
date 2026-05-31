import type { HouseholdOption } from "../types";

type HouseholdSwitcherProps = {
  options: HouseholdOption[];
  selectedHouseholdId: string;
  onSelect: (householdId: string) => void;
};

export function HouseholdSwitcher({
  options,
  selectedHouseholdId,
  onSelect,
}: HouseholdSwitcherProps) {
  const selected =
    options.find((o) => o.householdId === selectedHouseholdId) ?? options[0];

  if (!selected) return null;

  const canSwitch = options.length > 1;

  if (!canSwitch) {
    return (
      <div className="sticky top-0 z-50 border-b border-gray-200/90 bg-[#F2F2F7]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-2 text-sm font-medium text-gray-700">
          <span aria-hidden>🏠</span>
          <span className="truncate">{selected.householdName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 border-b border-gray-200/90 bg-[#F2F2F7]/95 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto max-w-lg">
        <label htmlFor="household-switcher" className="sr-only">
          切换家庭
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm"
            aria-hidden
          >
            🏠
          </span>
          <select
            id="household-switcher"
            value={selectedHouseholdId}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200/90 bg-white py-2.5 pe-10 ps-9 text-sm font-medium text-gray-900 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          >
            {options.map((option) => (
              <option key={option.householdId} value={option.householdId}>
                {option.householdName}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
