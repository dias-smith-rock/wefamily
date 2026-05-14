import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  const isAppSubdomain =
    hostname === "app.wefamily.ai" || hostname === "app.localhost:3000";

  if (isAppSubdomain) {
    // 避免 /console 被重复拼接为 /console/console
    if (url.pathname === "/console" || url.pathname.startsWith("/console/")) {
      return NextResponse.next();
    }

    url.pathname =
      url.pathname === "/" ? "/console" : `/console${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};
