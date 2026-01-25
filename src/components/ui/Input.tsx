import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    {label}
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        className={`
              w-full rounded-lg bg-slate-900/50 border-2 px-4 py-3 text-white placeholder-slate-500 transition-colors
              focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-800 hover:border-slate-700'}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {(error || helperText) && (
                    <p className={`mt-1 text-sm ${error ? 'text-rose-400' : 'text-slate-400'}`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
