"use client"
import React from 'react';
import { HowItWorksSectionProps } from './types';
import { StepCard } from './StepCard';
import { StepConnector } from './StepConnector';
import { ResponsiveWrapper } from './ResponsiveWrapper';
import { defaultStepConfiguration } from './config';

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  className = '',
  steps = defaultStepConfiguration.steps
}) => {
  // Validate and fallback for steps data
  const validatedSteps = React.useMemo(() => {
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      console.warn('Invalid or empty steps provided, falling back to default configuration');
      return defaultStepConfiguration.steps;
    }

    // Validate each step has required properties
    const validSteps = steps.filter(step => {
      const isValid = step && 
        typeof step.id === 'string' && 
        typeof step.title === 'string' && 
        typeof step.description === 'string' &&
        step.icon !== undefined;
      
      if (!isValid) {
        console.warn('Invalid step data found:', step);
      }
      
      return isValid;
    });

    if (validSteps.length === 0) {
      console.warn('No valid steps found, falling back to default configuration');
      return defaultStepConfiguration.steps;
    }

    return validSteps;
  }, [steps]);

  const { sectionTitle, sectionSubtitle } = defaultStepConfiguration.metadata;

  // Error boundary for individual step cards
  const renderStepCard = (step: typeof validatedSteps[0], index: number) => {
    try {
      const isLast = index === validatedSteps.length - 1;
      
      return (
        <StepCard
          key={step.id}
          step={step}
          index={index}
          isLast={isLast}
          variant="horizontal"
          showConnector={!isLast}
        />
      );
    } catch (error) {
      console.error('Error rendering step card:', error, step);
      
      // Fallback step card
      return (
        <div
          key={`fallback-${index}`}
          className="step-card bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-50 w-full max-w-sm"
          data-testid="fallback-step-card"
        >
          <div className="text-slate-400 text-center">
            <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-white font-semibold mb-4 mx-auto">
              {index + 1}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Step {index + 1}</h3>
            <p className="text-sm text-slate-300">Content unavailable</p>
          </div>
        </div>
      );
    }
  };

  // Generate step cards with connectors
  const renderStepsWithConnectors = () => {
    const elements: React.ReactNode[] = [];

    validatedSteps.forEach((step, index) => {
      const isLast = index === validatedSteps.length - 1;

      // Add step card with error handling
      elements.push(renderStepCard(step, index));

      // Add connector between steps (except after the last step)
      if (!isLast) {
        try {
          elements.push(
            <StepConnector
              key={`connector-${index}`}
              direction="horizontal"
              variant="arrow"
              className="hidden lg:flex"
            />
          );
        } catch (error) {
          console.error('Error rendering step connector:', error);
          // Fallback connector
          elements.push(
            <div
              key={`fallback-connector-${index}`}
              className="hidden lg:flex w-8 h-1 bg-slate-600 mx-4"
              data-testid="fallback-connector"
            />
          );
        }
      }
    });

    return elements;
  };

  return (
    <section
      className={`how-it-works-section bg-[#1A1F35] py-16 px-4 sm:px-6 lg:px-8 ${className}`}
      data-testid="how-it-works-section"
      aria-labelledby="how-it-works-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <header className="text-center mb-16">
          <h2
            id="how-it-works-title"
            className="text-4xl md:text-5xl leading-[100%] font-bold text-[#080D24] mb-6"
            data-testid="section-title"
          >
            {sectionTitle}
          </h2>
          <p
            className="text-[19px] text-[#FFFFFF] leading-[100%] font-semibold max-w-3xl mx-auto  "
            data-testid="section-subtitle"
          >
            {sectionSubtitle}
          </p>
        </header>

        {/* Steps Container */}
        <div className="steps-container">
          <ResponsiveWrapper>
            {renderStepsWithConnectors()}
          </ResponsiveWrapper>
        </div>
      </div>
    </section>
  );
};