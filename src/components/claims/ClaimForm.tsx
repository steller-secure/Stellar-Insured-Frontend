'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { mockPolicies } from '@/data/mockData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const ClaimForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        policyId: '',
        amount: '',
        description: '',
        evidence: null as File | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Derived state
    const selectedPolicy = mockPolicies.find((p) => p.id === formData.policyId);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.policyId) newErrors.policyId = 'Please select a policy';

        if (!formData.amount) {
            newErrors.amount = 'Please enter a claim amount';
        } else if (Number(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (selectedPolicy && Number(formData.amount) > selectedPolicy.coverageLimit) {
            newErrors.amount = `Amount cannot exceed policy limit of ${selectedPolicy.coverageLimitFormatted}`;
        }

        if (!formData.description) {
            newErrors.description = 'Please provide a description of the incident';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        if (!formData.evidence) {
            newErrors.evidence = 'Please upload supporting evidence';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSuccess(true);
    };

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
                        Reference ID: <span className="font-mono text-cyan-400">CLM-{Math.floor(Math.random() * 10000)}</span>
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

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 animate-slide-up">
            <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    File a New Claim
                </h1>
                <p className="text-lg text-slate-400">
                    Please provide details about the incident. Our team will review your submission shortly.
                </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm sm:p-8 space-y-6 shadow-xl">
                {/* Policy Selection */}
                <Select
                    label="Select Policy"
                    placeholder="Choose a policy..."
                    options={mockPolicies.map(p => ({
                        value: p.id,
                        label: `${p.name} (${p.policyNumber}) - Coverage: ${p.coverageLimitFormatted}`
                    }))}
                    value={formData.policyId}
                    onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                    error={errors.policyId}
                />

                {/* Amount Input */}
                <div className="relative">
                    <Input
                        label="Claim Amount (USD)"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        error={errors.amount}
                        helperText={selectedPolicy ? `Available coverage: ${selectedPolicy.coverageLimitFormatted}` : undefined}
                    />
                </div>

                {/* Description */}
                <Textarea
                    label="Incident Description"
                    placeholder="Please describe what happened, when, and where..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    error={errors.description}
                />

                {/* File Upload */}
                <FileUpload
                    label="Supporting Evidence"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(file) => setFormData({ ...formData, evidence: file })}
                    error={errors.evidence}
                />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <Link href="/" className="sm:order-first">
                    <Button type="button" variant="outline" fullWidth className="sm:w-auto">
                        Cancel
                    </Button>
                </Link>
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    fullWidth
                    className="sm:w-auto min-w-[160px]"
                >
                    Submit Claim
                </Button>
            </div>
        </form>
    );
};
