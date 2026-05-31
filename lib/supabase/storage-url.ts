/** 与 iOS `SupabasePublicStorageURL` 对齐：DB 存相对路径或完整 URL */
export function resolvePublicStorageUrl(
  storedValue: string | null | undefined,
  bucket: string,
): string | null {
  const raw = storedValue?.trim();
  if (!raw) return null;

  if (raw.includes("://")) return raw;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) return null;

  const path = raw
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function resolveAvatarUrl(
  storedValue: string | null | undefined,
): string | null {
  return resolvePublicStorageUrl(storedValue, "avatars");
}
