import type { SupabaseClient, User } from "@supabase/supabase-js";
import { requireAuthenticatedSession } from "./require-session";

export type ConsoleAuthResult =
  | { ok: true; user: User }
  | { ok: false; reason: "no_client" | "no_user" | "expired" | "error"; message?: string };

/**
 * 控制台鉴权：优先 getSession，并校验 10 分钟会话窗口。
 */
export async function verifyConsoleAuth(
  supabase: SupabaseClient,
): Promise<ConsoleAuthResult> {
  const guard = await requireAuthenticatedSession(supabase);

  if (!guard.ok) {
    if (guard.reason === "no_session") {
      return { ok: false, reason: "no_user" };
    }
    if (guard.reason === "expired") {
      return {
        ok: false,
        reason: "expired",
        message: guard.message ?? "登录已过期，请重新登录",
      };
    }
    return { ok: false, reason: "no_client" };
  }

  return { ok: true, user: guard.user };
}

export { onConsoleLoginSuccess, endConsoleSession } from "./session-lifecycle";
