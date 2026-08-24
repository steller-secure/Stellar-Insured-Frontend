'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormInput } from '@/components/ui/rhf/FormInput';
import { FormTextarea } from '@/components/ui/rhf/FormTextarea';
import { Card } from '@/components/ui/Card';
import type { MultiStepClaimFormValues } from '@/lib/form-schemas';

export const IncidentDetailsStep: React.FC = () => {
  const { control, watch } = useFormContext<MultiStepClaimFormValues>();
  const incidentDate = watch('incidentDate');
  const incidentTime = watch('incidentTime');
  const description = watch('description');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Incident Details</h2>
        <p className="text-slate-400">
          Provide detailed information about when and how the incident occurred.
        </p>
      </div>

      <div className="space-y-6">
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="incidentDate"
            control={control}
            label="Incident Date"
            type="date"
            max={new Date().toISOString().split('T')[0]}
          />
          <FormInput
            name="incidentTime"
            control={control}
            label="Approximate Time (Optional)"
            type="time"
          />
        </div>

        {/* Date Preview */}
        {incidentDate && (
          <Card className="p-3 bg-slate-800/30 border-slate-700">
            <p className="text-sm text-slate-400">
              Incident occurred on: <span className="text-white font-medium">{formatDate(incidentDate)}</span>
              {incidentTime && (
                <span> at <span className="text-white font-medium">{incidentTime}</span></span>
              )}
            </p>
          </Card>
        )}

        {/* Location */}
        <FormInput
          name="location"
          control={control}
          label="Location (Optional)"
          placeholder="e.g., Online, New York, Home, etc."
          helperText="Where did the incident occur? This can be physical or digital location."
        />

        {/* Description */}
        <FormTextarea
          name="description"
          control={control}
          label="Detailed Description"
          placeholder="Please provide a comprehensive description of what happened. Include:
• What exactly occurred?
• How did you discover the incident?
• What assets or systems were affected?
• Any suspicious activities you noticed?
• Timeline of events..."
          rows={8}
          helperText={`${description.length}/50 characters minimum`}
        />

        {/* Immediate Actions */}
        <FormTextarea
          name="immediateActions"
          control={control}
          label="Immediate Actions Taken (Optional)"
          placeholder="Describe any immediate steps you took after discovering the incident:
• Did you contact any authorities?
• Did you change passwords or secure accounts?
• Did you notify your bank or exchange?
• Any other protective measures..."
          rows={4}
          helperText="This information helps us understand the scope and your response to the incident."
        />

        {/* Tips Card */}
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-400">Tips for Better Claims Processing</h3>
              <ul className="text-sm text-slate-400 mt-1 space-y-1">
                <li>• Be as specific as possible with dates and times</li>
                <li>• Include transaction IDs, wallet addresses, or other relevant identifiers</li>
                <li>• Mention any error messages or unusual behavior you observed</li>
                <li>• Describe the financial impact and affected assets</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};