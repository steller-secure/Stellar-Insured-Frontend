'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransactionHandler } from '@/hooks/useTransactionHandler';
import { useNotificationContext } from '@/context/NotificationContext';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { ProgressStepper, type Step } from '@/components/ui/ProgressStepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCreateClaimMutation } from '@/hooks/queries/useClaimMutations';
import { usePolicyQuery } from '@/hooks/queries/usePolicies';
import {
  multiStepClaimSchema,
  CLAIM_DOCUMENT_TYPES_REQUIRED,
  type MultiStepClaimFormValues,
} from '@/lib/form-schemas';
import { PolicySelectionStep } from './steps/PolicySelectionStep';
import { IncidentDetailsStep } from './steps/IncidentDetailsStep';
import { ClaimAmountStep } from './steps/ClaimAmountStep';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';

const initialFormData: MultiStepClaimFormValues = {
  policyId: '',
  incidentType: '',
  incidentDate: '',
  incidentTime: '',
  location: '',
  description: '',
  immediateActions: '',
  claimAmount: '',
  estimatedLoss: '',
  currency: 'USD',
  breakdown: [],
  documents: [],
  documentTypes: {},
  agreedToTerms: false,
  confirmAccuracy: false,
};

const steps: Step[] = [
  {
    id: 1,
    title: 'Policy & Incident',
    description: 'Select policy and incident type'
  },
  {
    id: 2,
    title: 'Incident Details',
    description: 'When and how it happened'
  },
  {
    id: 3,
    title: 'Claim Amount',
    description: 'Loss amount and breakdown'
  },
  {
    id: 4,
    title: 'Documents',
    description: 'Upload supporting evidence'
  },
  {
    id: 5,
    title: 'Review & Submit',
    description: 'Final review and submission'
  }
];

const STEP_FIELDS: Array<Array<keyof MultiStepClaimFormValues>> = [
  ['policyId', 'incidentType'],
  ['incidentDate', 'description'],
  ['claimAmount', 'currency'],
  ['documents', 'documentTypes'],
  ['agreedToTerms', 'confirmAccuracy'],
];

export const MultiStepClaimForm: React.FC = () => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimId, setClaimId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const isResettingRef = useRef(false);

  const {
    execute: executeTransaction,
    error: submitError,
    clearError,
  } = useTransactionHandler({
    showSuccessToast: false,
  });
  const { addNotification: showSuccessNotification } = useNotificationContext();

  const persistence = useFormPersistence<MultiStepClaimFormValues>({
    storageKey: 'multi-step-claim-draft',
    useLocalStorage: true,
  });

  const methods = useForm<MultiStepClaimFormValues>({
    resolver: zodResolver(multiStepClaimSchema),
    mode: 'onChange',
    defaultValues: initialFormData,
  });
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const formValues = useWatch({ control }) as MultiStepClaimFormValues;

  const hasDraft = persistence.hasDraft;
  const isDraft = hasDraft || isDirty;

  // Warn about unsaved changes on browser navigation / tab close
  const { confirmNavigation } = useUnsavedChanges(isDraft && !isSuccess);

  const { data: selectedPolicy } = usePolicyQuery(formValues.policyId);
  const createClaimMutation = useCreateClaimMutation();

  // Restore a persisted draft on mount
  useEffect(() => {
    const draft = persistence.load();
    if (draft) {
      if (draft.data) {
        reset({
          ...initialFormData,
          ...draft.data,
          documents: (draft.data.documents ?? []).filter((doc) => doc instanceof File),
        });
      }
      setCurrentStep(draft.currentStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save form values as a draft (debounced by useFormPersistence)
  useEffect(() => {
    if (isResettingRef.current) return;
    if (!hasDraft && !isDirty && currentStep === 1) return;
    persistence.save(formValues, currentStep);
  }, [formValues, currentStep, hasDraft, isDirty, persistence.save]);

  const resetToInitial = useCallback(() => {
    isResettingRef.current = true;
    persistence.clear();
    reset(initialFormData);
    setCurrentStep(1);
    setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
  }, [persistence, reset]);

  const handleCancel = useCallback(() => {
    if (confirmNavigation()) {
      router.push('/claims');
    }
  }, [confirmNavigation, router]);

  const formatLastSaved = (timestamp: number | null): string | null => {
    if (!timestamp) return null;
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Saved just now';
    if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)}m ago`;
    return `Saved ${new Date(timestamp).toLocaleTimeString()}`;
  };

  const hasStepErrors = (step: number) =>
    STEP_FIELDS[step - 1].some((field) => (errors as Record<string, unknown>)[field]);

  const requiredFieldsValid = (step: number) => {
    const values = formValues;
    switch (step) {
      case 1:
        return !!values.policyId && !!values.incidentType;
      case 2:
        return !!values.incidentDate && values.description.trim().length >= 50;
      case 3:
        return !!values.claimAmount && !!values.currency && Number(values.claimAmount) > 0;
      case 4:
        return (
          values.documents.length > 0 &&
          CLAIM_DOCUMENT_TYPES_REQUIRED.every((typeId) => values.documentTypes[typeId] === true)
        );
      case 5:
        return values.agreedToTerms && values.confirmAccuracy;
      default:
        return false;
    }
  };

  const isStepValid = (step: number) => !hasStepErrors(step) && requiredFieldsValid(step);

  const canProceedToStep = (targetStep: number) => {
    if (targetStep <= currentStep) return true;
    for (let i = 1; i < targetStep; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  };

  const goToStep = useCallback(
    (step: number) => {
      if (canProceedToStep(step)) {
        setCurrentStep(step);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep]
  );

  const handleNext = async () => {
    if (currentStep >= steps.length) return;
    const valid = await trigger(STEP_FIELDS[currentStep - 1]);
    if (valid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    clearError();

    const result = await executeTransaction(
      async () => {
        // Send data to the API for server-side validation and creation
        const claim = await createClaimMutation.mutateAsync({
          request: {
            policyId: data.policyId,
            incidentType: data.incidentType,
            amount: parseFloat(data.claimAmount),
            description: data.description,
            evidence: data.documents.map((doc) => doc.name),
          },
          policyName: selectedPolicy?.name ?? data.policyId,
        });

        const newClaimId =
          claim.id ||
          `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`;
        setClaimId(newClaimId);
        return newClaimId;
      },
      {
        action: 'claim_submission',
        policyId: data.policyId,
        claimAmount: data.claimAmount,
        documentCount: data.documents.length,
      }
    );

    if (result) {
      resetToInitial();
      setIsSuccess(true);
      showSuccessNotification('Claim submitted successfully!', 'success');
    }
  });

  const handleStartOver = () => {
    resetToInitial();
    setIsSuccess(false);
    setClaimId('');
  };

  const getProgress = () => (currentStep / steps.length) * 100;

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20 ring-1 ring-green-500/50" aria-hidden="true">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Claim Submitted Successfully!</h2>
            <p className="text-slate-400">
              Your claim has been received and is being processed.
              <br />
              Reference ID: <span className="font-mono text-cyan-400">{claimId}</span>
            </p>
          </div>

          <Card className="p-6 bg-slate-800/50 border-slate-700 w-full max-w-md">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What&apos;s Next?</h3>
              <ul className="text-sm text-slate-400 space-y-2 text-left">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Confirmation email sent to your registered address</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Initial review within 2-3 business days</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>You can track progress in your dashboard</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Processing typically takes 5-10 business days</span>
                </li>
              </ul>
            </div>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/claims')}>
              View All Claims
            </Button>
            <Button type="button" onClick={handleStartOver}>
              Submit Another Claim
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              File a New Claim
            </h1>
            <p className="text-lg text-slate-400">
              Complete the form step by step to submit your insurance claim.
            </p>
          </div>

          {/* Draft Notice */}
          {isDraft && (
            <Card className="p-4 bg-orange-500/5 border-orange-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-400">Draft Restored</p>
                    <p className="text-xs text-slate-400">Your previous progress has been restored. Continue where you left off.</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={resetToInitial}>
                  Discard Draft
                </Button>
              </div>
            </Card>
          )}

          {/* Submission errors */}
          {submitError && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 md:p-6 shadow-xl"
            >
              <div className="flex gap-3">
                <svg
                  className="h-6 w-6 flex-shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500">{submitError.title}</h3>
                  <p className="mt-1 text-sm text-red-400">{submitError.message}</p>
                  {submitError.remediationStep && (
                    <p className="mt-2 text-sm text-red-300">{submitError.remediationStep}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  aria-label="Dismiss submission error"
                  className="flex-shrink-0 text-red-400 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:rounded"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Progress Stepper */}
          <ProgressStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
            canNavigate={canProceedToStep}
          />

          {/* Form Content */}
          <Card className="p-6 sm:p-8 bg-slate-900/40 border-white/5 backdrop-blur-sm">
            {currentStep === 1 && <PolicySelectionStep />}

            {currentStep === 2 && <IncidentDetailsStep />}

            {currentStep === 3 && <ClaimAmountStep />}

            {currentStep === 4 && <DocumentUploadStep />}

            {currentStep === 5 && <ReviewSubmitStep isSubmitting={isSubmitting} />}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto-save indicator */}
              {persistence.lastSavedAt && (
                <span className="hidden sm:inline text-xs text-slate-500">
                  {formatLastSaved(persistence.lastSavedAt)}
                </span>
              )}

              {/* Progress indicator */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400" aria-hidden="true">
                <span>Step {currentStep} of {steps.length}</span>
                <div className="w-24 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                <span>{Math.round(getProgress())}%</span>
              </div>

              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep) || isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isStepValid(currentStep)}
                  isLoading={isSubmitting}
                >
                  Submit Claim
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};