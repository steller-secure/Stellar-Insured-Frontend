'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { ProgressStepper, type Step } from '@/components/ui/ProgressStepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Step Components
import { PolicySelectionStep, type PolicySelectionData } from './steps/PolicySelectionStep';
import { IncidentDetailsStep, type IncidentDetailsData } from './steps/IncidentDetailsStep';
import { ClaimAmountStep, type ClaimAmountData } from './steps/ClaimAmountStep';
import { DocumentUploadStep, type DocumentUploadData } from './steps/DocumentUploadStep';
import { ReviewSubmitStep, type ReviewSubmitData } from './steps/ReviewSubmitStep';

// Combined form data type
export interface MultiStepClaimFormData extends 
  PolicySelectionData, 
  IncidentDetailsData, 
  ClaimAmountData, 
  DocumentUploadData, 
  ReviewSubmitData {}

const initialFormData: MultiStepClaimFormData = {
  // Policy Selection
  policyId: '',
  incidentType: '',
  
  // Incident Details
  incidentDate: '',
  incidentTime: '',
  location: '',
  description: '',
  immediateActions: '',
  
  // Claim Amount
  claimAmount: '',
  estimatedLoss: '',
  currency: 'USD',
  breakdown: [],
  
  // Document Upload
  documents: [],
  documentTypes: {},
  
  // Review & Submit
  agreedToTerms: false,
  confirmAccuracy: false
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

export const MultiStepClaimForm: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimId, setClaimId] = useState<string>('');

  const {
    currentStep,
    formData,
    isDraft,
    updateFormData,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    clearDraft,
    isStepValid,
    canProceedToStep,
    getProgress,
    isFirstStep,
    isLastStep
  } = useMultiStepForm<MultiStepClaimFormData>(initialFormData, {
    totalSteps: 5,
    storageKey: 'multi-step-claim-draft',
    autoSave: true
  });

  const handleStepValidation = (stepNumber: number, validation: any) => {
    validateStep(stepNumber, validation);
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate claim ID
      const newClaimId = `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setClaimId(newClaimId);
      
      // Clear draft and show success
      clearDraft();
      setIsSuccess(true);
    } catch (error) {
      console.error('Claim submission failed:', error);
      // Handle error (show error message, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    resetForm();
    setIsSuccess(false);
    setClaimId('');
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20 ring-1 ring-green-500/50">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <h3 className="text-lg font-semibold text-white">What's Next?</h3>
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
            <Button variant="outline" onClick={() => router.push('/claims')}>
              View All Claims
            </Button>
            <Button onClick={handleStartOver}>
              Submit Another Claim
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
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
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-orange-400">Draft Restored</p>
              <p className="text-xs text-slate-400">Your previous progress has been restored. Continue where you left off.</p>
            </div>
          </div>
        </Card>
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
        {currentStep === 1 && (
          <PolicySelectionStep
            data={{
              policyId: formData.policyId,
              incidentType: formData.incidentType
            }}
            onDataChange={updateFormData}
            onValidation={(validation) => handleStepValidation(1, validation)}
          />
        )}

        {currentStep === 2 && (
          <IncidentDetailsStep
            data={{
              incidentDate: formData.incidentDate,
              incidentTime: formData.incidentTime,
              location: formData.location,
              description: formData.description,
              immediateActions: formData.immediateActions
            }}
            onDataChange={updateFormData}
            onValidation={(validation) => handleStepValidation(2, validation)}
          />
        )}

        {currentStep === 3 && (
          <ClaimAmountStep
            data={{
              claimAmount: formData.claimAmount,
              estimatedLoss: formData.estimatedLoss,
              currency: formData.currency,
              breakdown: formData.breakdown
            }}
            policyId={formData.policyId}
            onDataChange={updateFormData}
            onValidation={(validation) => handleStepValidation(3, validation)}
          />
        )}

        {currentStep === 4 && (
          <DocumentUploadStep
            data={{
              documents: formData.documents,
              documentTypes: formData.documentTypes
            }}
            onDataChange={updateFormData}
            onValidation={(validation) => handleStepValidation(4, validation)}
          />
        )}

        {currentStep === 5 && (
          <ReviewSubmitStep
            data={{
              agreedToTerms: formData.agreedToTerms,
              confirmAccuracy: formData.confirmAccuracy
            }}
            formData={formData}
            onDataChange={updateFormData}
            onValidation={(validation) => handleStepValidation(5, validation)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/claims')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
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
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep)}
              isLoading={isSubmitting}
            >
              Submit Claim
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};