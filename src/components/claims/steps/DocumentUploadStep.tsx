'use client';

import React from 'react';
import { FileUploadWithPreview } from '@/components/ui/FileUploadWithPreview';
import { Card } from '@/components/ui/Card';
import type { StepValidation } from '@/hooks/useMultiStepForm';

export interface DocumentUploadData {
  documents: File[];
  documentTypes: Record<string, boolean>;
}

export interface DocumentUploadStepProps {
  data: DocumentUploadData;
  onDataChange: (data: Partial<DocumentUploadData>) => void;
  onValidation: (validation: StepValidation) => void;
}

const requiredDocumentTypes = [
  {
    id: 'incident-report',
    title: 'Incident Report',
    description: 'Police report, exchange notification, or official incident documentation',
    required: true
  },
  {
    id: 'proof-of-loss',
    title: 'Proof of Loss',
    description: 'Screenshots, transaction records, wallet statements showing the loss',
    required: true
  },
  {
    id: 'identity-verification',
    title: 'Identity Verification',
    description: 'Government-issued ID or passport for verification',
    required: true
  }
];

const optionalDocumentTypes = [
  {
    id: 'communication-records',
    title: 'Communication Records',
    description: 'Emails, chat logs, or correspondence related to the incident',
    required: false
  },
  {
    id: 'technical-evidence',
    title: 'Technical Evidence',
    description: 'Error messages, logs, blockchain transaction details',
    required: false
  },
  {
    id: 'expert-analysis',
    title: 'Expert Analysis',
    description: 'Third-party security analysis or forensic reports',
    required: false
  },
  {
    id: 'additional-evidence',
    title: 'Additional Evidence',
    description: 'Any other supporting documentation',
    required: false
  }
];

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  data,
  onDataChange,
  onValidation
}) => {
  // Validate step
  React.useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (data.documents.length === 0) {
      errors.documents = 'Please upload at least one supporting document';
    }

    // Check if required document types are acknowledged
    const requiredTypesChecked = requiredDocumentTypes.every(type => 
      data.documentTypes[type.id] === true
    );

    if (!requiredTypesChecked) {
      errors.documentTypes = 'Please confirm you have the required document types';
    }

    const isValid = Object.keys(errors).length === 0;
    onValidation({ isValid, errors });
  }, [data, onValidation]);

  const handleDocumentTypeChange = (typeId: string, checked: boolean) => {
    onDataChange({
      documentTypes: {
        ...data.documentTypes,
        [typeId]: checked
      }
    });
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'incident-report':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'proof-of-loss':
        return (
          <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
      case 'identity-verification':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Upload Supporting Documents</h2>
        <p className="text-slate-400">
          Upload all relevant documents to support your claim. Required documents are marked below.
        </p>
      </div>

      <div className="space-y-6">
        {/* Required Documents Checklist */}
        <Card className="p-4 bg-red-500/5 border-red-500/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-red-400">Required Documents</h3>
            </div>
            <div className="space-y-3">
              {requiredDocumentTypes.map((docType) => (
                <label key={docType.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.documentTypes[docType.id] || false}
                    onChange={(e) => handleDocumentTypeChange(docType.id, e.target.checked)}
                    className="mt-1 w-4 h-4 text-red-500 bg-slate-800 border-slate-600 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getDocumentTypeIcon(docType.id)}
                      <span className="text-sm font-medium text-white">{docType.title}</span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Required</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{docType.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Optional Documents Checklist */}
        <Card className="p-4 bg-slate-800/30 border-slate-700">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-white">Optional Documents</h3>
              <span className="text-xs text-slate-400">(Recommended for faster processing)</span>
            </div>
            <div className="space-y-3">
              {optionalDocumentTypes.map((docType) => (
                <label key={docType.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.documentTypes[docType.id] || false}
                    onChange={(e) => handleDocumentTypeChange(docType.id, e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getDocumentTypeIcon(docType.id)}
                      <span className="text-sm font-medium text-white">{docType.title}</span>
                      <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">Optional</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{docType.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <FileUploadWithPreview
          label="Upload Documents"
          maxFiles={10}
          maxFileSize={25 * 1024 * 1024} // 25MB
          acceptedTypes={['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.txt']}
          generatePreview={true}
          onFilesChange={(files) => onDataChange({ documents: files })}
          helperText="Accepted formats: PDF, Images (PNG, JPG), Word documents, Text files. Maximum 25MB per file."
        />

        {/* Upload Tips */}
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400">Document Upload Tips</h4>
              <ul className="text-sm text-slate-400 mt-1 space-y-1">
                <li>• Ensure all documents are clear and readable</li>
                <li>• Include transaction IDs, wallet addresses, and timestamps when possible</li>
                <li>• Screenshots should show full context (browser URL, timestamps, etc.)</li>
                <li>• Redact sensitive personal information except what's necessary for the claim</li>
                <li>• Organize documents by type for easier review</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Upload Status */}
        {data.documents.length > 0 && (
          <Card className="p-4 bg-green-500/5 border-green-500/20">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-400">
                  {data.documents.length} Document{data.documents.length !== 1 ? 's' : ''} Uploaded
                </h4>
                <p className="text-xs text-slate-400">
                  Your documents are ready for submission. You can add more or proceed to review.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};