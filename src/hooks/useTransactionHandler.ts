"use client";

/**
 * useTransactionHandler
 *
 * A React hook that wraps Stellar / Soroban transaction submissions with:
 *  - Structured try-catch using transactionErrors.ts
 *  - User-facing toast notifications via NotificationContext
 *  - Automatic retry logic for transient (network) failures
 *  - Console error logging for monitoring / debugging
 */

import { useState, useCallback } from "react";
import {
  classifyTransactionError,
  isRetryable,
  toastMessage,
  TransactionError,
} from "@/lib/transactionErrors";
import { useNotificationContext } from "@/context/NotificationContext";

export interface TransactionHandlerOptions {
  /** Max automatic retries for retryable errors (default: 2) */
  maxRetries?: number;
  /** Base delay in ms between retries, doubles each attempt (default: 1000) */
  retryDelayMs?: number;
  /** Whether to show a success toast on completion (default: true) */
  showSuccessToast?: boolean;
  /** Custom success message (default: "Transaction submitted successfully.") */
  successMessage?: string;
}

export interface TransactionState {
  isLoading: boolean;
  error: TransactionError | null;
  retryCount: number;
}

const DEFAULT_OPTIONS: Required<TransactionHandlerOptions> = {
  maxRetries: 2,
  retryDelayMs: 1000,
  showSuccessToast: true,
  successMessage: "Transaction submitted successfully.",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useTransactionHandler(options: TransactionHandlerOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { addNotification } = useNotificationContext();

  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    retryCount: 0,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  /**
   * Execute a transaction function with full error handling + retry.
   *
   * @param fn        Async transaction factory / submitter
   * @param context   Optional metadata logged with errors (e.g. { action: "vote" })
   * @returns         The resolved value, or `null` on failure
   */
  const execute = useCallback(
    async <T>(
      fn: () => Promise<T>,
      context?: Record<string, unknown>,
    ): Promise<T | null> => {
      setState({ isLoading: true, error: null, retryCount: 0 });

      let attempt = 0;

      while (true) {
        try {
          const result = await fn();

          setState({ isLoading: false, error: null, retryCount: attempt });

          if (opts.showSuccessToast) {
            addNotification(opts.successMessage, "success");
          }

          return result;
        } catch (raw) {
          const txError = classifyTransactionError(raw);

          // Log for monitoring
          console.error("[useTransactionHandler] Transaction failed", {
            category: txError.category,
            title: txError.title,
            message: txError.message,
            attempt,
            context,
            originalError: txError.originalError,
          });

          const canRetry =
            isRetryable(txError) && attempt < opts.maxRetries;

          if (canRetry) {
            attempt += 1;
            setState((prev) => ({
              ...prev,
              retryCount: attempt,
            }));

            addNotification(
              `Network issue — retrying (${attempt}/${opts.maxRetries})…`,
              "warning",
            );

            await sleep(opts.retryDelayMs * Math.pow(2, attempt - 1));
            continue;
          }

          // Final failure
          setState({ isLoading: false, error: txError, retryCount: attempt });

          addNotification(toastMessage(txError), "error");

          return null;
        }
      }
    },
    [opts, addNotification],
  );

  return {
    execute,
    clearError,
    isLoading: state.isLoading,
    error: state.error,
    retryCount: state.retryCount,
    hasError: state.error !== null,
  };
}

export default useTransactionHandler;
