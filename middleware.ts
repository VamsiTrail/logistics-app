import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow access to login and register pages
    if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
      return NextResponse.next();
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except login and register
        if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
          return true; // Allow access to login and register pages
        }
        
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (registration page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};

