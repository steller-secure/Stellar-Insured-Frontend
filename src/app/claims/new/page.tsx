import React from 'react';
import { MultiStepClaimForm } from '@/components/claims/MultiStepClaimForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'File a Claim | Stellar Insured',
    description: 'Submit a new insurance claim with our guided multi-step process.',
};

export default function NewClaimPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <MultiStepClaimForm />
        </div>
    );
}
