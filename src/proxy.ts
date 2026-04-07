// next.js
import { NextRequest, NextResponse } from "next/server";
// methods
import proxyAuth from "./app/lib/proxies/auth";
import proxyLanguage from "./app/lib/proxies/language";

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isLanguageIncluded =
    pathname.startsWith("/en") || pathname.startsWith("/ja");

  if (!isLanguageIncluded) {
    const languageRes = proxyLanguage(req, pathname);
    if (languageRes) return languageRes;
  }

  // Run only language is included in pathname to avoid infinite loop
  if (isLanguageIncluded) {
    const authRes = proxyAuth(req, pathname);
    if (authRes) return authRes;
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|apple-icons.png|icon.png|manifest.ts|manifest.json|robots.ts|robots.txt|serwist.ts|sitemap.ts|serwist.xml|sw.ts|sw.js|serwist|.*\\..*).*)",
  ],
};
