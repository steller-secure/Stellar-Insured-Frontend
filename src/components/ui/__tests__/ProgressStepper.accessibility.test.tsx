/**
 * Accessibility tests for ProgressStepper component.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.3.1  Info and Relationships
 *   2.1.1  Keyboard
 *   2.4.6  Headings and Labels
 *   4.1.2  Name, Role, Value
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProgressStepper, type Step } from '../ProgressStepper';

expect.extend(toHaveNoViolations);

const steps: Step[] = [
  { id: 1, title: 'Policy & Incident', description: 'Select policy and incident type' },
  { id: 2, title: 'Incident Details', description: 'When and how it happened' },
  { id: 3, title: 'Claim Amount', description: 'Loss amount and breakdown' },
  { id: 4, title: 'Documents', description: 'Upload supporting evidence' },
  { id: 5, title: 'Review & Submit', description: 'Final review and submission' },
];

// ─── ProgressStepper ──────────────────────────────────────────────────────────

describe('ProgressStepper – accessibility (jest-axe)', () => {
  it('has no violations on step 1 (first step, nothing completed)', async () => {
    const { container } = render(
      <ProgressStepper steps={steps} currentStep={1} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on a middle step with some completed', async () => {
    const { container } = render(
      <ProgressStepper
        steps={steps}
        currentStep={3}
        completedSteps={[1, 2]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on the last step', async () => {
    const { container } = render(
      <ProgressStepper
        steps={steps}
        currentStep={5}
        completedSteps={[1, 2, 3, 4]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when steps are navigable (onStepClick provided)', async () => {
    const { container } = render(
      <ProgressStepper
        steps={steps}
        currentStep={3}
        completedSteps={[1, 2]}
        onStepClick={jest.fn()}
        canNavigate={(step) => step <= 3}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when all steps are completed', async () => {
    const { container } = render(
      <ProgressStepper
        steps={steps}
        currentStep={5}
        completedSteps={[1, 2, 3, 4, 5]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
