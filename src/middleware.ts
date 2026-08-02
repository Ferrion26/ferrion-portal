import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Site-wide soft-launch gate: while SITE_ACCESS_RESTRICTED is not explicitly
// set to "false", the entire site requires a login — used to keep the site
// reachable on the internet without being public yet. /dashboard and /admin
// (the actual customer/admin area) always require a session regardless of
// this flag; it only controls whether the public marketing pages also do.
const SITE_RESTRICTED = process.env.SITE_ACCESS_RESTRICTED !== "false";

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
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Customer/admin area always requires a session.
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
          return !!token;
        }
        // Everything else only requires a session while the site-wide gate is on.
        if (!SITE_RESTRICTED) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Runs on all routes except:
     * - /login
     * - /api/auth/* (NextAuth)
     * - /_next/* (static assets)
     * - /logos, /images, /favicon.ico (public files)
     * The authorized() callback above decides per-request whether a
     * session is actually required.
     */
    "/((?!login|api/auth|_next/static|_next/image|logos|images|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
