/**
 * 与 iOS `GuestMemberDisplayName` / `FamilyProfile.isNewMemberPlaceholder` 对齐：
 * 「新成员」等占位名在 UI 中展示为基于 profileId 的稳定八位数字。
 */

const NEW_MEMBER_PLACEHOLDERS = new Set([
  "new member",
  "新成员",
  "新成員",
  "new_member",
]);

export function isPersistedGuestNumericIdentifier(raw: string): boolean {
  const trimmed = raw.trim();
  return /^[0-9]{6}$|^[0-9]{8}$/.test(trimmed);
}

export function isNewMemberPlaceholder(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  return (
    NEW_MEMBER_PLACEHOLDERS.has(trimmed.toLowerCase()) ||
    NEW_MEMBER_PLACEHOLDERS.has(trimmed)
  );
}

/**
 * 由 profile UUID 推导稳定八位标签（0–99999999）。
 * 与 iOS `stableEightDigitLabel` 一致：取 UUID 前 8 字节，UInt64 溢出乘法累加后取模。
 */
export function stableEightDigitLabel(profileId: string): string {
  const hex = profileId.replace(/-/g, "").toLowerCase();
  const mask = BigInt("0xFFFFFFFFFFFFFFFF");
  const mod = BigInt(100000000);
  let value = BigInt(0);
  for (let i = 0; i < Math.min(hex.length, 16); i += 2) {
    const byte = BigInt(parseInt(hex.slice(i, i + 2), 16) || 0);
    value = (value * BigInt(131) + byte) & mask;
  }
  return (value % mod).toString().padStart(8, "0");
}

/**
 * 占位名 / 空名 → 八位数字；已是六/八位编号则原样返回；其余自定义名原样返回。
 */
export function resolveGuestDisplayName(
  stored: string | null | undefined,
  profileId: string | null | undefined,
): string {
  const trimmed = (stored ?? "").trim();
  if (!trimmed || isNewMemberPlaceholder(trimmed)) {
    if (profileId) return stableEightDigitLabel(profileId);
    return trimmed || "00000000";
  }
  if (isPersistedGuestNumericIdentifier(trimmed)) {
    return trimmed;
  }
  return trimmed;
}
