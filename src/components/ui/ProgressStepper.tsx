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
  current: 'bg-primary border-primary text-primary-fg ring-4 ring-primary/25',
  upcoming: 'bg-surface-sunken border-border text-fg-subtle',
};

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  canNavigate = () => true
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

  const activeStep = steps.find((s) => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <ol className="hidden items-center justify-between md:flex">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isConnectorComplete =
            step.id < currentStep || completedSteps.includes(step.id);

          return (
            <React.Fragment key={step.id}>
              <li className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={!canNavigate(step.id)}
                  aria-current={status === 'current' ? 'step' : undefined}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-pill border-2 text-sm font-medium',
                    controlMotion,
                    focusRing,
                    'focus-visible:ring-primary',
                    statusClasses[status],
                    canNavigate(step.id) && onStepClick
                      ? 'cursor-pointer hover:scale-105 motion-reduce:hover:scale-100'
                      : 'cursor-default',
                    'disabled:cursor-not-allowed',
                  )}
                >
                  {status === 'completed' ? (
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
                    step.id
                  )}
                  <span className="sr-only">{step.title}</span>
                </button>
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      step.id === currentStep ? 'text-fg' : 'text-fg-muted',
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
              </li>
              {index < steps.length - 1 && (
                <li
                  aria-hidden="true"
                  className={cn(
                    'mx-4 h-0.5 flex-1 transition-colors duration-200 ease-standard',
                    isConnectorComplete ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-fg">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-fg-muted">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>

        <Progress
          value={currentStep}
          max={steps.length}
          label={`Step ${currentStep} of ${steps.length}`}
          hideLabel
          className="mb-4"
        />

        <div className="text-center">
          <h3 className="text-lg font-medium text-fg">{activeStep?.title}</h3>
          {activeStep?.description && (
            <p className="mt-1 text-sm text-fg-muted">
              {activeStep.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
