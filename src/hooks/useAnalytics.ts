import { useCallback } from "react";
import { analytics, EventCategory } from "@/lib/analytics";
import { useAuth } from "@/components/auth-provider-enhanced";

export function useAnalytics() {
    let session = null;
    try {
        const auth = useAuth();
        session = auth.session;
    } catch (e) {
        // Fallback for tests or contexts where AuthProvider is not wrapping the component
    }
    const userId = session?.address;

    const trackAction = useCallback(
        (category: EventCategory, name: string, data?: Record<string, any>) => {
            analytics.trackAction(category, name, data, userId);
        },
        [userId]
    );

    const trackPageView = useCallback(
        (path: string) => {
            analytics.trackPageView(path, userId);
        },
        [userId]
    );

    const trackError = useCallback(
        (error: Error | string, context?: Record<string, any>) => {
            analytics.trackError(error, context, userId);
        },
        [userId]
    );

    return {
        trackAction,
        trackPageView,
        trackError,
    };
}
