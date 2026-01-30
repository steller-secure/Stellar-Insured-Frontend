import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_KEY = 'stellar_insured_session';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/about', '/signin', '/signup'];

// Define routes that should redirect to home if the user is already authenticated
const AUTH_ROUTES = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session from cookies
  const sessionCookie = request.cookies.get(SESSION_KEY);
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      // Check if session has required fields and is not expired (24h)
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (session.address && session.authenticatedAt && (now - session.authenticatedAt < twentyFourHours)) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error('Middleware: Error parsing session cookie', e);
    }
  }

  // Handle protected routes
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/_next') || pathname.includes('.');
  
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    signInUrl.searchParams.set('message', 'Please sign in to access this page');
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes (prevent authenticated users from seeing signin/signup)
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
