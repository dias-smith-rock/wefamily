/** localStorage 缓存键（Stale-While-Revalidate） */
export const LOCAL_CACHE_KEYS = {
  tasks: "wefamily_tasks_cache",
  members: "wefamily_members_cache",
} as const;

type CacheEnvelope<T> = {
  v: 1;
  householdId: string;
  savedAt: string;
  data: T;
};

export function readLocalCache<T>(
  key: string,
  householdId: string,
  revive: (payload: unknown) => T | null,
): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<unknown>;
    if (envelope.v !== 1 || envelope.householdId !== householdId) {
      return null;
    }
    return revive(envelope.data);
  } catch (error) {
    console.warn("[wefamily-cache] read failed:", key, error);
    return null;
  }
}

export function writeLocalCache<T>(
  key: string,
  householdId: string,
  data: T,
  serialize: (data: T) => unknown,
): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: CacheEnvelope<unknown> = {
      v: 1,
      householdId,
      savedAt: new Date().toISOString(),
      data: serialize(data),
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (error) {
    console.warn("[wefamily-cache] write failed:", key, error);
  }
}

export function clearAllLocalCaches(): void {
  if (typeof window === "undefined") return;
  localStorage.clear();
}
