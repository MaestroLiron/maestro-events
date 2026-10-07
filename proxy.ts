import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get(
    "maestroAdminSession"
  )?.value;

  // ==========================================
  // המשתמש כבר מחובר ונכנס לדף ההתחברות
  // ==========================================

  if (pathname === "/admin" && session) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", request.url)
    );
  }

  // ==========================================
  // המשתמש לא מחובר ומנסה להיכנס לאזור הניהול
  // ==========================================

  if (
    pathname.startsWith("/admin/") &&
    !session
  ) {
    return NextResponse.redirect(
      new URL("/admin", request.url)
    );
  }

  return NextResponse.next();
}

// ==========================================
// על אילו כתובות ה-Proxy עובד
// ==========================================

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
  ],
};