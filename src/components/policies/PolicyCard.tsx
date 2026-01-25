"use client";
import Link from "next/link";
import { Policy } from "@/types/policy";

interface PolicyCardProps {
  policy: Policy;
}

export const PolicyCard = ({ policy }: PolicyCardProps) => {
  return (
    <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold leading-tight max-w-[70%]">
          {policy.name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            policy.status === "active"
              ? "bg-brand-accent/20 text-brand-accent"
              : policy.status === "pending"
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-red-500/20 text-red-500"
          }`}
        >
          {policy.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-4 text-sm">
        <div>
          <p className="text-brand-text-muted mb-1 uppercase text-[10px] font-bold tracking-widest">
            Asset Protection
          </p>
          <p className="text-lg font-bold">Coverage</p>
          <p className="text-xl font-black">
            ${policy.coverage.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-brand-text-muted mb-1 invisible">Space</p>
          <p className="text-lg font-bold">Premium</p>
          <p className="text-xl font-black">${policy.premium}/month</p>
        </div>
        <div>
          <p className="text-brand-text-muted mb-1 font-bold">Expiry</p>
          <p className="font-bold">{policy.expiryDate}</p>
        </div>
        <div>
          <p className="text-brand-text-muted mb-1 font-bold">Policy ID</p>
          <p className="font-bold">{policy.policyId}</p>
        </div>
      </div>

      <Link
        href={`/policies/${policy.id}`}
        className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-heavy py-3 rounded-lg text-center transition-colors font-bold uppercase text-sm tracking-wider"
      >
        View Details
      </Link>
    </div>
  );
};
