import React from "react";
import { MultiStepClaimForm } from "@/components/claims/MultiStepClaimForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata.newClaim;

export default function NewClaimPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <MultiStepClaimForm />
        </div>
    );
}
