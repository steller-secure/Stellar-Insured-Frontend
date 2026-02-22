'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockPolicies } from '@/data/mockData';
import type { StepValidation } from '@/hooks/useMultiStepForm';

export interface ClaimAmountData {
  claimAmount: string;
  estimatedLoss: string;
  currency: string;
  breakdown: Array<{
    id: string;
    description: string;
    amount: string;
  }>;
}

export interface ClaimAmountStepProps {
  data: ClaimAmountData;
  policyId: string;
  onDataChange: (data: Partial<ClaimAmountData>) => void;
  onValidation: (validation: StepValidation) => void;
}

export const ClaimAmountStep: React.FC<ClaimAmountStepProps> = ({
  data,
  policyId,
  onDataChange,
  onValidation
}) => {
  const [showBreakdown, setShowBreakdown] = useState(data.breakdown.length > 0);
  const selectedPolicy = mockPolicies.find(p => p.id === policyId);

  // Validate step
  React.useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (!data.claimAmount) {
      errors.claimAmount = 'Please enter the claim amount';
    } else {
      const amount = parseFloat(data.claimAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.claimAmount = 'Please enter a valid amount greater than 0';
      } else if (selectedPolicy && amount > selectedPolicy.coverageLimit) {
        errors.claimAmount = `Amount cannot exceed policy limit of ${selectedPolicy.coverageLimitFormatted}`;
      }
    }

    if (!data.currency) {
      errors.currency = 'Please select a currency';
    }

    const isValid = Object.keys(errors).length === 0;
    onValidation({ isValid, errors });
  }, [data, selectedPolicy, onValidation]);

  const addBreakdownItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      amount: ''
    };
    onDataChange({
      breakdown: [...data.breakdown, newItem]
    });
  };

  const updateBreakdownItem = (id: string, field: 'description' | 'amount', value: string) => {
    const updatedBreakdown = data.breakdown.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onDataChange({ breakdown: updatedBreakdown });
  };

  const removeBreakdownItem = (id: string) => {
    const updatedBreakdown = data.breakdown.filter(item => item.id !== id);
    onDataChange({ breakdown: updatedBreakdown });
  };

  const calculateBreakdownTotal = () => {
    return data.breakdown.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      return total + amount;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD'
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
          Specify the amount you're claiming and provide a breakdown of your losses.
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
          <div>
            <label className="block text-sm font-medium text-white mb-2">Currency</label>
            <select
              value={data.currency}
              onChange={(e) => onDataChange({ currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select currency...</option>
              {currencies.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Claim Amount */}
        <Input
          label="Total Claim Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={data.claimAmount}
          onChange={(e) => onDataChange({ claimAmount: e.target.value })}
          helperText={selectedPolicy ? `Available coverage: ${selectedPolicy.coverageLimitFormatted}` : undefined}
        />

        {/* Estimated Loss */}
        <Input
          label="Estimated Total Loss (Optional)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={data.estimatedLoss}
          onChange={(e) => onDataChange({ estimatedLoss: e.target.value })}
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

              {data.breakdown.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No breakdown items added yet. Click "Add Item" to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.breakdown.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
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
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateBreakdownItem(item.id, 'amount', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => removeBreakdownItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Breakdown Total */}
                  {data.breakdown.length > 0 && (
                    <div className="border-t border-slate-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">Breakdown Total:</span>
                        <span className="text-lg font-semibold text-cyan-400">
                          {data.currency ? formatCurrency(calculateBreakdownTotal()) : `${calculateBreakdownTotal().toFixed(2)}`}
                        </span>
                      </div>
                      {data.claimAmount && calculateBreakdownTotal() !== parseFloat(data.claimAmount) && (
                        <p className="text-xs text-orange-400 mt-1">
                          Note: Breakdown total doesn't match claim amount
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
        {data.claimAmount && data.currency && (
          <Card className="p-4 bg-cyan-500/5 border-cyan-500/20">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-cyan-400">Claim Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Claim Amount:</p>
                  <p className="text-white font-medium">{formatCurrency(parseFloat(data.claimAmount))}</p>
                </div>
                {data.estimatedLoss && (
                  <div>
                    <p className="text-slate-400">Total Estimated Loss:</p>
                    <p className="text-white font-medium">{formatCurrency(parseFloat(data.estimatedLoss))}</p>
                  </div>
                )}
              </div>
              {selectedPolicy && (
                <div className="text-xs text-slate-400">
                  Coverage remaining: {formatCurrency(selectedPolicy.coverageLimit - parseFloat(data.claimAmount))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};