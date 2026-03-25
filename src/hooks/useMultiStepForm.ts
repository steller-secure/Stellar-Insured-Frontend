'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useFormPersistence } from './useFormPersistence';

export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface MultiStepFormConfig {
  totalSteps: number;
  storageKey?: string;
  autoSave?: boolean;
  /** Time-to-live for saved drafts in ms. Defaults to 24 hours. */
  ttl?: number;
  /** Debounce delay for auto-save in ms. Defaults to 500ms. */
  debounceMs?: number;
}

export function useMultiStepForm<T extends Record<string, any>>(
  initialData: T,
  config: MultiStepFormConfig
) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<T>(initialData);
  const [stepValidations, setStepValidations] = useState<Record<number, StepValidation>>({});
  const [isDraft, setIsDraft] = useState(false);
  const initialLoadDone = useRef(false);

  const persistence = useFormPersistence<T>({
    storageKey: config.storageKey || '',
    ttl: config.ttl,
    debounceMs: config.debounceMs,
    useLocalStorage: true,
  });

  // Load draft on mount
  useEffect(() => {
    if (!config.storageKey || initialLoadDone.current) return;
    initialLoadDone.current = true;

    const draft = persistence.load();
    if (draft) {
      setFormData(draft.data);
      setCurrentStep(draft.currentStep);
      setIsDraft(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on data/step changes (debounced via useFormPersistence)
  useEffect(() => {
    if (!config.autoSave || !config.storageKey || !initialLoadDone.current) return;
    if (!isDraft && currentStep === 1) return;

    persistence.save(formData, currentStep);
  }, [formData, currentStep, config.autoSave, config.storageKey, isDraft, persistence]);

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
    persistence.clear();
    setIsDraft(false);
  }, [persistence]);

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
    
    // Persistence
    flushDraft: persistence.flush,
    lastSavedAt: persistence.lastSavedAt,
    
    // Computed
    isStepValid,
    canProceedToStep,
    getProgress,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === config.totalSteps,
    totalSteps: config.totalSteps
  };
}