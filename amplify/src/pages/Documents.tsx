import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DocumentList from '../components/Documents/DocumentList';
import { Document } from '../types';

export default function Documents() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const closeModal = () => {
    setSelectedDocument(null);
  };

  const refreshDocuments = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view your uploaded documents
          </p>
        </div>
        <button
          onClick={refreshDocuments}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>

      {/* Document List */}
      <div className="card">
        <DocumentList
          onDocumentSelect={handleDocumentSelect}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Document Detail Modal */}
      <Dialog
        open={!!selectedDocument}
        onClose={closeModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden">
            {selectedDocument && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      {selectedDocument.filename}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-gray-500">
                      Uploaded on {new Date(selectedDocument.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Document Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Document Details
                      </h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">File Type:</dt>
                          <dd className="text-gray-900 uppercase">{selectedDocument.file_type}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">File Size:</dt>
                          <dd className="text-gray-900">
                            {(selectedDocument.file_size / 1024).toFixed(1)} KB
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Status:</dt>
                          <dd className="text-gray-900 capitalize">{selectedDocument.status}</dd>
                        </div>
                        {selectedDocument.embeddings_count && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Embeddings:</dt>
                            <dd className="text-gray-900">{selectedDocument.embeddings_count}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Processing Info
                      </h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Created:</dt>
                          <dd className="text-gray-900">
                            {new Date(selectedDocument.created_at).toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Updated:</dt>
                          <dd className="text-gray-900">
                            {new Date(selectedDocument.updated_at).toLocaleString()}
                          </dd>
                        </div>
                        {selectedDocument.processing_step && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Step:</dt>
                            <dd className="text-gray-900 capitalize">
                              {selectedDocument.processing_step.replace('_', ' ')}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedDocument.summary && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Summary
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedDocument.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {selectedDocument.error_message && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-red-900 mb-2">
                        Error Details
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">
                          {selectedDocument.error_message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    {selectedDocument.status === 'completed' && (
                      <a
                        href={`/chat?document=${selectedDocument.document_id}`}
                        className="btn-primary"
                      >
                        Chat with Document
                      </a>
                    )}
                    <button
                      onClick={closeModal}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}