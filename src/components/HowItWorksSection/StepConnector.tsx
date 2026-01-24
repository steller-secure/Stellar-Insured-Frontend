'use client';

import React from 'react';
import { StepConnectorProps } from './types';

export const StepConnector: React.FC<StepConnectorProps> = React.memo(({
  direction,
  variant = 'arrow',
  className = ''
}) => {
  // Base classes for the connector
  const baseClasses = 'step-connector flex items-center justify-center';
  
  // Direction-specific classes
  const directionClasses = {
    horizontal: 'w-8 h-1 mx-4',
    vertical: 'h-8 w-1 my-4'
  };

  // Variant-specific rendering
  const renderConnector = () => {
    switch (variant) {
      case 'arrow':
        return direction === 'horizontal' ? (
          <div className="flex items-center space-x-1">
            {/* Arrow line */}
            <div className="flex-1 h-0.5 bg-blue-400"></div>
            {/* Arrow head */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-400"
              aria-hidden="true"
              
            >
              <path
                d="M4 2L8 6L4 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1">
            {/* Arrow line */}
            <div className="w-0.5 flex-1 bg-blue-400"></div>
            {/* Arrow head */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-400"
              aria-hidden="true"
            
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );

      case 'line':
        return (
          <div
            className={`bg-blue-400 ${
              direction === 'horizontal' ? 'w-full h-0.5' : 'h-full w-0.5'
            }`}
          />
        );

      case 'dotted':
        return (
          <div
            className={`border-blue-400 ${
              direction === 'horizontal'
                ? 'w-full border-t-2 border-dotted'
                : 'h-full border-l-2 border-dotted'
            }`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`${baseClasses} ${directionClasses[direction]} ${className}`}
      data-testid="step-connector"
      role="presentation"
      aria-hidden="true"
    >
      {renderConnector()}
    </div>
  );
});

StepConnector.displayName = 'StepConnector';