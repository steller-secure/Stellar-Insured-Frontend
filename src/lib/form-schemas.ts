import { z } from "zod";
import { validateWalletFunded } from "@/lib/walletValidation";

export const stellarAddressSchema = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, "Please enter a valid Stellar address");

export const signinSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SigninFormValues = z.infer<typeof signinSchema>;

const passwordFieldSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter");

export const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    password: passwordFieldSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupFormValues = z.infer<typeof signupSchema>;

export const policyPurchaseSchema = z.object({
  walletAddress: stellarAddressSchema,
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
});
export type PolicyPurchaseFormValues = z.infer<typeof policyPurchaseSchema>;

/**
 * Async variant of `policyPurchaseSchema` that additionally verifies the
 * connected Stellar account is funded before purchase can proceed. The network
 * check only runs once the address passes the synchronous format rules. When
 * Horizon is unreachable the check fails open so infrastructure issues never
 * block a purchase; only a definitively unfunded account is rejected.
 */
export const policyPurchaseSchemaAsync = policyPurchaseSchema.superRefine(
  async (data, ctx) => {
    if (!data.walletAddress) return;
    const { funded, error } = await validateWalletFunded(data.walletAddress);
    if (funded) return;
    if (error === "Network request to Horizon failed" || error?.startsWith("Horizon returned")) {
      return;
    }
    ctx.addIssue({
      code: "custom",
      path: ["walletAddress"],
      message: error ?? "Wallet must be funded to activate coverage",
    });
  },
);

export const CLAIM_EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;
export const CLAIM_EVIDENCE_ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
];

export interface ClaimPolicyContext {
  coverageLimit?: number;
  coverageLimitFormatted?: string;
}

/**
 * Reads the currently selected claim policy's coverage details at validation
 * time. RHF caches the resolver at mount, so the coverage limit must be read
 * lazily rather than baked into the schema.
 */
let activeClaimPolicy: ClaimPolicyContext | null = null;

export function setClaimPolicy(policy?: ClaimPolicyContext | null) {
  activeClaimPolicy = policy ?? null;
}

function claimCoverageExceeded(amount: string): { exceeded: boolean; message?: string } {
  const coverageLimit = activeClaimPolicy?.coverageLimit;
  if (typeof coverageLimit !== "number") return { exceeded: false };
  const value = Number(amount);
  if (!Number.isNaN(value) && value > coverageLimit) {
    return {
      exceeded: true,
      message: `Amount cannot exceed the policy limit of ${
        activeClaimPolicy?.coverageLimitFormatted ?? coverageLimit
      }`,
    };
  }
  return { exceeded: false };
}

export const claimSchema = z
  .object({
    policyId: z.string().min(1, "Please select a policy"),
    amount: z
      .string()
      .min(1, "Please enter a claim amount")
      .refine((value) => Number(value) > 0, {
        message: "Claim amount must be greater than 0",
      })
      .refine((value) => Number.isFinite(Number(value)), {
        message: "Claim amount must be a valid number",
      }),
    description: z
      .string()
      .trim()
      .min(1, "Please provide a description of the incident")
      .min(20, "Description must be at least 20 characters"),
    evidence: z
      .custom<File | null>(
        (value) => value === null || value instanceof File,
        { message: "Please upload supporting evidence" },
      )
      .refine(
        (file) => file === null || file.size <= CLAIM_EVIDENCE_MAX_BYTES,
        { message: "Evidence file must be 10MB or smaller" },
      )
      .refine(
        (file) => file === null || CLAIM_EVIDENCE_ALLOWED_TYPES.includes(file.type),
        { message: "Only PDF, PNG or JPG files are allowed" },
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.amount) return;
    const { exceeded, message } = claimCoverageExceeded(data.amount);
    if (exceeded) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: message ?? "Amount exceeds the policy coverage limit",
      });
    }
  });
export type ClaimFormValues = z.infer<typeof claimSchema>;

export function createClaimSchema(policy?: ClaimPolicyContext | null) {
  const base = claimSchema;
  const coverageLimit = policy?.coverageLimit;
  if (typeof coverageLimit !== "number") {
    return base;
  }
  return base.superRefine((data, ctx) => {
    if (!data.amount) return;
    const amount = Number(data.amount);
    if (!Number.isNaN(amount) && amount > coverageLimit) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: `Amount cannot exceed the policy limit of ${
          policy?.coverageLimitFormatted ?? coverageLimit
        }`,
      });
    }
  });
}

export const proposalTypeSchema = z.enum(
  ["UPGRADE", "FUNDING", "PARAMETER_CHANGE"],
  { errorMap: () => ({ message: "Please select a proposal type" }) },
);

export const CLAIM_DOCUMENT_TYPES_REQUIRED = [
  "incident-report",
  "proof-of-loss",
  "identity-verification",
] as const;

let activeMultiStepClaimPolicy: ClaimPolicyContext | null = null;

/**
 * Feeds the currently selected policy's coverage details into
 * `multiStepClaimSchema` at validation time. RHF caches the resolver at mount,
 * so the coverage limit must be read lazily rather than baked into the schema.
 */
export function setMultiStepClaimPolicy(policy?: ClaimPolicyContext | null) {
  activeMultiStepClaimPolicy = policy ?? null;
}

export const multiStepClaimSchema = z
  .object({
    policyId: z.string().min(1, "Please select a policy"),
    incidentType: z.string().min(1, "Please select an incident type"),
    incidentDate: z.string().min(1, "Please provide the incident date"),
    incidentTime: z.string(),
    location: z.string(),
    description: z
      .string()
      .trim()
      .min(1, "Please provide a detailed description")
      .min(50, "Description must be at least 50 characters"),
    immediateActions: z.string(),
    claimAmount: z
      .string()
      .min(1, "Please enter the claim amount")
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        { message: "Please enter a valid amount greater than 0" },
      ),
    estimatedLoss: z.string(),
    currency: z.string().min(1, "Please select a currency"),
    breakdown: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        amount: z.string(),
      }),
    ),
    documents: z
      .array(z.custom<File>((value) => value instanceof File, { message: "Invalid file" }))
      .refine((files) => files.length > 0, {
        message: "Please upload at least one supporting document",
      }),
    documentTypes: z.record(z.string(), z.boolean()),
    agreedToTerms: z.boolean(),
    confirmAccuracy: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.incidentDate) {
      const incidentDate = new Date(data.incidentDate);
      if (!Number.isNaN(incidentDate.getTime()) && incidentDate > new Date()) {
        ctx.addIssue({
          code: "custom",
          path: ["incidentDate"],
          message: "Incident date cannot be in the future",
        });
      }
    }

    const hasRequiredDocTypes = CLAIM_DOCUMENT_TYPES_REQUIRED.every(
      (typeId) => data.documentTypes[typeId] === true,
    );
    if (!hasRequiredDocTypes) {
      ctx.addIssue({
        code: "custom",
        path: ["documentTypes"],
        message: "Please confirm you have the required document types",
      });
    }

    if (data.agreedToTerms !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["agreedToTerms"],
        message: "You must agree to the terms and conditions",
      });
    }

    if (data.confirmAccuracy !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmAccuracy"],
        message: "You must confirm the accuracy of the information",
      });
    }

    const coverageLimit = activeMultiStepClaimPolicy?.coverageLimit;
    if (typeof coverageLimit === "number" && data.claimAmount) {
      const amount = Number(data.claimAmount);
      if (!Number.isNaN(amount) && amount > coverageLimit) {
        ctx.addIssue({
          code: "custom",
          path: ["claimAmount"],
          message: `Amount cannot exceed the policy limit of ${
            activeMultiStepClaimPolicy?.coverageLimitFormatted ?? coverageLimit
          }`,
        });
      }
    }
  });
export type MultiStepClaimFormValues = z.infer<typeof multiStepClaimSchema>;

export const proposalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Proposal title is required")
    .min(5, "Proposal title must be at least 5 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Proposal description is required")
    .min(10, "Proposal description must be at least 10 characters"),
  type: proposalTypeSchema,
});
export type ProposalFormValues = z.infer<typeof proposalSchema>;