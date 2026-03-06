import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "../session";
import { getLanguageFromPathname } from "../helper";

export default async function proxyAuth(
  req: NextRequest,
  pathname: string,
  isLanguageIncluded: boolean,
) {
  const languagePath = `/${getLanguageFromPathname(pathname)}`;
  const additionalPath = isLanguageIncluded ? languagePath : "";
  const protectedRoutes = [
    "/account",
    "/add",
    "/add-to",
    "/dictionary",
    "/folder",
    "/main",
  ];
  const publicRoutes = ["/login", "/sign-up", "/"];

  //   remove language from pathname
  const pathnameWithoutLanguage = pathname.replace(languagePath, "");

  //   check if current route is protected or public
  const isProtected = protectedRoutes.includes(pathnameWithoutLanguage);
  const isPublic = publicRoutes.includes(pathnameWithoutLanguage);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  //   redirect to /login if user is not authenticated
  if (isProtected && !session?.userId)
    return NextResponse.redirect(
      new URL(`${additionalPath}/login`, req.nextUrl),
    );

  //   redirect to [language]/main if user is authenticated
  if (
    isPublic &&
    session?.userId &&
    !pathnameWithoutLanguage.startsWith("/main")
  )
    return NextResponse.redirect(
      new URL(`${additionalPath}/main`, req.nextUrl),
    );
}
