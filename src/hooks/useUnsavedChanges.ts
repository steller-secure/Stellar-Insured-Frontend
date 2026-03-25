'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook that warns users about unsaved changes when navigating away.
 * Handles both browser-level navigation (tab close, URL change) and
 * provides a check function for in-app navigation guards.
 *
 * @param hasUnsavedChanges - Whether the form currently has unsaved changes
 * @param message - Custom warning message (used by the confirm check; browsers show their own for beforeunload)
 */
export function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
) {
  const hasChangesRef = useRef(hasUnsavedChanges);
  hasChangesRef.current = hasUnsavedChanges;

  // Browser beforeunload — covers tab close, URL bar navigation, refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasChangesRef.current) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /**
   * Call before in-app navigation (e.g., router.push).
   * Returns true if it's safe to navigate, false if the user cancelled.
   */
  const confirmNavigation = useCallback((): boolean => {
    if (!hasChangesRef.current) return true;
    return window.confirm(message);
  }, [message]);

  return { confirmNavigation };
}
