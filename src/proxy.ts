import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/student', '/teacher', '/parent', '/admin', '/super-admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await decrypt(sessionCookie);

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based authorization
    const role = session.role;
    
    // Determine the required role from the pathname
    const baseRoute = pathname.split('/')[1]; // e.g., 'student' from '/student/ai-tutor'
    
    // Super-admin can access anything
    if (role !== 'super-admin' && role !== baseRoute) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }



  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
