import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Cheap edge gate: if the request targets a protected panel and there is no
 * Better Auth session cookie at all, redirect to /login. The actual role
 * checks (super-admin / company / manager) are done in each layout's
 * server component using the real session.
 *
 * This avoids hitting the DB on every request just to bounce unauthenticated
 * users — Better Auth recommends this exact pattern.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super-admin/:path*",
    "/company/:path*",
    "/manager/:path*",
    "/onboarding",
  ],
};
