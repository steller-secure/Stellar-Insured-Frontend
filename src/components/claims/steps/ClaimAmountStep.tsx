'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormInput } from '@/components/ui/rhf/FormInput';
import { FormSelect } from '@/components/ui/rhf/FormSelect';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePolicyQuery } from '@/hooks/queries/usePolicies';
import { setMultiStepClaimPolicy } from '@/lib/form-schemas';
import type { MultiStepClaimFormValues } from '@/lib/form-schemas';

interface BreakdownItem {
  id: string;
  description: string;
  amount: string;
}

export const ClaimAmountStep: React.FC = () => {
  const { control, watch, getValues, setValue, trigger } =
    useFormContext<MultiStepClaimFormValues>();
  const [showBreakdown, setShowBreakdown] = useState(
    () => getValues('breakdown').length > 0
  );

  const policyId = watch('policyId');
  const claimAmount = watch('claimAmount');
  const currency = watch('currency');
  const estimatedLoss = watch('estimatedLoss');
  const breakdown = watch('breakdown');

  // Fetch the selected policy with caching
  const { data: selectedPolicy } = usePolicyQuery(policyId);

  // Feed the selected policy's coverage into the shared schema and re-validate
  // the claim amount so the coverage-limit check stays in sync with RHF.
  useEffect(() => {
    setMultiStepClaimPolicy(
      selectedPolicy
        ? {
            coverageLimit: selectedPolicy.coverageLimit,
            coverageLimitFormatted: selectedPolicy.coverageLimitFormatted,
          }
        : null
    );
    if (selectedPolicy) {
      void trigger('claimAmount');
    }
  }, [selectedPolicy, trigger]);

  const addBreakdownItem = () => {
    const current = getValues('breakdown');
    const newItem: BreakdownItem = {
      id: Date.now().toString(),
      description: '',
      amount: ''
    };
    setValue('breakdown', [...current, newItem], { shouldDirty: true });
  };

  const updateBreakdownItem = (id: string, field: 'description' | 'amount', value: string) => {
    const updated = getValues('breakdown').map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setValue('breakdown', updated, { shouldDirty: true });
  };

  const removeBreakdownItem = (id: string) => {
    const updated = getValues('breakdown').filter(item => item.id !== id);
    setValue('breakdown', updated, { shouldDirty: true });
  };

  const calculateBreakdownTotal = () => {
    return breakdown.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      return total + amount;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'BTC', label: 'BTC - Bitcoin' },
    { value: 'ETH', label: 'ETH - Ethereum' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Claim Amount & Loss Details</h2>
        <p className="text-slate-400">
          Specify the amount you&apos;re claiming and provide a breakdown of your losses.
        </p>
      </div>

      <div className="space-y-6">
        {/* Policy Coverage Info */}
        {selectedPolicy && (
          <Card className="p-4 bg-green-500/5 border-green-500/20">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-green-400">Policy Coverage</h3>
                <p className="text-xs text-slate-400">{selectedPolicy.name}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-400">
                  {selectedPolicy.coverageLimitFormatted}
                </p>
                <p className="text-xs text-slate-400">Maximum Coverage</p>
              </div>
            </div>
          </Card>
        )}

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            name="currency"
            control={control}
            label="Currency"
            placeholder="Select currency..."
            options={currencies}
          />
        </div>

        {/* Claim Amount */}
        <FormInput
          name="claimAmount"
          control={control}
          label="Total Claim Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          helperText={selectedPolicy ? `Available coverage: ${selectedPolicy.coverageLimitFormatted}` : undefined}
        />

        {/* Estimated Loss */}
        <FormInput
          name="estimatedLoss"
          control={control}
          label="Estimated Total Loss (Optional)"
          type="number"
          step="0.01"
          placeholder="0.00"
          helperText="If your total loss exceeds the claim amount, specify the full estimated loss here"
        />

        {/* Loss Breakdown Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Loss Breakdown</h3>
            <p className="text-xs text-slate-400">Provide detailed breakdown of your losses (optional but recommended)</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? 'Hide' : 'Show'} Breakdown
          </Button>
        </div>

        {/* Loss Breakdown */}
        {showBreakdown && (
          <Card className="p-4 bg-slate-800/30 border-slate-700">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-white">Itemized Loss Breakdown</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBreakdownItem}
                >
                  Add Item
                </Button>
              </div>

              {breakdown.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No breakdown items added yet. Click &quot;Add Item&quot; to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {breakdown.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          aria-label={`Breakdown item ${index + 1} description`}
                          placeholder="Description (e.g., Bitcoin wallet loss)"
                          value={item.description}
                          onChange={(e) => updateBreakdownItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          step="0.01"
                          aria-label={`Breakdown item ${index + 1} amount`}
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateBreakdownItem(item.id, 'amount', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBreakdownItem(item.id)}
                        aria-label={`Remove breakdown item ${index + 1}`}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Breakdown Total */}
                  {breakdown.length > 0 && (
                    <div className="border-t border-slate-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">Breakdown Total:</span>
                        <span className="text-lg font-semibold text-cyan-400">
                          {currency ? formatCurrency(calculateBreakdownTotal()) : `${calculateBreakdownTotal().toFixed(2)}`}
                        </span>
                      </div>
                      {claimAmount && calculateBreakdownTotal() !== parseFloat(claimAmount) && (
                        <p className="text-xs text-orange-400 mt-1">
                          Note: Breakdown total doesn&apos;t match claim amount
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Claim Summary */}
        {claimAmount && currency && (
          <Card className="p-4 bg-cyan-500/5 border-cyan-500/20">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-cyan-400">Claim Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Claim Amount:</p>
                  <p className="text-white font-medium">{formatCurrency(parseFloat(claimAmount))}</p>
                </div>
                {estimatedLoss && (
                  <div>
                    <p className="text-slate-400">Total Estimated Loss:</p>
                    <p className="text-white font-medium">{formatCurrency(parseFloat(estimatedLoss))}</p>
                  </div>
                )}
              </div>
              {selectedPolicy && (
                <div className="text-xs text-slate-400">
                  Coverage remaining: {formatCurrency(selectedPolicy.coverageLimit - parseFloat(claimAmount))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};