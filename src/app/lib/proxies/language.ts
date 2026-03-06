import { NextRequest, NextResponse } from "next/server";

export default function proxyLanguage(
  req: NextRequest,
  pathname: string,
  isLanguageIncluded: boolean,
) {
  // If path already has a language => do nothing
  if (isLanguageIncluded) return;

  // Detect user's preferred language
  const acceptLanguage = req.headers.get("accept-language") || "";
  const language = acceptLanguage.includes("ja") ? "ja" : "en";

  console.log(isLanguageIncluded, language);
  // redirect to user's language page
  return NextResponse.redirect(new URL(`/${language}${pathname}`, req.url));
}
