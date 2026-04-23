'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { type Policy } from '@/data/mockData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useLoading } from '@/contexts/LoadingContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDataFetchList } from '@/hooks/useDataFetch';
import { DataService } from '@/config/dataSource';
import { LoadingState } from '@/components/ui/SkeletonLoaders';
import {
  required,
  positiveNumber,
  minLength,
  requiredFile,
  allowedFileTypes,
  maxFileSize,
} from '@/lib/validators';

// ─── Form shape ────────────────────────────────────────────────────────────────

// extends Record<string, unknown> satisfies the hook's generic constraint
// without breaking the individual field types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ClaimFormData extends Record<string, any> {
  policyId: string;
  amount: string;
  description: string;
  evidence: File | null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const ClaimForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<ClaimFormData>({
    policyId: '',
    amount: '',
    description: '',
    evidence: null,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const { loading, startLoading, stopLoading } = useLoading();
  const { 
    executeWithErrorHandling, 
    error: submitError, 
    clearError,
    showSuccessNotification 
  } = useErrorHandler({
    autoLog: true,
    showNotifications: true,
  });

  // Fetch policies with loading state
  const { items: policies, loading: policiesLoading, error: policiesError } = useDataFetchList(
    () => DataService.getPolicies(),
    { cacheDuration: 10 * 60 * 1000 } // Cache for 10 minutes
  );

  // Derived state — used in conditional validation for the amount field
  const selectedPolicy = policies.find((p) => p.id === formData.policyId);

  // ── Validation rules ──────────────────────────────────────────────────────────

  const { errors, touched, validate, validateField, handleBlur } =
    useFormValidation<ClaimFormData>({
      policyId: [
        required('Please select a policy'),
      ],
      amount: [
        required('Please enter a claim amount'),
        positiveNumber('Amount must be greater than 0'),
        // Conditional rule: only enforces coverage limit when a policy is selected
        (value) =>
          selectedPolicy && Number(value) > selectedPolicy.coverageLimit
            ? `Amount cannot exceed policy limit of ${selectedPolicy.coverageLimitFormatted}`
            : null,
      ],
      description: [
        required('Please provide a description of the incident'),
        minLength(20, 'Description must be at least 20 characters'),
      ],
      evidence: [
        requiredFile('Please upload supporting evidence'),
        allowedFileTypes(
          ['application/pdf', 'image/png', 'image/jpeg'],
          'Only PDF, PNG or JPG files are allowed'
        ),
        maxFileSize(10 * 1024 * 1024, 'File must be under 10MB'),
      ],
    });

  // ── Handlers ──────────────────────────────────────────────────────────────────

  /**
   * Updates a text/select field and re-validates in real-time
   * only if the field has already been touched (to avoid premature errors).
   */
  const handleChange = (field: keyof ClaimFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value as ClaimFormData[typeof field]);
    }
  };

  /**
   * Updates the file field and validates immediately since file inputs
   * don't have a separate blur event like text fields do.
   */
  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, evidence: file }));
    validateField('evidence', file);
  };

  /**
   * Runs full form validation on submit.
   * validate() marks all fields as touched so all errors show at once.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(formData)) return;

    clearError();
    startLoading();
    
    const result = await executeWithErrorHandling(
      async () => {
        // Simulate API call to submit claim
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Simulate successful submission
        return {
          refNo: `CLM-${Math.floor(Math.random() * 10000)}`,
          status: 'pending',
        };
      },
      'SYSTEM',
      'CLAIM_SUBMISSION_FAILED',
      {
        policyId: formData.policyId,
        amount: formData.amount,
      }
    );

    stopLoading();

    if (result) {
      showSuccessNotification('Claim submitted successfully!');
      setIsSuccess(true);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20 ring-1 ring-green-500/50">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Claim Submitted Successfully!</h2>
          <p className="text-slate-400">
            Your claim for <span className="text-white font-medium">{selectedPolicy?.name}</span> has been received.
            <br />
            Reference ID:{' '}
            <span className="font-mono text-cyan-400">CLM-{Math.floor(Math.random() * 10000)}</span>
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Submit Another Claim</Button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 animate-slide-up" noValidate aria-labelledby="claim-form-heading" aria-describedby="claim-form-description">
      <div className="space-y-2 text-center sm:text-left">
        <h1 id="claim-form-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          File a New Claim
        </h1>
        <p id="claim-form-description" className="text-lg text-slate-400">
          Please provide details about the incident. Our team will review your submission shortly.
        </p>
      </div>

      {/* Display submission errors */}
      {submitError && (
        <div role="alert" aria-live="polite" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 md:p-6 shadow-xl">
          <div className="flex gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500">Submission Failed</h3>
              <p className="mt-1 text-sm text-red-400">{submitError.message}</p>
              {submitError.recoverySuggestion && (
                <p className="mt-2 text-sm text-red-300">{submitError.recoverySuggestion}</p>
              )}
            </div>
            <button
              type="button"
              onClick={clearError}
              className="flex-shrink-0 text-red-400 hover:text-red-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Show loading state while fetching policies */}
      {policiesLoading ? (
        <LoadingState message="Loading your policies..." />
      ) : policiesError ? (
        <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">Failed to load policies. Please try again.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm sm:p-8 space-y-6 shadow-xl">

          {/* Policy Selection */}
          <Select
            label="Select Policy"
            placeholder="Choose a policy..."
            required
            options={policies.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.policyNumber}) - Coverage: ${p.coverageLimitFormatted}`,
            }))}
            value={formData.policyId}
            onChange={(e) => handleChange('policyId', e.target.value)}
            onBlur={() => handleBlur('policyId', formData.policyId)}
            error={touched.policyId ? errors.policyId : undefined}
            state={
              touched.policyId && errors.policyId
                ? 'error'
                : touched.policyId && formData.policyId
                ? 'success'
                : 'default'
            }
          />

        {/* Claim Amount */}
        <div className="relative">
          <Input
            label="Claim Amount (USD)"
            type="number"
            placeholder="0.00"
            required
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            onBlur={() => handleBlur('amount', formData.amount)}
            error={touched.amount ? errors.amount : undefined}
            helperText={
              selectedPolicy
                ? `Available coverage: ${selectedPolicy.coverageLimitFormatted}`
                : undefined
            }
            state={
              touched.amount && errors.amount
                ? 'error'
                : touched.amount && formData.amount && !errors.amount
                ? 'success'
                : 'default'
            }
          />
        </div>

        {/* Incident Description */}
        <Textarea
          label="Incident Description"
          placeholder="Please describe what happened, when, and where..."
          required
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description', formData.description)}
          error={touched.description ? errors.description : undefined}
          state={
            touched.description && errors.description
              ? 'error'
              : touched.description && formData.description.length >= 20
              ? 'success'
              : 'default'
          }
        />

        {/* File Upload */}
        <FileUpload
          label="Supporting Evidence"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          error={errors.evidence}
        />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Link href="/" className="sm:order-first">
          <Button type="button" variant="outline" fullWidth className="sm:w-auto">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          isLoading={loading}
          fullWidth
          className="sm:w-auto min-w-40"
        >
          Submit Claim
        </Button>
      </div>
    </form>
  );
};