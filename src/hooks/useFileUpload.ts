'use client';

import { useState, useCallback } from 'react';

export interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress?: number;
}

export interface FileUploadConfig {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  generatePreview?: boolean;
}

export function useFileUpload(config: FileUploadConfig = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    maxFiles = 5,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'],
    generatePreview = true
  } = config;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  const generateFilePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!generatePreview || !file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, [generatePreview]);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newErrors: string[] = [];

    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(`Cannot upload more than ${maxFiles} files`);
      setErrors(newErrors);
      return;
    }

    setIsUploading(true);
    const validFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        continue;
      }

      // Check for duplicates
      const isDuplicate = files.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (isDuplicate) {
        newErrors.push(`File "${file.name}" is already uploaded`);
        continue;
      }

      const preview = await generateFilePreview(file);
      
      validFiles.push({
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        uploadProgress: 100 // Simulate instant upload for now
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
    setErrors(newErrors);
    setIsUploading(false);
  }, [files, maxFiles, validateFile, generateFilePreview]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    // Clear errors when files are removed
    setErrors([]);
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
  }, []);

  const getFileById = useCallback((fileId: string) => {
    return files.find(file => file.id === fileId);
  }, [files]);

  const getTotalSize = useCallback(() => {
    return files.reduce((total, file) => total + file.size, 0);
  }, [files]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    // State
    files,
    isUploading,
    errors,
    
    // Actions
    addFiles,
    removeFile,
    clearAllFiles,
    
    // Utilities
    getFileById,
    getTotalSize,
    formatFileSize,
    
    // Config
    maxFiles,
    maxFileSize,
    acceptedTypes,
    
    // Computed
    hasFiles: files.length > 0,
    hasErrors: errors.length > 0,
    canAddMore: files.length < maxFiles
  };
}