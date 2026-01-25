import { ReactNode } from 'react';

// Core data interfaces
export interface StepData {
  id: string;
  title: string;
  description: string;
  icon: string | ReactNode;
  ariaLabel?: string;
}

export interface StepConfiguration {
  steps: StepData[];
  metadata: {
    sectionTitle: string;
    sectionSubtitle: string;
    totalSteps: number;
  };
}

// Component prop interfaces
export interface HowItWorksSectionProps {
  className?: string;
  steps?: StepData[];
  variant?: 'default' | 'compact';
}

export interface StepCardProps {
  step: StepData;
  index: number;
  isLast: boolean;
  variant?: 'horizontal' | 'vertical';
  showConnector?: boolean;
}

export interface StepConnectorProps {
  direction: 'horizontal' | 'vertical';
  variant?: 'arrow' | 'line' | 'dotted';
  className?: string;
}

export interface ResponsiveWrapperProps {
  children: ReactNode;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Configuration interfaces
export interface BreakpointConfiguration {
  mobile: {
    maxWidth: number;
    layout: 'vertical';
    cardsPerRow: 1;
    spacing: 'compact';
  };
  tablet: {
    minWidth: number;
    maxWidth: number;
    layout: 'grid';
    cardsPerRow: 2;
    spacing: 'normal';
  };
  desktop: {
    minWidth: number;
    layout: 'horizontal';
    cardsPerRow: 4;
    spacing: 'spacious';
  };
}