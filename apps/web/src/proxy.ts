import { NextRequest, NextResponse } from "next/server";
import { safeDestination } from "@/lib/auth-validation";
import { SESSION_COOKIE } from "@/types/auth";

export function proxy(request: NextRequest) {
  const dashboard =
    request.nextUrl.pathname === "/dashboard" ||
    request.nextUrl.pathname.startsWith("/dashboard/");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-bookly-return-to");
  if (dashboard) {
    const destination = safeDestination(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", destination);
      const response = NextResponse.redirect(url);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
    requestHeaders.set("x-bookly-return-to", destination);
  }
  // Cookie presence is only an optimization; the server pages validate with Nest.
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/login", "/register"] };
