'use client';

import React, { useRef } from 'react';
import { useFileUpload, type FileUploadConfig } from '@/hooks/useFileUpload';

export interface FileUploadWithPreviewProps extends FileUploadConfig {
  label?: string;
  error?: string;
  helperText?: string;
  onFilesChange?: (files: File[]) => void;
}

export const FileUploadWithPreview: React.FC<FileUploadWithPreviewProps> = ({
  label,
  error,
  helperText,
  onFilesChange,
  ...config
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    isUploading,
    errors,
    addFiles,
    removeFile,
    formatFileSize,
    acceptedTypes,
    maxFileSize,
    canAddMore
  } = useFileUpload(config);

  // Notify parent component when files change
  React.useEffect(() => {
    if (onFilesChange) {
      onFilesChange(files.map(f => f.file));
    }
  }, [files, onFilesChange]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      await addFiles(selectedFiles);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      await addFiles(droppedFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            error 
              ? 'border-red-500 bg-red-500/5' 
              : 'border-slate-600 bg-slate-800/50 hover:border-cyan-400 hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-white">
              <span className="font-medium">Click to upload</span> or drag and drop
            </div>
            <p className="text-sm text-slate-400">
              {acceptedTypes.join(', ')} up to {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(error || errors.length > 0) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {errors.map((err, index) => (
            <p key={index} className="text-sm text-red-400">{err}</p>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && errors.length === 0 && (
        <p className="text-sm text-slate-400">{helperText}</p>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-cyan-400">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing files...</span>
        </div>
      )}
    </div>
  );
};