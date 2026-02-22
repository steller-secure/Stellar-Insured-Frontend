'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import type { StepValidation } from '@/hooks/useMultiStepForm';

export interface IncidentDetailsData {
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  immediateActions: string;
}

export interface IncidentDetailsStepProps {
  data: IncidentDetailsData;
  onDataChange: (data: Partial<IncidentDetailsData>) => void;
  onValidation: (validation: StepValidation) => void;
}

export const IncidentDetailsStep: React.FC<IncidentDetailsStepProps> = ({
  data,
  onDataChange,
  onValidation
}) => {
  // Validate step
  React.useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (!data.incidentDate) {
      errors.incidentDate = 'Please provide the incident date';
    } else {
      const incidentDate = new Date(data.incidentDate);
      const today = new Date();
      if (incidentDate > today) {
        errors.incidentDate = 'Incident date cannot be in the future';
      }
    }
    
    if (!data.description) {
      errors.description = 'Please provide a detailed description';
    } else if (data.description.length < 50) {
      errors.description = 'Description must be at least 50 characters';
    }

    const isValid = Object.keys(errors).length === 0;
    onValidation({ isValid, errors });
  }, [data, onValidation]);

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
          <Input
            label="Incident Date"
            type="date"
            value={data.incidentDate}
            onChange={(e) => onDataChange({ incidentDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Approximate Time (Optional)"
            type="time"
            value={data.incidentTime}
            onChange={(e) => onDataChange({ incidentTime: e.target.value })}
          />
        </div>

        {/* Date Preview */}
        {data.incidentDate && (
          <Card className="p-3 bg-slate-800/30 border-slate-700">
            <p className="text-sm text-slate-400">
              Incident occurred on: <span className="text-white font-medium">{formatDate(data.incidentDate)}</span>
              {data.incidentTime && (
                <span> at <span className="text-white font-medium">{data.incidentTime}</span></span>
              )}
            </p>
          </Card>
        )}

        {/* Location */}
        <Input
          label="Location (Optional)"
          placeholder="e.g., Online, New York, Home, etc."
          value={data.location}
          onChange={(e) => onDataChange({ location: e.target.value })}
          helperText="Where did the incident occur? This can be physical or digital location."
        />

        {/* Description */}
        <Textarea
          label="Detailed Description"
          placeholder="Please provide a comprehensive description of what happened. Include:
• What exactly occurred?
• How did you discover the incident?
• What assets or systems were affected?
• Any suspicious activities you noticed?
• Timeline of events..."
          value={data.description}
          onChange={(e) => onDataChange({ description: e.target.value })}
          rows={8}
          helperText={`${data.description.length}/50 characters minimum`}
        />

        {/* Immediate Actions */}
        <Textarea
          label="Immediate Actions Taken (Optional)"
          placeholder="Describe any immediate steps you took after discovering the incident:
• Did you contact any authorities?
• Did you change passwords or secure accounts?
• Did you notify your bank or exchange?
• Any other protective measures..."
          value={data.immediateActions}
          onChange={(e) => onDataChange({ immediateActions: e.target.value })}
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
              <h4 className="text-sm font-medium text-blue-400">Tips for Better Claims Processing</h4>
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