import { renderHook, act } from "@testing-library/react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import React from "react";

const mockAddNotification = jest.fn();
jest.mock("@/context/NotificationContext", () => ({
  useNotificationContext: () => ({
    addNotification: mockAddNotification,
  }),
}));

jest.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => ({
    trackError: jest.fn(),
  }),
}));

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe("useErrorHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleError", () => {
    it("should handle error and update state", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError("NETWORK", "CONNECTION_TIMEOUT");
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.hasError).toBe(true);
    });
  });

  describe("notification methods integration", () => {
    it("should call addNotification when showErrorNotification is triggered", () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockAppError = {
        message: "Test Error Message",
        userActionable: true,
        severity: "ERROR",
      } as any;

      act(() => {
        result.current.showErrorNotification(mockAppError);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        "Test Error Message",
        "error",
      );
    });

    it("should call addNotification for success messages", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.showSuccessNotification("Success!");
      });

      expect(mockAddNotification).toHaveBeenCalledWith("Success!", "success");
    });
  });
});
