"use client";

import React, { useEffect, useRef, useState } from "react";
import { PolicyPlan } from "@/data/policies/listing/policy-plans-mock";
import {
  MOCK_TX_HASH,
  MOCK_WALLET_ADDRESS,
  PolicyPurchasePayload,
  STELLAR_EXPLORER_TX_URL,
} from "@/data/policies/listing/policy-purchase-flow-mock";

type PolicyPurchaseEntryModalProps = {
  isOpen: boolean;
  plan: PolicyPlan | null;
  onClose: () => void;
  onConfirm: (payload: PolicyPurchasePayload) => void;
};
// Temporary mock flag to check the Error modal. Replace with actual backend error states.
const SHOULD_SIMULATE_ERROR = false;

type PurchaseStatus = "review" | "signing" | "submitting" | "confirming" | "success" | "error";

const formatWalletAddress = (address: string, visibleStart = 3, visibleEnd = 3, maskChar = "x") => {
  if (address.length <= visibleStart + visibleEnd) return address;
  const maskLength = address.length - visibleStart - visibleEnd;
  return `${address.slice(0, visibleStart)}${maskChar.repeat(maskLength)}${address.slice(-visibleEnd)}`;
};

const formatTxHash = (hash: string, visibleStart = 8, visibleEnd = 8) => {
  if (hash.length <= visibleStart + visibleEnd + 3) return hash;
  return `${hash.slice(0, visibleStart)}...${hash.slice(-visibleEnd)}`;
};

export function PolicyPurchaseEntryModal({
  isOpen,
  plan,
  onClose,
  onConfirm,
}: PolicyPurchaseEntryModalProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<PurchaseStatus>("review");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setWalletAddress(null);
      setStatus("review");
      setErrorMessage(null);
      setTxHash(null);
      setIsCopied(false);
    } else {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    }
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [isOpen]);

  useEffect(() => {
    setIsCopied(false);
  }, [status, txHash]);

  if (!isOpen || !plan) return null;
  const isWalletConnected = Boolean(walletAddress);
  const isProcessing =
    status === "signing" || status === "submitting" || status === "confirming";
  const progressStep = status === "submitting" ? 1 : status === "confirming" ? 2 : 0;
  const stepClassName = (step: number) => {
    if (step < progressStep) return "text-emerald-300";
    if (step === progressStep) return "text-white";
    return "text-stone-500";
  };
  const indicatorClassName = (step: number) =>
    `h-2 w-2 rounded-full ${
      step === progressStep ? "bg-sky-400 animate-pulse" : "bg-sky-400 opacity-0"
    }`;
  const modalSizeClass =
    status === "review" ? "w-[560px] max-w-[92vw]" : "w-[420px] max-w-[92vw]";

  const startPurchaseFlow = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setErrorMessage(null);
    setTxHash(null);
    setStatus("signing");

    timersRef.current.push(
      window.setTimeout(() => {
        setStatus("submitting");
      }, 800)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setStatus("confirming");
      }, 1600)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        if (SHOULD_SIMULATE_ERROR) {
          setStatus("error");
          setErrorMessage("Insufficient XLM balance. Please top up your wallet and try again.");
        } else {
          setTxHash(MOCK_TX_HASH);
          setStatus("success");
        }
      }, 2400)
    );
  };

  const handleCopyTx = () => {
    const hash = txHash ?? MOCK_TX_HASH;
    if (!hash) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hash).then(() => setIsCopied(true));
      return;
    }
    setIsCopied(true);
  };

  const buildSuccessPayload = (hash: string): PolicyPurchasePayload => ({
    policyId: plan.categoryId,
    policyTitle: plan.name,
    planId: plan.id,
    planName: plan.name,
    policyNumber: plan.policyNumber,
    startDate: plan.startDate,
    endDate: plan.endDate,
    premiumAmount: plan.premiumAmount,
    premiumCurrency: plan.premiumCurrency,
    billingCadence: plan.billingCadence,
    duration: plan.duration,
    coverage: plan.coverage,
    deductible: plan.deductible,
    assetCode: plan.assetCode,
    assetIssuer: plan.assetIssuer,
    networkFeeXlm: plan.networkFeeXlm,
    walletAddress: walletAddress ?? "",
    txHash: hash,
    explorerUrl: `${STELLAR_EXPLORER_TX_URL}${hash}`,
    status: "success",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Purchase confirmation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className={`relative ${modalSizeClass} rounded-[10px] bg-[#101935] outline outline-1 outline-offset-[-1px] outline-[#94BCCA] p-6`}
      >
        {status === "success" ? (
          <>
            <div className="text-white text-xl font-bold font-['Inter']">Purchase Confirmed</div>
            <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
              Your coverage is active and ready to use.
            </div>

            <div className="mt-4 rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-6 py-3">
              <div className="text-emerald-300 text-lg font-bold font-['Inter']">Success</div>
              <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
                Transaction recorded on-chain.
              </div>
            <div className="mt-2 flex w-full items-center justify-between gap-2 text-stone-300 text-[11px] font-bold font-['Inter']">
                <span className="whitespace-nowrap">Tx: {formatTxHash(txHash ?? MOCK_TX_HASH)}</span>
                <button
                  type="button"
                  onClick={handleCopyTx}
                  className="rounded-md bg-brand-primary px-2.5 py-1 text-[10px] font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
                >
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Policy ID</div>
                <div className="mt-1 text-white text-sm font-bold font-['Inter']">
                  {plan.policyNumber}
                </div>
              </div>
              <div className="rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Coverage Dates</div>
                <div className="mt-1 text-white text-sm font-bold font-['Inter']">
                  {plan.startDate} — {plan.endDate}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <a
                href={`${STELLAR_EXPLORER_TX_URL}${txHash ?? MOCK_TX_HASH}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
              >
                View in Explorer
              </a>
              <button
                type="button"
                onClick={() => onConfirm(buildSuccessPayload(txHash ?? MOCK_TX_HASH))}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
              >
                Go to My Policies
              </button>
            </div>
          </>
        ) : isProcessing ? (
          <>
            <div className="text-white text-xl font-bold font-['Inter']">Processing Transaction</div>
            <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
              This may take a few seconds on Stellar.
            </div>

            <div className="mt-4 rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
              <div className="text-white text-sm font-bold font-['Inter']">Progress</div>
              <div className="mt-2 flex flex-col gap-2 text-xs font-bold font-['Inter']">
                <div className={stepClassName(0)}>
                  <span className="inline-flex items-center gap-2">
                    <span className={indicatorClassName(0)} />
                    Signing transaction in wallet
                  </span>
                </div>
                <div className={stepClassName(1)}>
                  <span className="inline-flex items-center gap-2">
                    <span className={indicatorClassName(1)} />
                    Submitting to Stellar network
                  </span>
                </div>
                <div className={stepClassName(2)}>
                  <span className="inline-flex items-center gap-2">
                    <span className={indicatorClassName(2)} />
                    Confirming on ledger
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : status === "error" ? (
          <>
            <div className="text-white text-xl font-bold font-['Inter']">Transaction Failed</div>
            <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
              We could not confirm this transaction.
            </div>

            <div className="mt-4 rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
              <div className="text-rose-300 text-lg font-bold font-['Inter']">Error</div>
              <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
                {errorMessage ?? "Transaction failed. Please try again."}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startPurchaseFlow}
                disabled={!isWalletConnected}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Try Again
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-white text-xl font-bold font-['Inter']">Confirm Policy Purchase</div>
            <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
              Instant coverage powered by blockchain
            </div>

            <div className="mt-4 rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
              <div className="text-white text-lg font-bold font-['Inter']">{plan.name}</div>
              <div className="mt-1 text-stone-300 text-sm font-bold font-['Inter']">
                {plan.description}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Premium</div>
                <div className="mt-1 text-white text-base font-bold font-['Inter']">{plan.premium}</div>
              </div>
              <div className="rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Duration</div>
                <div className="mt-1 text-white text-base font-bold font-['Inter']">{plan.duration}</div>
              </div>
              <div className="rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Coverage</div>
                <div className="mt-1 text-white text-base font-bold font-['Inter']">{plan.coverage}</div>
              </div>
              <div className="rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Deductible</div>
                <div className="mt-1 text-white text-base font-bold font-['Inter']">{plan.deductible}</div>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 rounded-[8px] border border-[#2b3f62] bg-[#0c1733] px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-stone-300 text-xs font-bold font-['Inter']">Wallet</div>
                {isWalletConnected ? (
                  <div className="mt-1 flex items-center justify-center gap-2 pr-1">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#2b3f62] px-2 py-0.5 text-[11px] font-bold text-stone-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                    <span className="text-white text-[10px] font-mono leading-none whitespace-nowrap">
                      {formatWalletAddress(walletAddress ?? "")}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-stone-300 text-xs font-bold font-['Inter']">
                    Connect your Stellar wallet to activate coverage.
                  </div>
                )}
              </div>
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={() => setWalletAddress(MOCK_WALLET_ADDRESS)}
                  className="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
                >
                  Connect Wallet
                </button>
              ) : null}
            </div>

            <div className="mt-4 text-stone-300 text-xs font-bold font-['Inter']">
              Confirm to activate coverage on the Stellar blockchain.
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={startPurchaseFlow}
                disabled={!isWalletConnected || isProcessing}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm and Sign
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
