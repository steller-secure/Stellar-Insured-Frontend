import React, { useRef, useState } from 'react';
import { Button } from './Button';

interface FileUploadProps {
    label: string;
    error?: string;
    onChange: (file: File | null) => void;
    accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, error, onChange, accept }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setSelectedFile(file);
        onChange(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-slate-300">
                {label}
            </label>
            <div
                className={`
          relative flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all
          ${dragActive
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-800/50'
                    }
          ${error ? 'border-rose-500' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {selectedFile ? (
                    <div className="flex w-full flex-col items-center p-4">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600/20 text-cyan-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="mb-1 text-sm font-medium text-white">{selectedFile.name}</p>
                        <p className="mb-4 text-xs text-slate-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                            Remove File
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="mb-1 text-sm font-medium text-slate-300">
                            <span
                                className="cursor-pointer text-cyan-400 hover:text-cyan-300 hover:underline"
                                onClick={() => inputRef.current?.click()}
                            >
                                Click to upload
                            </span>{' '}
                            or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                            SVG, PNG, JPG or PDF (max. 10MB)
                        </p>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
        </div>
    );
};
