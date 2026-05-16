import type { SupabaseClient } from "@supabase/supabase-js";
import { clearConsoleSession, renewConsoleSession } from "./console-session";

export function onConsoleLoginSuccess(): void {
  renewConsoleSession();
}

export async function endConsoleSession(supabase: SupabaseClient): Promise<void> {
  clearConsoleSession();
  await supabase.auth.signOut();
}
