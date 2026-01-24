/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { StepCardProps } from './types';

// Icon components matching the Figma design
const WalletIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="32" height="24" rx="4" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <rect x="12" y="16" width="8" height="6" rx="2" fill="#3B82F6"/>
    <circle cx="32" cy="24" r="2" fill="#3B82F6"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L36 10V22C36 30 30 36 24 44C18 36 12 30 12 22V10L24 4Z" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <path d="M20 24L22 26L28 20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 6H28L36 14V40C36 41.1 35.1 42 34 42H14C12.9 42 12 41.1 12 40V8C12 6.9 12.9 6 14 6Z" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <path d="M28 6V14H36" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 22H30" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 28H30" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 34H24" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <path d="M16 24L20 28L32 16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const iconMap = {
  'wallet-connect': WalletIcon,
  'policy-selection': ShieldIcon,
  'claim-submission': DocumentIcon,
  'automatic-payout': CheckCircleIcon,
};

export const StepCard: React.FC<StepCardProps> = React.memo(({
  step,
  index,
  isLast,
  variant = 'horizontal',
  showConnector = true
}) => {
  const { title, description, icon, ariaLabel } = step;

  // Icon rendering - handle both string and ReactNode types
  const renderIcon = () => {
    if (typeof icon === 'string') {
      const IconComponent = iconMap[icon as keyof typeof iconMap];
      if (IconComponent) {
        return (
          <div 
            className="flex items-center justify-center mx-auto mb-6"
            data-testid="step-icon"
            aria-hidden="true"
          >
            <IconComponent />
          </div>
        );
      }
      // Fallback for unknown string icons
      return (
        <div 
          className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold mb-6"
          data-testid="step-icon"
          aria-hidden="true"
        >
          {index + 1}
        </div>
      );
    }
    
    // For ReactNode icons
    return (
      <div 
        data-testid="step-icon" 
        className="flex items-center justify-center mb-6"
        aria-hidden="true"
      >
        {icon}
      </div>
    );
  };

  return (
    <article
      className="bg-slate-800/50 border border-[#94BCCA] rounded-[10px] p-8 flex flex-col items-start w-full max-w-70 min-h-70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      data-testid="step-card"
      aria-labelledby={`step-${index}-title`}
      aria-describedby={`step-${index}-description`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        }
      }}
    >
      {/* Step Icon */}
      {renderIcon()}

      {/* Step Content */}
      <div className="flex-1 space-y-4">
        {/* Step Title */}
        <h3
          id={`step-${index}-title`}
          className="text-[19px] text-center font-semibold text-white leading-[100%]"
          data-testid="step-title"
        >
          {title}
        </h3>

        {/* Step Description */}
        <p
          id={`step-${index}-description`}
          className="text-[#E0D7D7] text-[14px] text-center font-semibold leading-[100%]"
          data-testid="step-description"
        >
          {description}
        </p>
      </div>
    </article>
  );
});

StepCard.displayName = 'StepCard';