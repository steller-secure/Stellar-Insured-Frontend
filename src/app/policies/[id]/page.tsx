"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

import { mockPolicies } from "@/data/mockPolicies";
import {
  ArrowLeft,
  Shield,
  Clock,
  FileCheck,
  AlertCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policy = mockPolicies.find((p) => p.id === params.id);

  if (!policy) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <h2 className="text-2xl font-bold">Policy Not Found</h2>
          <button
            onClick={() => router.push("/policies")}
            className="text-brand-primary hover:underline"
          >
            Back to Policies
          </button>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors self-start"
        >
          <ArrowLeft size={20} />
          Back to Policies
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{policy.name}</h1>
            <p className="text-brand-text-muted flex items-center gap-2">
              <span className="font-mono">{policy.policyId}</span>
              <span className="opacity-50">|</span>
              <span
                className={`capitalize font-bold ${
                  policy.status === "active"
                    ? "text-brand-accent"
                    : policy.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {policy.status}
              </span>
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-6 py-2 rounded-lg font-bold hover:bg-brand-primary/20 transition-colors">
              <RefreshCw size={20} />
              Renew Policy
            </button>
            <button className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2 rounded-lg font-bold hover:bg-red-500/20 transition-colors">
              <XCircle size={20} />
              Cancel Policy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card p-6 rounded-xl border border-brand-border">
            <div className="text-brand-primary mb-4">
              <Shield size={32} />
            </div>
            <p className="text-brand-text-muted text-sm uppercase font-bold tracking-wider mb-1">
              Total Coverage
            </p>
            <p className="text-3xl font-black">
              ${policy.coverage.toLocaleString()}
            </p>
          </div>
          <div className="bg-brand-card p-6 rounded-xl border border-brand-border">
            <div className="text-brand-primary mb-4">
              <FileCheck size={32} />
            </div>
            <p className="text-brand-text-muted text-sm uppercase font-bold tracking-wider mb-1">
              Monthly Premium
            </p>
            <p className="text-3xl font-black">${policy.premium}</p>
          </div>
          <div className="bg-brand-card p-6 rounded-xl border border-brand-border">
            <div className="text-brand-primary mb-4">
              <Clock size={32} />
            </div>
            <p className="text-brand-text-muted text-sm uppercase font-bold tracking-wider mb-1">
              Expiry Date
            </p>
            <p className="text-3xl font-black truncate">{policy.expiryDate}</p>
          </div>
        </div>

        <div className="bg-brand-card p-8 rounded-xl border border-brand-border">
          <h3 className="text-2xl font-bold mb-4">Policy Description</h3>
          <p className="text-lg text-brand-text-muted leading-relaxed mb-8">
            {policy.description}
          </p>

          <h3 className="text-2xl font-bold mb-4">Terms & Conditions</h3>
          <ul className="space-y-4">
            {policy.terms.map((term, index) => (
              <li key={index} className="flex gap-4 items-start">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                <p className="text-brand-text-muted">{term}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
  );
}
