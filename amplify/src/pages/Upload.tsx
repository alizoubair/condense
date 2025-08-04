import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/Upload/FileUpload';

export default function Upload() {
  const navigate = useNavigate();

  const handleUploadComplete = (documentId: string) => {
    console.log('Upload completed:', documentId);
    // Could show a success message or redirect
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Could show an error toast
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your documents to get AI-powered summaries and chat capabilities
        </p>
      </div>

      {/* Upload Component */}
      <div className="card">
        <FileUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Help Section */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Supported File Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Documents</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF files (.pdf)</li>
              <li>• Word documents (.docx)</li>
              <li>• Plain text (.txt)</li>
              <li>• Markdown (.md)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Images</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PNG images (.png)</li>
              <li>• JPEG images (.jpg, .jpeg)</li>
              <li>• TIFF images (.tiff)</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            Processing Information
          </h3>
          <p className="text-sm text-blue-700">
            After upload, your documents will be processed using AI to extract text, 
            generate embeddings for search, and create summaries. This typically takes 
            1-3 minutes depending on document size.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/documents')}
          className="btn-secondary"
        >
          View My Documents
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="btn-primary"
        >
          Start Chatting
        </button>
      </div>
    </div>
  );
}