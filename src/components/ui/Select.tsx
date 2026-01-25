import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                    {label}
                </label>
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
              w-full appearance-none rounded-lg bg-slate-900/50 border-2 px-4 py-3 text-white placeholder-slate-500 transition-colors
              focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-800 hover:border-slate-700'}
              ${className}
            `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled selected>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
                {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
