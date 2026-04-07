import { NextRequest, NextResponse } from "next/server";

export default function proxyLanguage(req: NextRequest, pathname: string) {
  // Detect user's preferred language
  const acceptLanguage = req.headers.get("accept-language") || "";
  const language = acceptLanguage.includes("ja") ? "ja" : "en";

  // redirect to user's language page
  return NextResponse.redirect(
    new URL(`/${language}${pathname === "/" ? "" : pathname}`, req.url),
  );
}
