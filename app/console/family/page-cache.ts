import type { FamilyPageData } from "./types";

export function serializeFamilyPageData(data: FamilyPageData): FamilyPageData {
  return data;
}

export function reviveFamilyPageData(raw: unknown): FamilyPageData | null {
  if (!raw || typeof raw !== "object") return null;
  const payload = raw as FamilyPageData;
  if (!payload.household?.id || !payload.self) return null;
  if (!Array.isArray(payload.others)) return null;
  return payload;
}
