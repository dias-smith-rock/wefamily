"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { readLocalCache, writeLocalCache } from "../lib/local-cache";

export type CachedFetchResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired" | "error";
      message: string;
    };

type UseCachedSupabaseOptions<T> = {
  cacheKey: string;
  householdId: string;
  enabled: boolean;
  fetchData: () => Promise<CachedFetchResult<T>>;
  revive: (raw: unknown) => T | null;
  serialize: (data: T) => unknown;
  onSessionLost: () => void;
  /** enabled=false 时是否清空内存态（Tab 未激活） */
  clearWhenDisabled?: boolean;
};

/**
 * Stale-While-Revalidate：优先 localStorage 首屏，后台静默刷新 Supabase。
 */
export function useCachedSupabase<T>({
  cacheKey,
  householdId,
  enabled,
  fetchData,
  revive,
  serialize,
  onSessionLost,
  clearWhenDisabled = true,
}: UseCachedSupabaseOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGenRef = useRef(0);
  const hasDataRef = useRef(false);
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  const applyCached = useCallback(
    (household: string) => {
      const cached = readLocalCache(cacheKey, household, revive);
      if (cached != null) {
        setData(cached);
        hasDataRef.current = true;
        setLoading(false);
        return true;
      }
      hasDataRef.current = false;
      return false;
    },
    [cacheKey, revive],
  );

  const revalidate = useCallback(async () => {
    const gen = ++loadGenRef.current;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      if (gen !== loadGenRef.current) return;
      if (!hasDataRef.current) {
        setError("missingConfig");
        setData(null);
      }
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      if (gen !== loadGenRef.current) return;
      if (!hasDataRef.current) {
        setData(null);
        setError(null);
      }
      setLoading(false);
      onSessionLost();
      return;
    }

    if (gen !== loadGenRef.current) return;

    if (!hasDataRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await fetchDataRef.current();
      if (gen !== loadGenRef.current) return;

      if (!result.ok) {
        if (result.reason === "no_session" || result.reason === "expired") {
          if (!hasDataRef.current) {
            setData(null);
            setError(null);
          }
          setLoading(false);
          onSessionLost();
          return;
        }

        console.error(`[wefamily-cache] revalidate failed (${cacheKey}):`, result.message);
        if (!hasDataRef.current) {
          setError(result.message);
          setData(null);
        }
        setLoading(false);
        return;
      }

      writeLocalCache(cacheKey, householdId, result.data, serialize);
      setData(result.data);
      hasDataRef.current = true;
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error(`[wefamily-cache] revalidate error (${cacheKey}):`, err);
      if (!hasDataRef.current) {
        setError("networkError");
      }
      setLoading(false);
    }
  }, [cacheKey, householdId, onSessionLost, serialize]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      if (clearWhenDisabled) {
        setData(null);
        hasDataRef.current = false;
      }
      return;
    }

    const hasCache = applyCached(householdId);
    if (!hasCache) {
      setData(null);
      setLoading(true);
      setError(null);
    }

    void revalidate();
  }, [enabled, householdId, applyCached, revalidate, clearWhenDisabled]);

  return { data, loading, error, revalidate, setData };
}
