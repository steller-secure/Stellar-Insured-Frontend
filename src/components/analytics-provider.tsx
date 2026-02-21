"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { trackPageView, trackError, trackAction } = useAnalytics();

    // Track page views and time on page
    const pageStartTime = useRef<number>(Date.now());
    const lastPathname = useRef<string | null>(null);

    useEffect(() => {
        // If we changed paths, record the time spent on the previous page
        if (lastPathname.current && lastPathname.current !== pathname) {
            const timeSpent = Date.now() - pageStartTime.current;
            trackAction("NAVIGATION", "time_on_page", {
                path: lastPathname.current,
                durationMs: timeSpent,
            });
        }

        // Set up tracking for the new path
        if (pathname) {
            trackPageView(pathname);
            pageStartTime.current = Date.now();
            lastPathname.current = pathname;
        }
    }, [pathname, searchParams, trackPageView, trackAction]);

    // Global error catching
    useEffect(() => {
        const handleWindowError = (event: ErrorEvent) => {
            trackError(event.error || event.message, {
                source: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            trackError(event.reason || "Unhandled Promise Rejection", {
                type: "unhandledrejection",
            });
        };

        window.addEventListener("error", handleWindowError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        return () => {
            window.removeEventListener("error", handleWindowError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);

            // On unmount, track final time on page for the last path
            if (lastPathname.current) {
                const timeSpent = Date.now() - pageStartTime.current;
                trackAction("NAVIGATION", "time_on_page", {
                    path: lastPathname.current,
                    durationMs: timeSpent,
                });
            }
        };
    }, [trackError, trackAction]);

    return <>{children}</>;
}
