import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAppSubdomainHost, isConsolePath } from "@/lib/app-host";
import {
  getLocaleFromPathname,
  isLocale,
  localeCookieName,
  negotiateLocale,
} from "@/lib/i18n/config";

function resolveLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get(localeCookieName)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return negotiateLocale(req.headers.get("Accept-Language"));
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const pathname = url.pathname;

  // public/ 静态资源（如 /brand/*）不应加 locale 前缀
  if (
    pathname.startsWith("/brand/") ||
    pathname === "/icon.png" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // app 子域仅提供 Web 控制台：/ 或 /zh-CN 等落地页路径一律进 /console
  if (isAppSubdomainHost(hostname)) {
    if (isConsolePath(pathname)) {
      return NextResponse.next();
    }

    url.pathname = "/console";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/console")) {
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPathname(pathname);

  if (!pathnameLocale) {
    const locale = resolveLocale(req);
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set(localeCookieName, pathnameLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|brand).*)",
    "/",
  ],
};
