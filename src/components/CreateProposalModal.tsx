"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proposalService } from "@/services/proposalService";
import type { Proposal } from "@/types/proposal";
import {
  proposalSchema,
  type ProposalFormValues,
} from "@/lib/form-schemas";
import { FormInput } from "@/components/ui/rhf/FormInput";
import { FormTextarea } from "@/components/ui/rhf/FormTextarea";
import { FormSelect } from "@/components/ui/rhf/FormSelect";
import { FormSummaryError } from "@/components/ui/rhf/FormSummaryError";

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (proposal: Proposal) => void;
}

const proposalTypeOptions = [
  { value: "UPGRADE", label: "Upgrade" },
  { value: "FUNDING", label: "Funding" },
  { value: "PARAMETER_CHANGE", label: "Parameter Change" },
];

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isDirty, isValid },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    mode: "onChange",
    defaultValues: { title: "", description: "", type: "UPGRADE" },
  });

  if (!isOpen) return null;

  const rootError = (errors.root as { message?: string } | undefined)?.message;
  const submitDisabled = isSubmitting || !isDirty || !isValid;

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    clearErrors("root");
    try {
      const proposal = proposalService.createProposal({
        title: data.title,
        description: data.description,
        type: data.type,
        author: "currentUser",
      });
      onCreated(proposal);
      onClose();
    } catch {
      setError("root", {
        message: "Failed to create proposal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="modal">
      <h2 className="text-xl font-semibold mb-4">Create Proposal</h2>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormSummaryError
          message={rootError}
          id="create-proposal-summary-error"
        />

        <FormInput
          name="title"
          control={control}
          label="Proposal Title"
          required
          placeholder="Title"
          disabled={isSubmitting}
        />

        <FormTextarea
          name="description"
          control={control}
          label="Description"
          required
          placeholder="Description"
          disabled={isSubmitting}
        />

        <FormSelect
          name="type"
          control={control}
          label="Proposal Type"
          required
          options={proposalTypeOptions}
          disabled={isSubmitting}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitDisabled}
            className={`bg-[#22BBF9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#22BBF9]/90 transition-all ${
              submitDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg font-medium border border-gray-700 text-gray-300 hover:bg-gray-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};