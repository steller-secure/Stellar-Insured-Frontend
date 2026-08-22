"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { type Policy } from '@/types/api';
import Link from 'next/link';
import { useLoading } from '@/contexts/LoadingContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDataFetchList } from '@/hooks/useDataFetch';
import { DataService } from '@/config/dataSource';
import { LoadingState } from '@/components/ui/SkeletonLoaders';
import { FormInput } from '@/components/ui/rhf/FormInput';
import { FormSelect } from '@/components/ui/rhf/FormSelect';
import { FormTextarea } from '@/components/ui/rhf/FormTextarea';
import { FormFileUpload } from '@/components/ui/rhf/FormFileUpload';
import {
  claimSchema,
  setClaimPolicy,
  type ClaimFormValues,
} from '@/lib/form-schemas';

// ─── Component ─────────────────────────────────────────────────────────────────

export const ClaimForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { loading, startLoading, stopLoading } = useLoading();
  const {
    executeWithErrorHandling,
    error: submitError,
    clearError,
    showSuccessNotification,
  } = useErrorHandler({
    autoLog: true,
    showNotifications: true,
  });

  // Fetch policies with loading state
  const {
    items: policies,
    loading: policiesLoading,
    error: policiesError,
  } = useDataFetchList(
    () => DataService.getPolicies(),
    { cacheDuration: 10 * 60 * 1000 }, // Cache for 10 minutes
  );

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isDirty, isValid },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    mode: 'onChange',
    defaultValues: { policyId: '', amount: '', description: '', evidence: null },
  });

  // Derived state — the schema reads the selected policy's coverage limit
  // lazily, so feed it in whenever the watched policy changes and re-validate
  // the claim amount so the coverage-limit check stays in sync with RHF.
  const selectedPolicyId = useWatch({ control, name: 'policyId' });
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  useEffect(() => {
    setClaimPolicy(
      selectedPolicy
        ? {
            coverageLimit: selectedPolicy.coverageLimit,
            coverageLimitFormatted: selectedPolicy.coverageLimitFormatted,
          }
        : null
    );
    if (selectedPolicy) {
      void trigger('amount');
    }
  }, [selectedPolicy, trigger]);

  const submitDisabled = loading || !isDirty || !isValid;

  const onSubmit = handleSubmit(async (data) => {
    clearError();
    startLoading();

    const result = await executeWithErrorHandling(
      async () => {
        // Simulate API call to submit claim
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate successful submission
        return {
          refNo: `CLM-${Math.floor(Math.random() * 10000)}`,
          status: "pending",
        };
      },
      "SYSTEM",
      "CLAIM_SUBMISSION_FAILED",
      {
        policyId: data.policyId,
        amount: data.amount,
      }
    );

    stopLoading();

    if (result) {
      showSuccessNotification("Claim submitted successfully!");
      setIsSuccess(true);
    }
  });

  // ── Success state ─────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20 ring-1 ring-green-500/50"
          aria-hidden="true"
        >
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Claim Submitted Successfully!
          </h2>
          <p className="text-slate-400">
            Your claim for{" "}
            <span className="text-white font-medium">
              {selectedPolicy?.name}
            </span>{" "}
            has been received.
            <br />
            Reference ID:{" "}
            <span className="font-mono text-cyan-400">
              CLM-{Math.floor(Math.random() * 10000)}
            </span>
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>
            Submit Another Claim
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8 animate-slide-up" noValidate aria-labelledby="claim-form-heading" aria-describedby="claim-form-description">
      <div className="space-y-2 text-center sm:text-left">
        <h1
          id="claim-form-heading"
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          File a New Claim
        </h1>
        <p id="claim-form-description" className="text-lg text-slate-400">
          Please provide details about the incident. Our team will review your
          submission shortly.
        </p>
      </div>

      {/* Display submission errors */}
      {submitError && (
        <div
          role="alert"
          aria-live="polite"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500">Submission Failed</h3>
              <p className="mt-1 text-sm text-red-400">{submitError.message}</p>
              {submitError.recoverySuggestion && (
                <p className="mt-2 text-sm text-red-300">
                  {submitError.recoverySuggestion}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="flex-shrink-0 text-red-400 hover:text-red-300"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Show loading state while fetching policies */}
      {policiesLoading ? (
        <LoadingState message="Loading your policies..." />
      ) : policiesError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
        >
          <p className="text-red-400">
            Failed to load policies. Please try again.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm sm:p-8 space-y-6 shadow-xl">
          {/* Policy Selection */}
          <FormSelect
            name="policyId"
            control={control}
            id="claim-policy"
            label="Select Policy"
            placeholder="Choose a policy..."
            required
            options={policies.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.policyNumber}) - Coverage: ${p.coverageLimitFormatted}`,
            }))}
          />

          {/* Claim Amount */}
          <FormInput
            name="amount"
            control={control}
            id="claim-amount"
            label="Claim Amount (USD)"
            type="number"
            placeholder="0.00"
            required
            helperText={
              selectedPolicy
                ? `Available coverage: ${selectedPolicy.coverageLimitFormatted}`
                : undefined
            }
          />

          {/* Incident Description */}
          <FormTextarea
            name="description"
            control={control}
            id="claim-description"
            label="Incident Description"
            placeholder="Please describe what happened, when, and where..."
            required
          />

          {/* File Upload */}
          <FormFileUpload
            name="evidence"
            control={control}
            label="Supporting Evidence"
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Link href="/" className="sm:order-first">
          <Button
            type="button"
            variant="outline"
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          isLoading={loading}
          disabled={submitDisabled}
          fullWidth
          className="sm:w-auto min-w-40"
        >
          Submit Claim
        </Button>
      </div>
    </form>
  );
};
