'use client';

import { useState, useCallback, useEffect } from 'react';

export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface MultiStepFormConfig {
  totalSteps: number;
  storageKey?: string;
  autoSave?: boolean;
}

export function useMultiStepForm<T extends Record<string, any>>(
  initialData: T,
  config: MultiStepFormConfig
) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<T>(initialData);
  const [stepValidations, setStepValidations] = useState<Record<number, StepValidation>>({});
  const [isDraft, setIsDraft] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (config.storageKey) {
      const savedDraft = localStorage.getItem(config.storageKey);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed.formData || initialData);
          setCurrentStep(parsed.currentStep || 1);
          setIsDraft(true);
        } catch (error) {
          console.warn('Failed to load draft:', error);
        }
      }
    }
  }, [config.storageKey, initialData]);

  // Auto-save draft
  useEffect(() => {
    if (config.autoSave && config.storageKey && (isDraft || currentStep > 1)) {
      const draftData = {
        formData,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem(config.storageKey, JSON.stringify(draftData));
    }
  }, [formData, currentStep, config.autoSave, config.storageKey, isDraft]);

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDraft(true);
  }, []);

  const validateStep = useCallback((step: number, validation: StepValidation) => {
    setStepValidations(prev => ({
      ...prev,
      [step]: validation
    }));
    return validation.isValid;
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < config.totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, config.totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= config.totalSteps) {
      setCurrentStep(step);
    }
  }, [config.totalSteps]);

  const isStepValid = useCallback((step: number) => {
    return stepValidations[step]?.isValid ?? false;
  }, [stepValidations]);

  const canProceedToStep = useCallback((targetStep: number) => {
    // Can always go backwards
    if (targetStep <= currentStep) return true;
    
    // Check if all previous steps are valid
    for (let i = 1; i < targetStep; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  }, [currentStep, isStepValid]);

  const clearDraft = useCallback(() => {
    if (config.storageKey) {
      localStorage.removeItem(config.storageKey);
    }
    setIsDraft(false);
  }, [config.storageKey]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setCurrentStep(1);
    setStepValidations({});
    clearDraft();
  }, [initialData, clearDraft]);

  const getProgress = useCallback(() => {
    return (currentStep / config.totalSteps) * 100;
  }, [currentStep, config.totalSteps]);

  return {
    // State
    currentStep,
    formData,
    isDraft,
    stepValidations,
    
    // Actions
    updateFormData,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    clearDraft,
    
    // Computed
    isStepValid,
    canProceedToStep,
    getProgress,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === config.totalSteps,
    totalSteps: config.totalSteps
  };
}