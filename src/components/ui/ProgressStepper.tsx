'use client';

import React from 'react';

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

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  canNavigate = () => true
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    if (stepNumber < currentStep) return 'completed';
    return 'upcoming';
  };

  const getStepClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    const baseClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 border-green-500 text-white`;
      case 'current':
        return `${baseClasses} bg-cyan-500 border-cyan-500 text-white ring-4 ring-cyan-500/20`;
      default:
        return `${baseClasses} bg-slate-800 border-slate-600 text-slate-400`;
    }
  };

  const getConnectorClasses = (stepNumber: number) => {
    const isCompleted = stepNumber < currentStep || completedSteps.includes(stepNumber);
    return `flex-1 h-0.5 mx-4 transition-colors duration-200 ${
      isCompleted ? 'bg-green-500' : 'bg-slate-600'
    }`;
  };

  const handleStepClick = (stepNumber: number) => {
    if (onStepClick && canNavigate(stepNumber)) {
      onStepClick(stepNumber);
    }
  };

  const mobileProgressPercent = Math.round((currentStep / steps.length) * 100);
  const currentStepObj = steps.find(s => s.id === currentStep);

  return (
    <div className="w-full">
      {/*
        Desktop Stepper
        role="group" with aria-label groups the steps as a single navigation landmark.
        WCAG 1.3.1 – Info and Relationships; 4.1.2 – Name, Role, Value
      */}
      {/*
        <nav> already carries the implicit "navigation" landmark role.
        aria-label differentiates it from other nav elements on the page.
        WCAG 1.3.1 – Info and Relationships; 4.1.2 – Name, Role, Value
      */}
      <nav
        className="hidden md:flex items-center justify-between"
        aria-label="Form progress"
      >
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isNavigable = !!onStepClick && canNavigate(step.id);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          // Build an accessible label that conveys status
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
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-disabled={!isNavigable}
                  className={`${getStepClasses(step.id)} ${
                    isNavigable
                      ? 'cursor-pointer hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
                      : 'cursor-default'
                  } disabled:cursor-not-allowed`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
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
                </button>
                <div className="mt-2 text-center" aria-hidden="true">
                  <div className={`text-sm font-medium ${
                    isCurrent ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-slate-500 mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={getConnectorClasses(step.id)}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          {/* Provide screen-reader-accessible progress context */}
          <span
            className="text-sm font-medium text-white"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">Form progress: </span>
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-slate-400" aria-hidden="true">
            {mobileProgressPercent}% Complete
          </span>
        </div>

        {/*
          Progress bar: role="progressbar" + aria-valuenow for AT support.
          WCAG 4.1.2 – Name, Role, Value
        */}
        <div
          role="progressbar"
          aria-valuenow={mobileProgressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Form completion: ${mobileProgressPercent}%`}
          className="w-full bg-slate-700 rounded-full h-2 mb-4"
        >
          <div
            className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${mobileProgressPercent}%` }}
          />
        </div>

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
      </div>
    </div>
  );
};
