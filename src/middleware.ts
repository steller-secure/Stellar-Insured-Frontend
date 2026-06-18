import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_KEY = 'stellar_insured_session';

const PUBLIC_ROUTES = ['/', '/about', '/signin', '/signup'];
const AUTH_ROUTES = ['/signin', '/signup'];

/** Validates Stellar public key format (must match G + 55 base32 chars) */
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

/** Validates all required session fields including address format */
function isValidSession(session: unknown): boolean {
  if (!session || typeof session !== 'object') return false;
  const s = session as Record<string, unknown>;

  // Required string fields
  if (typeof s.address !== 'string' || !isValidStellarAddress(s.address)) return false;
  if (typeof s.signedMessage !== 'string' || s.signedMessage.length === 0) return false;
  if (typeof s.signerAddress !== 'string' || !isValidStellarAddress(s.signerAddress)) return false;

  // Required numeric fields
  if (typeof s.authenticatedAt !== 'number') return false;
  if (typeof s.expiresAt !== 'number') return false;

  // Not expired
  if (s.expiresAt <= Date.now()) return false;

  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_KEY);
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      isAuthenticated = isValidSession(session);
    } catch (e) {
      console.error('Middleware: Error parsing session cookie', e);
    }
  }

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.');

  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    signInUrl.searchParams.set('message', 'Please sign in to access this page');
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
