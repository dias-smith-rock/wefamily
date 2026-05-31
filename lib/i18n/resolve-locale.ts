import { cookies, headers } from "next/headers";
import {
  isLocale,
  localeCookieName,
  negotiateLocale,
  type Locale,
} from "./config";

export { resolveClientLocale } from "./client-locale";

export async function resolveServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return negotiateLocale(headerStore.get("Accept-Language"));
}
