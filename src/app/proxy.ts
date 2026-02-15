import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";
import { cookies } from "next/headers";

const protectedRoutes = [
  "/account",
  "/add",
  "/add-to",
  "/dictionary",
  "/folder",
  "/main",
];
const publicRoutes = ["/login", "/sign-up", "/"];

export default async function proxy(req: NextRequest) {
  //   check if current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.includes(path);
  const isPublic = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  //   redirect to /login if user is not authenticated
  if (isProtected && !session?.userId)
    return NextResponse.redirect(new URL("/login", req.nextUrl));

  //   redirect to /main if user is authenticated
  if (isPublic && session?.userId && !path.startsWith("/main"))
    return NextResponse.redirect(new URL("/main", req.nextUrl));

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
