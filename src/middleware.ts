import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "__session";
const AUTH_PAGES = ["/login", "/register", "/reset-password"];
const PROTECTED_PATHS = ["/dashboard", "/studies", "/upload", "/viewer", "/settings"];

function isCookieExpired(value: string | undefined): boolean {
  if (!value) return true;
  try {
    const payload = value.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = !isCookieExpired(sessionCookie);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/viewer/:path*",
    "/studies/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/reset-password",
  ],
};
