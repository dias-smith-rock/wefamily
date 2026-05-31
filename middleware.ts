import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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

  const isAppSubdomain =
    hostname === "app.wefamily.ai" || hostname === "app.localhost:3000";

  if (isAppSubdomain) {
    if (pathname === "/console" || pathname.startsWith("/console/")) {
      return NextResponse.next();
    }

    url.pathname =
      pathname === "/" ? "/console" : `/console${pathname}`;
    return NextResponse.rewrite(url);
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};
