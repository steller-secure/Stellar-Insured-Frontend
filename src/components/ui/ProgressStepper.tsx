'use client';

import React from 'react';
import { cn, controlMotion, focusRing } from '@/design-system';
import { Progress } from './Progress';

export interface Step {
  id: number;
  title: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
  canNavigate?: (step: number) => boolean;
}

type StepStatus = 'completed' | 'current' | 'upcoming';

const statusClasses: Record<StepStatus, string> = {
  completed: 'bg-success border-success text-success-fg',
  current:
    'bg-primary border-primary text-primary-fg ring-4 ring-primary/25',
  upcoming: 'bg-surface-sunken border-border text-fg-subtle',
};

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  canNavigate = () => true,
}) => {
  const getStepStatus = (stepNumber: number): StepStatus => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'completed';
    return 'upcoming';
  };

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && canNavigate(stepNumber)) {
      onStepClick(stepNumber);
    }
  };

  const activeStep = steps.find((step) => step.id === currentStep);

  const mobileProgressPercent =
    steps.length > 0
      ? Math.round((currentStep / steps.length) * 100)
      : 0;

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <nav
        className="hidden items-center justify-between md:flex"
        aria-label="Form progress"
      >
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);

          const isConnectorComplete =
            step.id < currentStep ||
            completedSteps.includes(step.id);

          const isNavigable =
            !!onStepClick && canNavigate(step.id);

          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          const stepLabel = isCompleted
            ? `Step ${step.id}: ${step.title} — completed`
            : isCurrent
              ? `Step ${step.id}: ${step.title} — current step`
              : `Step ${step.id}: ${step.title} — not yet reached`;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isNavigable}
                  aria-label={stepLabel}
                  aria-current={
                    isCurrent ? 'step' : undefined
                  }
                  aria-disabled={!isNavigable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-pill border-2 text-sm font-medium',
                    controlMotion,
                    focusRing,
                    'focus-visible:ring-primary',
                    statusClasses[status],
                    isNavigable
                      ? 'cursor-pointer hover:scale-105 motion-reduce:hover:scale-100'
                      : 'cursor-default',
                    'disabled:cursor-not-allowed',
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span aria-hidden="true">{step.id}</span>
                  )}

                  <span className="sr-only">{step.title}</span>
                </button>

                <div className="mt-2 text-center" aria-hidden="true">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isCurrent
                        ? 'text-fg'
                        : 'text-fg-muted',
                    )}
                  >
                    {step.title}
                  </div>

                  {step.description && (
                    <div className="mt-1 max-w-24 text-xs text-fg-subtle">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'mx-4 h-0.5 flex-1 transition-colors duration-200 ease-standard',
                    isConnectorComplete
                      ? 'bg-success'
                      : 'bg-border',
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="mb-4 flex items-center justify-between">
          <span
            className="text-sm font-medium text-fg"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">Form progress: </span>
            Step {currentStep} of {steps.length}
          </span>

          <span
            className="text-sm text-fg-muted"
            aria-hidden="true"
          >
            {mobileProgressPercent}% Complete
          </span>
        </div>

        <Progress
          value={currentStep}
          max={steps.length}
          label={`Step ${currentStep} of ${steps.length}`}
          hideLabel
          className="mb-4"
        />

        <div
          role="status"
          aria-live="polite"
          className="text-center"
        >
          {activeStep && (
            <>
              <h3 className="text-lg font-medium text-fg">
                {activeStep.title}
              </h3>

        {currentStepObj && (
          <div className="text-center">
            <h2 className="text-lg font-medium text-white">
              {currentStepObj.title}
            </h2>
            {currentStepObj.description && (
              <p className="text-sm text-slate-400 mt-1">
                {currentStepObj.description}
              </p>
            )}
          </div>
        )}
              {activeStep.description && (
                <p className="mt-1 text-sm text-fg-muted">
                  {activeStep.description}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};