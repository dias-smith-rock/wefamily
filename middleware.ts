import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAppSubdomainHost, isConsolePath } from "@/lib/app-host";
import {
  getLocaleFromPathname,
  isLocale,
  localeCookieName,
  negotiateLocale,
  type Locale,
} from "@/lib/i18n/config";
import { localeHeaderName } from "@/lib/seo";

function resolveLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get(localeCookieName)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return negotiateLocale(req.headers.get("Accept-Language"));
}

function nextWithLocale(req: NextRequest, locale: string): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(localeHeaderName, locale);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const pathname = url.pathname;

  // SEO / 静态入口：绝不能被语言跳转到 /zh-CN/robots.txt 等
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/screenshots/") ||
    pathname.startsWith("/marketing/") ||
    pathname === "/icon.png" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // app 子域仅提供 Web 控制台：/ 或 /zh-CN 等落地页路径一律进 /console
  if (isAppSubdomainHost(hostname)) {
    if (isConsolePath(pathname)) {
      return nextWithLocale(req, resolveLocale(req));
    }

    url.pathname = "/console";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/console")) {
    return nextWithLocale(req, resolveLocale(req));
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

  const response = nextWithLocale(req, pathnameLocale);
  response.cookies.set(localeCookieName, pathnameLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|brand|screenshots|marketing|robots\\.txt|sitemap\\.xml).*)",
    "/",
  ],
};
