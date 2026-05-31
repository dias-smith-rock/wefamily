import {
  defaultLocale,
  isLocale,
  localeCookieName,
  negotiateLocale,
  type Locale,
} from "./config";

export function resolveClientLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;

  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${localeCookieName}=`));

  const value = match?.split("=")[1];
  if (value && isLocale(value)) return value;

  return negotiateLocale(
    typeof navigator !== "undefined" ? navigator.language : null,
  );
}
