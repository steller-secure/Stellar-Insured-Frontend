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

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!canNavigate(step.id)}
                className={`${getStepClasses(step.id)} ${
                  canNavigate(step.id) && onStepClick 
                    ? 'cursor-pointer hover:scale-105' 
                    : 'cursor-default'
                } disabled:cursor-not-allowed`}
              >
                {getStepStatus(step.id) === 'completed' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </button>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  step.id === currentStep ? 'text-white' : 'text-slate-400'
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
              <div className={getConnectorClasses(step.id)} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-slate-400">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">
            {steps.find(s => s.id === currentStep)?.title}
          </h3>
          {steps.find(s => s.id === currentStep)?.description && (
            <p className="text-sm text-slate-400 mt-1">
              {steps.find(s => s.id === currentStep)?.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};