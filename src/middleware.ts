import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Unified Authentication Middleware
 * 
 * Validates session cookies and enforces route protection.
 * Works in tandem with the unified AuthProvider on the client side.
 */

const SESSION_KEY = 'stellar_insured_session';

// Public routes accessible without authentication
const PUBLIC_ROUTES = ['/', '/about', '/signin', '/signup'];

// Auth routes (redirect to dashboard if already authenticated)
const AUTH_ROUTES = ['/signin', '/signup'];

/** Validates Stellar public key format (G + 55 base32 chars) */
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

/** Validates all required session fields including address format and expiry */
function isValidSession(session: unknown): boolean {
  if (!session || typeof session !== 'object') return false;
  
  const s = session as Record<string, unknown>;

  // Required string fields with format validation
  if (typeof s.address !== 'string' || !isValidStellarAddress(s.address)) {
    return false;
  }
  if (typeof s.signedMessage !== 'string' || s.signedMessage.length === 0) {
    return false;
  }
  if (typeof s.signerAddress !== 'string' || !isValidStellarAddress(s.signerAddress)) {
    return false;
  }

  // Required numeric timestamp fields
  if (typeof s.authenticatedAt !== 'number' || s.authenticatedAt <= 0) {
    return false;
  }
  if (typeof s.expiresAt !== 'number' || s.expiresAt <= 0) {
    return false;
  }

  // Check expiration
  if (s.expiresAt <= Date.now()) {
    return false;
  }

  return true;
}

/** Parse and validate session from cookie */
function getSessionFromCookie(request: NextRequest): boolean {
  try {
    const sessionCookie = request.cookies.get(SESSION_KEY);
    if (!sessionCookie?.value) {
      return false;
    }

    const decoded = decodeURIComponent(sessionCookie.value);
    const session = JSON.parse(decoded);
    
    return isValidSession(session);
  } catch (error) {
    // Invalid JSON or malformed cookie
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return withRealtimeHeaders(NextResponse.next());
  }

  const isAuthenticated = getSessionFromCookie(request);
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route);
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return withRealtimeHeaders(NextResponse.next());
  }

  // Require authentication for protected routes
  if (!isAuthenticated) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to protected route
  return withRealtimeHeaders(NextResponse.next());
}

function withRealtimeHeaders(response: NextResponse) {
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_BLOCKCHAIN_WS_URL,
    process.env.NEXT_PUBLIC_BLOCKCHAIN_EVENTS_URL,
    process.env.NEXT_PUBLIC_BLOCKCHAIN_POLL_URL,
  ].flatMap(value => {
    if (!value) return [];
    try { return [new URL(value).origin]; } catch { return []; }
  });
  response.headers.set(
    'Content-Security-Policy',
    `connect-src 'self' https://horizon-testnet.stellar.org https://soroban-testnet.stellar.org ${configuredOrigins.join(' ')}`.trim(),
  );
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
