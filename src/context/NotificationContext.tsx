"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import type { AppError } from "@/lib/errorHandler";
import { blockchainEvents, type BlockchainEvent } from "@/lib/blockchainEvents";
import { useWalletStore } from "@/store";

type NotificationType = "success" | "error" | "warning" | "info";

type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType, severity?: ErrorSeverity) => void;
  addError: (error: AppError) => void;
  /**
   * The most recent announcement text for the polite aria-live region.
   * Useful for screen readers to announce non-toast status messages
   * (e.g. claim status updates, voting results) without navigating to them.
   */
  liveAnnouncement: string;
  /** Announce a message via the polite live region (WCAG 4.1.3 Status Messages) */
  announce: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showToast } = useToast();
  const address = useWalletStore((state) => state.session?.address);
  // Holds the latest polite live-region message; reset after a short delay
  // so the same message can be re-announced if needed.
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  useEffect(() => {
    if (address) blockchainEvents.start(address);
    else blockchainEvents.stop();
    return () => blockchainEvents.stop();
  }, [address]);

  useEffect(() => blockchainEvents.subscribe((event: BlockchainEvent) => {
    const messages: Partial<Record<BlockchainEvent['type'], string>> = {
      'policy.purchased': 'Your policy purchase was confirmed on-chain.',
      'policy.updated': 'One of your policies was updated on-chain.',
      'claim.submitted': 'Your claim submission was confirmed on-chain.',
      'claim.updated': 'The status of one of your claims changed.',
      'proposal.updated': 'A governance proposal status changed.',
      'vote.cast': 'New voting results are available.',
    };
    const message = messages[event.type];
    if (message) {
      showToast(message, event.type.endsWith('purchased') || event.type.endsWith('submitted') ? 'success' : 'info');
      setLiveAnnouncement(message);
    }
  }), [showToast]);
  /**
   * Push a message into the polite aria-live region so screen readers
   * announce it without interrupting ongoing speech.
   * WCAG 4.1.3 – Status Messages
   */
  const announce = useCallback((message: string) => {
    // Briefly clear then set the text so repeated identical messages still fire
    setLiveAnnouncement("");
    requestAnimationFrame(() => setLiveAnnouncement(message));
  }, []);

  const addNotification = useCallback(
    (message: string, type: NotificationType = "info", _severity?: ErrorSeverity) => {
      showToast(message, type);
      // Also pipe the message into the live region for non-visual users
      announce(message);
    },
    [showToast, announce],
  );

  const addError = useCallback(
    (error: AppError) => {
      // Critical errors are logged, not shown as toast
      if (error.severity === 'CRITICAL') {
        // Send to monitoring endpoint
        console.error('[Critical application error]', error);
        return;
      }

      // Non-critical errors are shown as toast and announced via live region
      showToast(error.message, 'error');
      announce(error.message);
    },
    [showToast, announce],
  );

  return (
    <NotificationContext.Provider value={{ addNotification, addError, liveAnnouncement, announce }}>
      {children}
      {/*
        Polite aria-live region for dynamic status announcements.
        WCAG 4.1.3 – Status Messages: status messages must be
        programmatically determinable via role or property so they can
        be announced by assistive technologies without receiving focus.

        - aria-live="polite" waits for the user to finish reading before announcing.
        - aria-atomic="true" reads the full updated content on each change.
        - role="status" semantically marks this as a live status region.
        - The visually-hidden class keeps it out of the visual layout.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        aria-label="Notification announcements"
      >
        {liveAnnouncement}
      </div>
      {/*
        Assertive aria-live region for urgent alerts (errors that need
        immediate attention). Only used for truly critical messages.
        WCAG 4.1.3 – interrupts the user's current reading when fired.
      */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        aria-label="Critical alerts"
      />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotificationContext must be used within NotificationProvider",
    );
  return context;
};
