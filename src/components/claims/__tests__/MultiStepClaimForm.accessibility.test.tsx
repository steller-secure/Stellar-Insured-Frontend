/**
 * Accessibility tests for MultiStepClaimForm.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.3.1  Info and Relationships (form structure, step labels)
 *   2.1.1  Keyboard (navigation buttons, stepper)
 *   2.4.3  Focus Order (logical tab order through form)
 *   3.3.1  Error Identification (submission error announcement)
 *   4.1.2  Name, Role, Value (progress bar, buttons)
 *   4.1.3  Status Messages (draft restored notice, error alert)
 */
import React from "react";
import { renderWithQueryClient as render } from "@/test-utils/renderWithQueryClient";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// ── localStorage mock ─────────────────────────────────────────────────────────

const localStorageMock = {
  getItem: jest.fn((_key: string): string | null => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ── Module mocks ───────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/claims/new",
}));

// Prevent real API calls
jest.mock("@/services/api/claimApi", () => ({
  claimApi: {
    create: jest.fn().mockResolvedValue({ data: { id: "CLM-2026-0001" } }),
  },
}));

// Stub policyService so step 1 renders without network
jest.mock("@/services/policyService", () => ({
  policyService: {
    getPolicies: jest.fn().mockResolvedValue({
      success: true,
      data: {
        policies: [
          {
            id: "pol-1",
            name: "Crypto Wallet Protection",
            policyNumber: "POL-001",
            type: "Crypto",
            status: "active",
            coverageLimitFormatted: "$50,000",
          },
        ],
      },
    }),
  },
}));

// NotificationContext dependency
jest.mock("@/context/NotificationContext", () => ({
  useNotificationContext: () => ({
    addNotification: jest.fn(),
    announce: jest.fn(),
  }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// useUnsavedChanges – always allow navigation
jest.mock("@/hooks/useUnsavedChanges", () => ({
  useUnsavedChanges: jest.fn(() => ({ confirmNavigation: () => true })),
}));

import { MultiStepClaimForm } from "../MultiStepClaimForm";

// ── Accessibility tests ────────────────────────────────────────────────────────

describe("MultiStepClaimForm – accessibility (jest-axe)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("has no violations on initial render (step 1, no draft)", async () => {
    const { container } = render(<MultiStepClaimForm />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations when a draft is restored", async () => {
    const draft = {
      formData: {
        policyId: "pol-1",
        incidentType: "wallet-hack",
        incidentDate: "",
        incidentTime: "",
        location: "",
        description: "",
        immediateActions: "",
        claimAmount: "",
        estimatedLoss: "",
        currency: "USD",
        breakdown: [],
        documents: [],
        documentTypes: {},
        agreedToTerms: false,
        confirmAccuracy: false,
      },
      currentStep: 2,
      stepValidations: {},
      timestamp: Date.now(),
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(draft));

    const { container } = render(<MultiStepClaimForm />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations for navigation button group", async () => {
    const { container } = render(<MultiStepClaimForm />);
    // The nav area with Previous / Next / Cancel / Submit Claim buttons
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations when the progress stepper is visible", async () => {
    const { container } = render(<MultiStepClaimForm />);
    // ProgressStepper is rendered as part of the form
    expect(await axe(container)).toHaveNoViolations();
  });
});
