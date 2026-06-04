import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = (token.role as string)?.toLowerCase() || '';

    // Route Protection based on Role
    if (pathname.startsWith("/super-admin") && role !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    if (pathname.startsWith("/admin") && role !== "schooladmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/teacher") && role !== "teacher") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/parent") && role !== "parent") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*"
  ],
};
