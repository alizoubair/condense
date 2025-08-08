import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { documentApi } from '../services/api';
import { Document } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    completedDocuments: 0,
    processingDocuments: 0,
    failedDocuments: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await documentApi.listDocuments(10);
      const documents = response.documents;
      
      setRecentDocuments(documents);
      setStats({
        totalDocuments: documents.length,
        completedDocuments: documents.filter(d => d.status === 'completed').length,
        processingDocuments: documents.filter(d => d.status === 'processing' || d.status === 'uploading').length,
        failedDocuments: documents.filter(d => d.status === 'failed').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Documents',
      value: stats.totalDocuments,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Completed',
      value: stats.completedDocuments,
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Processing',
      value: stats.processingDocuments,
      icon: CloudArrowUpIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Failed',
      value: stats.failedDocuments,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your documents today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="card flex-1 min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Documents</h2>
          <a
            href="/documents"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </a>
        </div>
        
        {recentDocuments.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first document.
            </p>
            <div className="mt-6">
              <a href="/upload" className="btn-primary">
                Upload Document
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDocuments.slice(0, 5).map((document) => (
              <div
                key={document.document_id}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {document.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      document.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : document.status === 'processing' || document.status === 'uploading'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {document.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="/upload"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <CloudArrowUpIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Upload Document</h3>
              <p className="text-xs text-gray-500">Add a new document to analyze</p>
            </div>
          </div>
        </a>

        <a
          href="/documents"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Browse Documents</h3>
              <p className="text-xs text-gray-500">View all your documents</p>
            </div>
          </div>
        </a>

        <a
          href="/chat"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Start Chat</h3>
              <p className="text-xs text-gray-500">Ask questions about documents</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}