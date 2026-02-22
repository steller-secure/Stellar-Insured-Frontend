'use client';

import React from 'react';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { mockPolicies } from '@/data/mockData';
import type { StepValidation } from '@/hooks/useMultiStepForm';

export interface PolicySelectionData {
  policyId: string;
  incidentType: string;
}

export interface PolicySelectionStepProps {
  data: PolicySelectionData;
  onDataChange: (data: Partial<PolicySelectionData>) => void;
  onValidation: (validation: StepValidation) => void;
}

const incidentTypes = [
  { value: 'wallet-hack', label: 'Wallet Hack / Compromise' },
  { value: 'smart-contract', label: 'Smart Contract Exploit' },
  { value: 'defi-protocol', label: 'DeFi Protocol Hack' },
  { value: 'exchange-hack', label: 'Exchange Security Breach' },
  { value: 'phishing', label: 'Phishing Attack' },
  { value: 'other', label: 'Other Incident' }
];

export const PolicySelectionStep: React.FC<PolicySelectionStepProps> = ({
  data,
  onDataChange,
  onValidation
}) => {
  const selectedPolicy = mockPolicies.find(p => p.id === data.policyId);

  // Validate step
  React.useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (!data.policyId) {
      errors.policyId = 'Please select a policy';
    }
    
    if (!data.incidentType) {
      errors.incidentType = 'Please select an incident type';
    }

    const isValid = Object.keys(errors).length === 0;
    onValidation({ isValid, errors });
  }, [data, onValidation]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Select Policy & Incident Type</h2>
        <p className="text-slate-400">
          Choose the policy you want to file a claim against and specify the type of incident.
        </p>
      </div>

      <div className="space-y-6">
        {/* Policy Selection */}
        <Select
          label="Select Policy"
          placeholder="Choose a policy..."
          options={mockPolicies.map(p => ({
            value: p.id,
            label: `${p.name} (${p.policyNumber})`
          }))}
          value={data.policyId}
          onChange={(e) => onDataChange({ policyId: e.target.value })}
        />

        {/* Selected Policy Details */}
        {selectedPolicy && (
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{selectedPolicy.name}</h3>
                  <p className="text-sm text-slate-400">Policy #{selectedPolicy.policyNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Coverage Limit</p>
                  <p className="text-lg font-semibold text-green-400">
                    {selectedPolicy.coverageLimitFormatted}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedPolicy.type === 'Health' ? 'bg-blue-500/20 text-blue-400' :
                  selectedPolicy.type === 'Auto' ? 'bg-green-500/20 text-green-400' :
                  selectedPolicy.type === 'Home' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {selectedPolicy.type}
                </span>
                <span className="text-xs text-slate-500">Active Policy</span>
              </div>
            </div>
          </Card>
        )}

        {/* Incident Type Selection */}
        <Select
          label="Incident Type"
          placeholder="Select the type of incident..."
          options={incidentTypes}
          value={data.incidentType}
          onChange={(e) => onDataChange({ incidentType: e.target.value })}
        />

        {/* Incident Type Description */}
        {data.incidentType && (
          <Card className="p-4 bg-cyan-500/5 border-cyan-500/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400">
                  {incidentTypes.find(t => t.value === data.incidentType)?.label}
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  {data.incidentType === 'wallet-hack' && 'Claims related to unauthorized access to your cryptocurrency wallet or private keys.'}
                  {data.incidentType === 'smart-contract' && 'Claims for losses due to vulnerabilities or exploits in smart contracts.'}
                  {data.incidentType === 'defi-protocol' && 'Claims related to security breaches or hacks in DeFi protocols.'}
                  {data.incidentType === 'exchange-hack' && 'Claims for losses due to security breaches at cryptocurrency exchanges.'}
                  {data.incidentType === 'phishing' && 'Claims related to losses from phishing attacks or social engineering.'}
                  {data.incidentType === 'other' && 'Other types of incidents not covered by the above categories.'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};