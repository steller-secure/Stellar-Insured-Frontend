import React from "react";
import { render, screen, act, renderHook } from "@testing-library/react";
import {
  NotificationProvider,
  useNotificationContext,
} from "./NotificationContext";

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: () => ({
    showWalletConnected: jest.fn(),
    showError: jest.fn(),
  }),
}));

const TestComponent = () => {
  const { addNotification } = useNotificationContext();

  return (
    <button onClick={() => addNotification("Hello World", "success")}>
      Trigger Toast
    </button>
  );
};

describe("NotificationContext", () => {
  it("renders children correctly", () => {
    render(
      <NotificationProvider>
        <div data-testid="child">Child Content</div>
      </NotificationProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("provides the addNotification function", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    expect(typeof result.current.addNotification).toBe("function");
  });

  it("throws error when used outside provider", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useNotificationContext())).toThrow(
      "useNotificationContext must be used within NotificationProvider",
    );

    consoleSpy.mockRestore();
  });
});
