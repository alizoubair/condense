import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { documentApi } from '../../services/api';
import { UploadProgress } from '../../types';

interface FileUploadProps {
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ onUploadComplete, onUploadError }: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const uploadId = `${file.name}-${Date.now()}`;
      
      // Add to uploads list
      setUploads(prev => [...prev, {
        filename: file.name,
        progress: 0,
        status: 'uploading',
      }]);

      try {
        // Update progress to show upload started
        setUploads(prev => prev.map(upload => 
          upload.filename === file.name 
            ? { ...upload, progress: 10 }
            : upload
        ));

        // Upload file
        const document = await documentApi.uploadDocument(file);

        // Update to processing
        setUploads(prev => prev.map(upload => 
          upload.filename === file.name 
            ? { ...upload, progress: 50, status: 'processing' }
            : upload
        ));

        // Poll for completion
        pollDocumentStatus(document.document_id, file.name);
        
        onUploadComplete?.(document.document_id);

      } catch (error) {
        console.error('Upload failed:', error);
        setUploads(prev => prev.map(upload => 
          upload.filename === file.name 
            ? { 
                ...upload, 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : upload
        ));
        onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      }
    }
  }, [onUploadComplete, onUploadError]);

  const pollDocumentStatus = async (documentId: string, filename: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await documentApi.getDocumentStatus(documentId);
        
        setUploads(prev => prev.map(upload => 
          upload.filename === filename 
            ? { 
                ...upload, 
                progress: status.progress,
                status: status.status
              }
            : upload
        ));

        if (status.status === 'completed' || status.status === 'failed') {
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Status polling failed:', error);
      }
    };

    poll();
  };

  const removeUpload = (filename: string) => {
    setUploads(prev => prev.filter(upload => upload.filename !== filename));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200',
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Upload documents'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Drag and drop files here, or click to select files
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Supports PDF, TXT, MD, DOCX, and images (max 10MB)
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Upload Progress</h3>
          {uploads.map((upload) => (
            <div key={upload.filename} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {upload.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {upload.status === 'uploading' && 'Uploading...'}
                      {upload.status === 'processing' && 'Processing...'}
                      {upload.status === 'completed' && 'Completed'}
                      {upload.status === 'failed' && `Failed: ${upload.error}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeUpload(upload.filename)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={clsx(
                      'h-2 rounded-full transition-all duration-300',
                      upload.status === 'failed' ? 'bg-red-500' : 'bg-primary-600'
                    )}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{upload.progress}%</span>
                  <span className="capitalize">{upload.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}