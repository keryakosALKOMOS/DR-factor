import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isAdmin = token?.role === "admin";

    // Bypass Next.js internal / static / API routes
    if (
      path.startsWith("/_next") ||
      path.startsWith("/api") ||
      path.startsWith("/favicon.ico") ||
      path.includes(".") 
    ) {
      return null;
    }

    // 1. Admin Page Protection
    if (path.startsWith("/admin")) {
      // If not logged in at all, redirect to login
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // If logged in but NOT an admin, redirect to home
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Admin is allowed here
      return null;
    }

    // 2. Prevent Admin from accessing regular pages
    if (isAdmin) {
      // If the admin accesses ANY route that is NOT /admin (e.g., /, /products, /checkout)
      // Redirect them straight into the admin dashboard
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Normal users and guests can access all other pages seamlessly
    return null;
  },
  {
    callbacks: {
      // We return true here so the proxy function above runs for EVERY request
      // and we handle the specific redirection logic ourselves.
      authorized: () => true,
    },
  }
);

export const config = {
  // Capture all routes except Next.js specific static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
