import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ChatInterface from '../components/Chat/ChatInterface';
import DocumentList from '../components/Documents/DocumentList';
import { Document } from '../types';
import { documentApi } from '../services/api';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const documentId = searchParams.get('document');
    if (documentId) {
      loadDocument(documentId);
    }
  }, [searchParams]);

  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const document = await documentApi.getDocument(documentId);
      if (document.status === 'completed') {
        setSelectedDocument(document);
      } else {
        alert('Document is not ready for chat yet. Please wait for processing to complete.');
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      alert('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    if (document.status === 'completed') {
      setSelectedDocument(document);
      setShowDocumentSelector(false);
    } else {
      alert('Please select a completed document to start chatting.');
    }
  };

  const openDocumentSelector = () => {
    setShowDocumentSelector(true);
  };

  const closeDocumentSelector = () => {
    setShowDocumentSelector(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat with Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ask questions about your documents and get AI-powered answers
        </p>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 card p-0 overflow-hidden">
        <ChatInterface
          selectedDocument={selectedDocument || undefined}
          onDocumentSelect={openDocumentSelector}
        />
      </div>

      {/* Document Selector Modal */}
      <Dialog
        open={showDocumentSelector}
        onClose={closeDocumentSelector}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Select a Document
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a completed document to start chatting
                </p>
              </div>
              <button
                onClick={closeDocumentSelector}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Document List */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <DocumentList
                onDocumentSelect={handleDocumentSelect}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}