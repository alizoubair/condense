import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Document } from '../../types';
import { documentApi } from '../../services/api';

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
  refreshTrigger?: number;
}

export default function DocumentList({ onDocumentSelect, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentApi.listDocuments();
      setDocuments(response.documents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentApi.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete document');
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
      case 'uploading':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading documents</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={loadDocuments}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by uploading your first document.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div key={document.document_id} className="card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {document.filename}
                  </h3>
                  {getStatusIcon(document.status)}
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatFileSize(document.file_size)}</span>
                  <span>•</span>
                  <span className="capitalize">{document.file_type}</span>
                  <span>•</span>
                  <span>{formatDate(document.created_at)}</span>
                </div>
                
                {document.status === 'processing' && document.processing_step && (
                  <div className="mt-1">
                    <span className="text-xs text-yellow-600 capitalize">
                      {document.processing_step.replace('_', ' ')}
                    </span>
                  </div>
                )}
                
                {document.status === 'failed' && document.error_message && (
                  <div className="mt-1">
                    <span className="text-xs text-red-600">
                      {document.error_message}
                    </span>
                  </div>
                )}
                
                {document.summary && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {document.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {document.status === 'completed' && (
                <button
                  onClick={() => onDocumentSelect?.(document)}
                  className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-primary-50"
                  title="View document"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={() => handleDelete(document.document_id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                title="Delete document"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}