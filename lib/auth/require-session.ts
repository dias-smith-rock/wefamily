import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  clearConsoleSession,
  isConsoleSessionExpired,
  renewConsoleSession,
  CONSOLE_SESSION_EXPIRES_KEY,
  CONSOLE_SESSION_TTL_MS,
  getConsoleSessionExpiresAt,
} from "./console-session";

export type SessionGuardResult =
  | { ok: true; session: Session; user: User }
  | {
      ok: false;
      reason: "no_client" | "no_session" | "expired";
      message?: string;
    };

function bootstrapSessionWindow(user: User): boolean {
  if (getConsoleSessionExpiresAt() != null) {
    return !isConsoleSessionExpired();
  }

  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      renewConsoleSession();
      return true;
    }
  }

  const lastSignIn = user.last_sign_in_at;
  if (lastSignIn) {
    const signInMs = new Date(lastSignIn).getTime();
    const sessionEnd = signInMs + CONSOLE_SESSION_TTL_MS;
    if (Date.now() < sessionEnd) {
      sessionStorage.setItem(CONSOLE_SESSION_EXPIRES_KEY, String(sessionEnd));
      return true;
    }
  }

  return false;
}

/**
 * 数据请求前必须调用：先 getSession，无 session 则立即终止。
 */
export async function requireAuthenticatedSession(
  supabase: SupabaseClient,
): Promise<SessionGuardResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    clearConsoleSession();
    return { ok: false, reason: "no_session" };
  }

  if (!bootstrapSessionWindow(session.user) || isConsoleSessionExpired()) {
    await supabase.auth.signOut();
    clearConsoleSession();
    return {
      ok: false,
      reason: "expired",
      message: "登录已过期，请重新登录",
    };
  }

  return { ok: true, session, user: session.user };
}
