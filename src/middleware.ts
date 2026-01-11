import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import auth from "next-auth/middleware";

export default function middleware(request: NextRequest) {
  // Bypass authentication in test mode
  if (process.env.BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  // Use NextAuth middleware for authentication
  return auth(request as any);
}

// Protect all routes except login and API auth routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
