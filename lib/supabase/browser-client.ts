import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        /** 由应用层 enforce 10 分钟会话，避免 token 自动刷新延长登录态 */
        autoRefreshToken: false,
      },
    });
  }
  return client;
}
