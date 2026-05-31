"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearConsoleSession,
  getConsoleSessionRemainingMs,
  isConsoleSessionExpired,
} from "@/lib/auth/console-session";
import { requireAuthenticatedSession } from "@/lib/auth/require-session";
import {
  endConsoleSession,
  onConsoleLoginSuccess,
} from "@/lib/auth/session-lifecycle";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { clearAllLocalCaches } from "../lib/local-cache";

export type ConsoleAuthState =
  | { status: "loading" }
  | { status: "config_error" }
  | { status: "unauthenticated"; messageKey?: string }
  | { status: "authenticated"; user: User; session: Session };

const SESSION_CHECK_INTERVAL_MS = 30_000;

export function useConsoleAuth() {
  const [auth, setAuth] = useState<ConsoleAuthState>({ status: "loading" });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authErrorKey, setAuthErrorKey] = useState<string | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expireSession = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await endConsoleSession(supabase);
    } else {
      clearConsoleSession();
    }
    setAuth({
      status: "unauthenticated",
      messageKey: "sessionExpired",
    });
  }, []);

  const scheduleExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (isConsoleSessionExpired()) {
      void expireSession();
      return;
    }
    const remaining = getConsoleSessionRemainingMs();
    if (remaining <= 0) {
      void expireSession();
      return;
    }
    expiryTimerRef.current = setTimeout(() => {
      void expireSession();
    }, remaining);
  }, [expireSession]);

  const resolveAuth = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuth({ status: "config_error" });
      return;
    }

    const guard = await requireAuthenticatedSession(supabase);

    if (!guard.ok) {
      if (guard.reason === "expired") {
        setAuth({ status: "unauthenticated", messageKey: "sessionExpired" });
      } else {
        setAuth({ status: "unauthenticated" });
      }
      return;
    }

    setAuth({
      status: "authenticated",
      user: guard.user,
      session: guard.session,
    });
    scheduleExpiryTimer();
  }, [scheduleExpiryTimer]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuth({ status: "config_error" });
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      setAuth({ status: "loading" });
      await resolveAuth();
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_OUT") {
        clearConsoleSession();
        setAuth({ status: "unauthenticated" });
        setIsAuthenticating(false);
        return;
      }

      if (event === "SIGNED_IN") {
        onConsoleLoginSuccess();
        if (session?.user) {
          setAuth({ status: "authenticated", user: session.user, session });
          scheduleExpiryTimer();
        } else {
          await resolveAuth();
        }
        setIsAuthenticating(false);
        return;
      }

      if (event === "USER_UPDATED" && session?.user) {
        setAuth({ status: "authenticated", user: session.user, session });
      }
    });

    const interval = setInterval(() => {
      if (isConsoleSessionExpired()) {
        void expireSession();
      }
    }, SESSION_CHECK_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void resolveAuth();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, [resolveAuth, expireSession, scheduleExpiryTimer]);

  const signInWithOAuth = useCallback(
    async (provider: "apple" | "google") => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || isAuthenticating) return;
      setAuthErrorKey(null);
      setIsAuthenticating(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/console`,
          },
        });
        if (error) throw error;
      } catch (e) {
        console.error(e);
        setAuthErrorKey("loginFailed");
        setIsAuthenticating(false);
      }
    },
    [isAuthenticating],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setAuth({ status: "loading" });
    clearAllLocalCaches();
    await endConsoleSession(supabase);
    setAuth({ status: "unauthenticated" });
  }, []);

  return {
    auth,
    isAuthenticating,
    authErrorKey,
    signInWithOAuth,
    signOut,
    refreshAuth: resolveAuth,
  };
}
