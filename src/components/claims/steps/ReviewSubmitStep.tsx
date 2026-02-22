'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockPolicies } from '@/data/mockData';
import type { StepValidation } from '@/hooks/useMultiStepForm';

export interface ReviewSubmitData {
  agreedToTerms: boolean;
  confirmAccuracy: boolean;
}

export interface ReviewSubmitStepProps {
  data: ReviewSubmitData;
  formData: any; // Full form data from all steps
  onDataChange: (data: Partial<ReviewSubmitData>) => void;
  onValidation: (validation: StepValidation) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  data,
  formData,
  onDataChange,
  onValidation,
  onSubmit,
  isSubmitting
}) => {
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const selectedPolicy = mockPolicies.find(p => p.id === formData.policyId);

  // Validate step
  React.useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (!data.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and conditions';
    }
    
    if (!data.confirmAccuracy) {
      errors.confirmAccuracy = 'You must confirm the accuracy of the information';
    }

    const isValid = Object.keys(errors).length === 0;
    onValidation({ isValid, errors });
  }, [data, onValidation]);

  const formatCurrency = (amount: string | number, currency: string = 'USD') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getIncidentTypeLabel = (type: string) => {
    const types = {
      'wallet-hack': 'Wallet Hack / Compromise',
      'smart-contract': 'Smart Contract Exploit',
      'defi-protocol': 'DeFi Protocol Hack',
      'exchange-hack': 'Exchange Security Breach',
      'phishing': 'Phishing Attack',
      'other': 'Other Incident'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Review & Submit Claim</h2>
        <p className="text-slate-400">
          Please review all information carefully before submitting your claim.
        </p>
      </div>

      <div className="space-y-6">
        {/* Policy & Incident Summary */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Policy & Incident Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Policy</p>
                <p className="text-white font-medium">{selectedPolicy?.name}</p>
                <p className="text-xs text-slate-500">#{selectedPolicy?.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Incident Type</p>
                <p className="text-white">{getIncidentTypeLabel(formData.incidentType)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Incident Date</p>
                <p className="text-white">{formatDate(formData.incidentDate)}</p>
                {formData.incidentTime && (
                  <p className="text-xs text-slate-500">at {formData.incidentTime}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Location</p>
                <p className="text-white">{formData.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Coverage Limit</p>
                <p className="text-green-400 font-semibold">{selectedPolicy?.coverageLimitFormatted}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Claim Amount Summary */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Claim Amount</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Claim Amount:</span>
              <span className="text-xl font-bold text-cyan-400">
                {formatCurrency(formData.claimAmount, formData.currency)}
              </span>
            </div>
            {formData.estimatedLoss && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Estimated Loss:</span>
                <span className="text-white font-medium">
                  {formatCurrency(formData.estimatedLoss, formData.currency)}
                </span>
              </div>
            )}
            
            {/* Loss Breakdown */}
            {formData.breakdown && formData.breakdown.length > 0 && (
              <div className="border-t border-slate-600 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">Loss Breakdown</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullBreakdown(!showFullBreakdown)}
                  >
                    {showFullBreakdown ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                {showFullBreakdown && (
                  <div className="space-y-2">
                    {formData.breakdown.map((item: any, index: number) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">{item.description}</span>
                        <span className="text-white">
                          {formatCurrency(item.amount, formData.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Incident Description */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Incident Description</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">What happened:</p>
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-white text-sm leading-relaxed">{formData.description}</p>
              </div>
            </div>
            {formData.immediateActions && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Immediate actions taken:</p>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-white text-sm leading-relaxed">{formData.immediateActions}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Documents Summary */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Supporting Documents</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Documents:</span>
              <span className="text-white font-medium">{formData.documents?.length || 0} files</span>
            </div>
            {formData.documents && formData.documents.length > 0 && (
              <div className="space-y-2">
                {formData.documents.slice(0, 3).map((doc: File, index: number) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white truncate">{doc.name}</span>
                    <span className="text-slate-400">
                      ({Math.round(doc.size / 1024)} KB)
                    </span>
                  </div>
                ))}
                {formData.documents.length > 3 && (
                  <p className="text-xs text-slate-400">
                    +{formData.documents.length - 3} more files
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Terms and Confirmations */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Terms & Confirmations</h3>
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.confirmAccuracy}
                onChange={(e) => onDataChange({ confirmAccuracy: e.target.checked })}
                className="mt-1 w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500"
              />
              <div className="text-sm">
                <p className="text-white font-medium">I confirm the accuracy of this information</p>
                <p className="text-slate-400 mt-1">
                  I certify that all information provided in this claim is true and accurate to the best of my knowledge.
                  I understand that providing false information may result in claim denial and potential legal consequences.
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.agreedToTerms}
                onChange={(e) => onDataChange({ agreedToTerms: e.target.checked })}
                className="mt-1 w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500"
              />
              <div className="text-sm">
                <p className="text-white font-medium">I agree to the terms and conditions</p>
                <p className="text-slate-400 mt-1">
                  I agree to the claims processing terms, privacy policy, and understand that this claim will be 
                  investigated according to policy terms. I authorize the release of relevant information for claim processing.
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={!data.agreedToTerms || !data.confirmAccuracy}
            size="lg"
            className="min-w-[200px]"
          >
            {isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
          </Button>
        </div>

        {/* Submission Info */}
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400">What happens next?</h4>
              <ul className="text-sm text-slate-400 mt-1 space-y-1">
                <li>• You'll receive a confirmation email with your claim reference number</li>
                <li>• Our claims team will review your submission within 2-3 business days</li>
                <li>• You may be contacted for additional information or clarification</li>
                <li>• You can track your claim status in your dashboard</li>
                <li>• Processing typically takes 5-10 business days for standard claims</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};