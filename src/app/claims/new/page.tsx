import React from 'react';
import { ClaimForm } from '@/components/claims/ClaimForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'File a Claim | Stellar Insured',
    description: 'Submit a new insurance claim clearly and securely.',
};

export default function NewClaimPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <ClaimForm />
        </div>
    );
}
