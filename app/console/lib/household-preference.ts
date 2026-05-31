const KEY_PREFIX = "wefamily_selected_household";

export function getSelectedHouseholdId(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${KEY_PREFIX}:${userId}`);
  } catch {
    return null;
  }
}

export function setSelectedHouseholdId(
  userId: string,
  householdId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${KEY_PREFIX}:${userId}`, householdId);
  } catch {
    // ignore quota errors
  }
}

export function pickInitialHouseholdId(
  userId: string,
  householdIds: string[],
): string | null {
  if (householdIds.length === 0) return null;
  const saved = getSelectedHouseholdId(userId);
  if (saved && householdIds.includes(saved)) return saved;
  return householdIds[0] ?? null;
}
