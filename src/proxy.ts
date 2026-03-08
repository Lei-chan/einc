// next.js
import { NextRequest, NextResponse } from "next/server";
// methods
import proxyAuth from "./app/lib/proxies/auth";
import proxyLanguage from "./app/lib/proxies/language";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isLanguageIncluded =
    pathname.startsWith("/en") || pathname.startsWith("/ja");

  const languageRes = proxyLanguage(req, pathname, isLanguageIncluded);
  const authRes = proxyAuth(req, pathname, isLanguageIncluded);

  if (languageRes) return languageRes;
  if (authRes) return authRes;

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
