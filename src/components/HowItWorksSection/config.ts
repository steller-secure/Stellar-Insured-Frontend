import { StepConfiguration, StepData, BreakpointConfiguration } from './types';

// Default step configuration matching the Figma design
export const defaultStepConfiguration: StepConfiguration = {
  steps: [
    {
      id: 'signup-connect',
      title: 'Sign Up & Connect Wallet',
      description: 'Create an account and connect your StellarNet compatible wallet to get started',
      icon: 'wallet-connect',
      ariaLabel: 'Step 1: Account creation and wallet connection'
    },
    {
      id: 'choose-policy',
      title: 'Choose a Policy',
      description: 'Select an insurance policy, specify coverage terms, and pay premiums.',
      icon: 'policy-selection',
      ariaLabel: 'Step 2: Policy selection and customization'
    },
    {
      id: 'submit-claims',
      title: 'Submit Claims',
      description: 'If an insured event occurs, submit a claim through the platform.',
      icon: 'claim-submission',
      ariaLabel: 'Step 3: Claim submission and processing'
    },
    {
      id: 'receive-payout',
      title: 'Receive Automatic Payout',
      description: 'Verified claims trigger instant payouts via smart contracts.',
      icon: 'automatic-payout',
      ariaLabel: 'Step 4: Automated payout and settlement'
    }
  ],
  metadata: {
    sectionTitle: 'How It Works',
    sectionSubtitle: 'Our streamlined process makes securing and managing your insurance policies simple and efficient.',
    totalSteps: 4
  }
};

// Responsive breakpoint configuration
export const defaultBreakpointConfiguration: BreakpointConfiguration = {
  mobile: {
    maxWidth: 767,
    layout: 'vertical',
    cardsPerRow: 1,
    spacing: 'compact'
  },
  tablet: {
    minWidth: 768,
    maxWidth: 1023,
    layout: 'grid',
    cardsPerRow: 2,
    spacing: 'normal'
  },
  desktop: {
    minWidth: 1024,
    layout: 'horizontal',
    cardsPerRow: 4,
    spacing: 'spacious'
  }
};

// Step validation utilities
export const validateStepData = (step: Partial<StepData>): step is StepData => {
  return !!(
    step.id &&
    typeof step.id === 'string' &&
    step.title &&
    typeof step.title === 'string' &&
    step.description &&
    typeof step.description === 'string' &&
    step.icon !== undefined
  );
};

export const validateStepConfiguration = (config: Partial<StepConfiguration>): config is StepConfiguration => {
  if (!config.steps || !Array.isArray(config.steps)) {
    return false;
  }

  if (!config.metadata || typeof config.metadata !== 'object') {
    return false;
  }

  const { sectionTitle, sectionSubtitle, totalSteps } = config.metadata;
  if (!sectionTitle || !sectionSubtitle || typeof totalSteps !== 'number') {
    return false;
  }

  return config.steps.every(validateStepData) && config.steps.length === totalSteps;
};

// Utility to create step configuration with validation
export const createStepConfiguration = (
  steps: StepData[],
  metadata?: Partial<StepConfiguration['metadata']>
): StepConfiguration => {
  const config: StepConfiguration = {
    steps,
    metadata: {
      sectionTitle: metadata?.sectionTitle || defaultStepConfiguration.metadata.sectionTitle,
      sectionSubtitle: metadata?.sectionSubtitle || defaultStepConfiguration.metadata.sectionSubtitle,
      totalSteps: steps.length
    }
  };

  if (!validateStepConfiguration(config)) {
    console.warn('Invalid step configuration provided, falling back to default');
    return defaultStepConfiguration;
  }

  return config;
};

// Utility to get step by ID
export const getStepById = (steps: StepData[], id: string): StepData | undefined => {
  return steps.find(step => step.id === id);
};

// Utility to reorder steps while maintaining consistency
export const reorderSteps = (steps: StepData[], newOrder: string[]): StepData[] => {
  if (newOrder.length !== steps.length) {
    console.warn('New order length does not match steps length');
    return steps;
  }

  const reordered = newOrder.map(id => getStepById(steps, id)).filter(Boolean) as StepData[];
  
  if (reordered.length !== steps.length) {
    console.warn('Some step IDs in new order were not found');
    return steps;
  }

  return reordered;
};