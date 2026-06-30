import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Admin routes require ADMIN role
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - /login
     * - /api/auth/* (NextAuth)
     * - /_next/* (static assets)
     * - /logos, /images, /favicon.ico (public files)
     */
    "/((?!login|api/auth|_next/static|_next/image|logos|images|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
