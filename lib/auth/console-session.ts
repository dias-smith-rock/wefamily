/** Web 控制台登录态有效时长：10 分钟 */
export const CONSOLE_SESSION_TTL_MS = 10 * 60 * 1000;

export const CONSOLE_SESSION_EXPIRES_KEY = "wefamily_console_session_expires_at";

const EXPIRES_AT_KEY = CONSOLE_SESSION_EXPIRES_KEY;

export function renewConsoleSession(): void {
  if (typeof window === "undefined") return;
  const expiresAt = Date.now() + CONSOLE_SESSION_TTL_MS;
  sessionStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function clearConsoleSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EXPIRES_AT_KEY);
}

export function getConsoleSessionExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EXPIRES_AT_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isConsoleSessionExpired(): boolean {
  const expiresAt = getConsoleSessionExpiresAt();
  if (expiresAt == null) return true;
  return Date.now() >= expiresAt;
}

export function getConsoleSessionRemainingMs(): number {
  const expiresAt = getConsoleSessionExpiresAt();
  if (expiresAt == null) return 0;
  return Math.max(0, expiresAt - Date.now());
}
