/**
 * Integration tests for transaction error handling (Issue #157)
 *
 * Covers:
 *  - classifyTransactionError categorises all Stellar/Soroban error types
 *  - useTransactionHandler: success path, error path, retry logic, notifications
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import {
  classifyTransactionError,
  isRetryable,
  toastMessage,
  TransactionError,
} from "@/lib/transactionErrors";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { NotificationProvider } from "@/context/NotificationContext";

// ─── Mock dependencies ────────────────────────────────────────────────────────

const mockAddNotification = jest.fn();

jest.mock("@/context/NotificationContext", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotificationContext: () => ({ addNotification: mockAddNotification }),
}));

// ─── Wrapper ──────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

// ─── classifyTransactionError ─────────────────────────────────────────────────

describe("classifyTransactionError", () => {
  it("classifies insufficient balance (Horizon op_underfunded)", () => {
    const err = classifyTransactionError(new Error("op_underfunded"));
    expect(err.category).toBe("INSUFFICIENT_BALANCE");
    expect(err.retryable).toBe(false);
    expect(err.remediationStep).toMatch(/Fund your account/i);
  });

  it("classifies insufficient balance (low reserve)", () => {
    const err = classifyTransactionError(new Error("op_low_reserve"));
    expect(err.category).toBe("INSUFFICIENT_BALANCE");
  });

  it("classifies user rejection", () => {
    const err = classifyTransactionError(new Error("User rejected the request"));
    expect(err.category).toBe("USER_REJECTED");
    expect(err.retryable).toBe(false);
  });

  it("classifies Soroban contract error", () => {
    const err = classifyTransactionError(new Error("invoke_host_function failed: contract_error"));
    expect(err.category).toBe("CONTRACT");
    expect(err.retryable).toBe(false);
  });

  it("classifies network timeout", () => {
    const err = classifyTransactionError(new Error("Request timed out"));
    expect(err.category).toBe("NETWORK");
    expect(err.retryable).toBe(true);
  });

  it("classifies Horizon server error (fetch failed)", () => {
    const err = classifyTransactionError(new Error("Failed to fetch"));
    expect(err.category).toBe("NETWORK");
  });

  it("classifies Freighter wallet not installed", () => {
    const err = classifyTransactionError(new Error("Freighter extension not detected"));
    expect(err.category).toBe("WALLET");
    expect(err.retryable).toBe(true);
  });

  it("classifies tx_failed result code", () => {
    const err = classifyTransactionError(new Error("tx_failed"));
    expect(err.category).toBe("TRANSACTION_FAILED");
    expect(err.retryable).toBe(false);
  });

  it("classifies object errors with result_codes", () => {
    const err = classifyTransactionError({ result_codes: { transaction: "tx_bad_auth" } });
    expect(err.category).toBe("TRANSACTION_FAILED");
  });

  it("falls back to UNKNOWN for unrecognised errors", () => {
    const err = classifyTransactionError(new Error("completely unrecognised xyz"));
    expect(err.category).toBe("UNKNOWN");
    expect(err.retryable).toBe(true);
  });

  it("handles string errors", () => {
    const err = classifyTransactionError("user denied transaction");
    expect(err.category).toBe("USER_REJECTED");
  });

  it("handles null/undefined", () => {
    const err = classifyTransactionError(null);
    expect(err.category).toBe("UNKNOWN");
  });
});

// ─── isRetryable / toastMessage helpers ──────────────────────────────────────

describe("isRetryable", () => {
  it("returns true for NETWORK errors", () => {
    const err = classifyTransactionError(new Error("timeout"));
    expect(isRetryable(err)).toBe(true);
  });

  it("returns false for USER_REJECTED errors", () => {
    const err = classifyTransactionError(new Error("user rejected"));
    expect(isRetryable(err)).toBe(false);
  });
});

describe("toastMessage", () => {
  it("returns a non-empty string combining title and message", () => {
    const err = classifyTransactionError(new Error("op_underfunded"));
    const msg = toastMessage(err);
    expect(msg).toContain("Insufficient Balance");
    expect(msg.length).toBeGreaterThan(10);
  });
});

// ─── useTransactionHandler ───────────────────────────────────────────────────

describe("useTransactionHandler", () => {
  beforeEach(() => {
    mockAddNotification.mockClear();
  });

  it("returns result and shows success toast on success", async () => {
    const { result } = renderHook(() => useTransactionHandler(), { wrapper });

    let returnValue: string | null = null;
    await act(async () => {
      returnValue = await result.current.execute(async () => "tx_hash_123");
    });

    expect(returnValue).toBe("tx_hash_123");
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockAddNotification).toHaveBeenCalledWith(
      "Transaction submitted successfully.",
      "success",
    );
  });

  it("suppresses success toast when showSuccessToast is false", async () => {
    const { result } = renderHook(
      () => useTransactionHandler({ showSuccessToast: false }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute(async () => "ok");
    });

    expect(mockAddNotification).not.toHaveBeenCalledWith(expect.any(String), "success");
  });

  it("sets error and shows error toast on non-retryable failure", async () => {
    const { result } = renderHook(() => useTransactionHandler({ maxRetries: 0 }), { wrapper });

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute(async () => {
        throw new Error("user rejected");
      });
    });

    expect(returnValue).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.category).toBe("USER_REJECTED");
    expect(mockAddNotification).toHaveBeenCalledWith(expect.stringContaining("Cancelled"), "error");
  });

  it("retries on NETWORK error up to maxRetries then fails", async () => {
    let calls = 0;
    const { result } = renderHook(
      () => useTransactionHandler({ maxRetries: 2, retryDelayMs: 10 }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute(async () => {
        calls += 1;
        throw new Error("Request timed out");
      });
    });

    // 1 initial + 2 retries = 3 total calls
    expect(calls).toBe(3);
    expect(result.current.error?.category).toBe("NETWORK");
    expect(result.current.retryCount).toBe(2);
  });

  it("succeeds on retry if transient failure resolves", async () => {
    let calls = 0;
    const { result } = renderHook(
      () => useTransactionHandler({ maxRetries: 2, retryDelayMs: 10 }),
      { wrapper },
    );

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.execute(async () => {
        calls += 1;
        if (calls < 3) throw new Error("timeout");
        return "recovered";
      });
    });

    expect(returnValue).toBe("recovered");
    expect(result.current.error).toBeNull();
  });

  it("clearError resets error state", async () => {
    const { result } = renderHook(() => useTransactionHandler({ maxRetries: 0 }), { wrapper });

    await act(async () => {
      await result.current.execute(async () => { throw new Error("op_underfunded"); });
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("shows warning toast for each retry attempt", async () => {
    const { result } = renderHook(
      () => useTransactionHandler({ maxRetries: 1, retryDelayMs: 10 }),
      { wrapper },
    );

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error("fetch failed");
      });
    });

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.stringContaining("retrying"),
      "warning",
    );
  });
});
