import React from "react";

type PolicyListingErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function PolicyListingErrorState({ message, onRetry }: PolicyListingErrorStateProps) {
  return (
    <div className="absolute left-[163px] top-[302px] w-[1121px] h-[623px] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-slate-400 flex flex-col items-center justify-center gap-4">
      <div className="text-white text-xl font-bold font-['Inter']">Error</div>
      <div className="text-stone-300 text-base font-bold font-['Inter']">{message}</div>

      <button
        type="button"
        onClick={onRetry}
        className="px-3.5 py-1.5 bg-white rounded-[5px] outline outline-1 outline-offset-[-1px] outline-black"
      >
        <span className="text-sky-400 text-base font-bold font-['Inter']">Retry</span>
      </button>
    </div>
  );
}
