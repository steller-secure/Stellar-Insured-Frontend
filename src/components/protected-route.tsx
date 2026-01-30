"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check session validity (this is a client-side double check)
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (!session || !session.address || (now - session.authenticatedAt > twentyFourHours)) {
      const signInUrl = new URL('/signin', window.location.origin);
      signInUrl.searchParams.set('callbackUrl', pathname);
      if (!session) {
        signInUrl.searchParams.set('message', 'Please sign in to access this page');
      } else {
        signInUrl.searchParams.set('message', 'Your session has expired. Please sign in again.');
      }
      router.push(signInUrl.pathname + signInUrl.search);
    } else {
      setIsAuthorized(true);
    }
  }, [session, router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
